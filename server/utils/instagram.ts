import { EMPTY_INSTAGRAM_FEED, instagramCode } from '#shared/utils/instagram'
import type { InstagramFeed, InstagramPost } from '#shared/utils/instagram'
import { eq } from 'drizzle-orm'
import { siteContent } from '../database/schema'
import { useDb } from './db'

// The restaurant's own Instagram posts, through Instagram's official API
// ("Instagram API with Instagram Login", for Business and Creator accounts).
//
// Setup: put a long-lived access token in INSTAGRAM_ACCESS_TOKEN. Tokens last
// 60 days; this file renews it weekly and keeps the renewed one in the
// database (key "instagram_token", which the content sync scripts never copy).
// Pasting a new token into the variable replaces the stored one.

const API = 'https://graph.instagram.com'
const TOKEN_KEY = 'instagram_token'
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000
// Video links from Instagram expire after a few days, so posts are re-fetched
// well within that.
const CACHE_MS = 30 * 60 * 1000

interface StoredToken { token: string, seed: string, refreshedAt: string }

const seedToken = () => (process.env.INSTAGRAM_ACCESS_TOKEN || '').trim()

async function igGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${API}${path}?${new URLSearchParams(params)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || `Instagram answered ${res.status}`)
  return body as T
}

// The token to use: the stored, renewed one, unless the variable now holds a
// different token than the one it was renewed from.
async function getToken() {
  const seed = seedToken()
  if (!seed) return ''

  const db = useDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.key, TOKEN_KEY)).limit(1)
  const stored = row?.value as StoredToken | undefined
  let current: StoredToken = stored && stored.seed === seed ? stored : { token: seed, seed, refreshedAt: new Date(0).toISOString() }

  if (Date.now() - new Date(current.refreshedAt).getTime() > REFRESH_AFTER_MS) {
    try {
      const { access_token } = await igGet<{ access_token: string }>('/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: current.token })
      current = { token: access_token, seed, refreshedAt: new Date().toISOString() }
      await db.insert(siteContent)
        .values({ key: TOKEN_KEY, value: current, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteContent.key, set: { value: current, updatedAt: new Date() } })
    } catch (error) {
      // A brand-new token can't be renewed for its first 24 hours; keep using it.
      console.warn('[instagram] Could not renew the access token yet:', (error as Error).message)
    }
  }
  return current.token
}

interface ApiMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

async function fetchFeed(): Promise<InstagramFeed> {
  const token = await getToken()
  if (!token) return EMPTY_INSTAGRAM_FEED

  const profile = await igGet<{ username: string, name?: string, profile_picture_url?: string }>('/me', { fields: 'username,name,profile_picture_url', access_token: token })

  // Newest first, up to 200 posts, so posts picked in the dashboard are found
  // even when they're a few months old.
  const media: ApiMedia[] = []
  let page = await igGet<{ data: ApiMedia[], paging?: { cursors?: { after?: string }, next?: string } }>('/me/media', {
    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
    limit: '50',
    access_token: token
  })
  media.push(...page.data)
  for (let i = 1; i < 4 && page.paging?.next && page.paging.cursors?.after; i++) {
    page = await igGet('/me/media', {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: '50',
      after: page.paging.cursors.after,
      access_token: token
    })
    media.push(...page.data)
  }

  const posts = media
    .filter(m => m.media_url)
    .map((m): InstagramPost => ({
      id: m.id,
      code: instagramCode(m.permalink),
      type: m.media_type === 'VIDEO' ? 'video' : 'image',
      media: m.media_url!,
      cover: m.media_type === 'VIDEO' ? (m.thumbnail_url ?? '') : m.media_url!,
      caption: m.caption ?? '',
      permalink: m.permalink,
      timestamp: m.timestamp,
      likes: m.like_count ?? null,
      comments: m.comments_count ?? null
    }))

  return { connected: true, username: profile.username, name: profile.name ?? '', picture: profile.profile_picture_url ?? '', posts }
}

let cache: { value: InstagramFeed, expires: number } | null = null

// Never throws: if Instagram is unreachable, the last good copy is served, or
// an empty feed (the slider then hides itself).
export async function getInstagramFeed(): Promise<InstagramFeed> {
  if (cache && cache.expires > Date.now()) return cache.value
  try {
    const value = await fetchFeed()
    cache = { value, expires: Date.now() + CACHE_MS }
    return value
  } catch (error) {
    console.error('[instagram] Could not load posts:', (error as Error).message)
    if (cache) {
      cache.expires = Date.now() + 5 * 60 * 1000
      return cache.value
    }
    return EMPTY_INSTAGRAM_FEED
  }
}
