import { eq, like } from 'drizzle-orm'
import { normalizeSection, pageDefaults } from '#shared/content/schema'
import type { ContentPage, ContentSection } from '#shared/content/schema'
import { siteContent, staff } from '../database/schema'
import { useDb } from './db'

// Website (CMS) content. Each section is its own site_content row, keyed
// content/<page>/<section>, so saving one section never overwrites another and
// "reset" is just deleting the row. A missing row means "use the defaults".

const rowKey = (page: string, section: string) => `content/${page}/${section}`
const pagePrefix = (page: string) => `content/${page}/`

// The public site reads each page on every render, so it's held in memory for
// a minute and dropped as soon as anything on that page is saved.
const CACHE_MS = 60_000
const cache = new Map<string, { value: Record<string, unknown>, expires: number }>()

async function readRows(page: ContentPage) {
  return useDb()
    .select({ key: siteContent.key, value: siteContent.value, updatedAt: siteContent.updatedAt, updatedByName: staff.name })
    .from(siteContent)
    .leftJoin(staff, eq(staff.id, siteContent.updatedBy))
    .where(like(siteContent.key, `${pagePrefix(page.key)}%`))
}

// What the website shows: saved sections merged over the defaults. Never
// throws, so a database hiccup shows the default content instead of an error.
export async function getPublicContent(page: ContentPage) {
  const hit = cache.get(page.key)
  if (hit && hit.expires > Date.now()) return hit.value

  try {
    const rows = await readRows(page)
    const value = pageDefaults(page)
    for (const section of page.sections) {
      const row = rows.find(r => r.key === rowKey(page.key, section.id))
      if (row) value[section.id] = normalizeSection(section, row.value)
    }
    cache.set(page.key, { value, expires: Date.now() + CACHE_MS })
    return value
  } catch (error) {
    console.error(`[content] Could not load "${page.key}", using defaults:`, error)
    return pageDefaults(page)
  }
}

export interface AdminSectionState {
  value: Record<string, unknown>
  isDefault: boolean
  updatedAt: Date | null
  updatedByName: string | null
}

// For the dashboard: every section with when it was last saved and by whom.
export async function getAdminContent(page: ContentPage) {
  const rows = await readRows(page)
  const sections: Record<string, AdminSectionState> = {}
  for (const section of page.sections) {
    const row = rows.find(r => r.key === rowKey(page.key, section.id))
    sections[section.id] = {
      value: normalizeSection(section, row?.value),
      isDefault: !row,
      updatedAt: row?.updatedAt ?? null,
      updatedByName: row?.updatedByName ?? null
    }
  }
  return sections
}

export async function saveSection(page: ContentPage, section: ContentSection, value: Record<string, unknown>, staffId: number) {
  const key = rowKey(page.key, section.id)
  const now = new Date()
  await useDb().insert(siteContent)
    .values({ key, value, updatedBy: staffId, updatedAt: now })
    .onConflictDoUpdate({ target: siteContent.key, set: { value, updatedBy: staffId, updatedAt: now } })
  cache.delete(page.key)
}

export async function resetSection(page: ContentPage, section: ContentSection) {
  await useDb().delete(siteContent).where(eq(siteContent.key, rowKey(page.key, section.id)))
  cache.delete(page.key)
}

// Last change per page, for the dashboard's page list.
export async function getContentUpdates() {
  const rows = await useDb()
    .select({ key: siteContent.key, updatedAt: siteContent.updatedAt })
    .from(siteContent)
    .where(like(siteContent.key, 'content/%'))
  const latest: Record<string, { updatedAt: Date, editedSections: number }> = {}
  for (const row of rows) {
    const page = row.key.split('/')[1]!
    const entry = latest[page] ??= { updatedAt: row.updatedAt, editedSections: 0 }
    entry.editedSections++
    if (row.updatedAt > entry.updatedAt) entry.updatedAt = row.updatedAt
  }
  return latest
}
