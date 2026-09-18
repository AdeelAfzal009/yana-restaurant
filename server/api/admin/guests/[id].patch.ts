import { eq } from 'drizzle-orm'
import { guests } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { badRequest, cleanTags, EMAIL_RE, optionalText } from '../../../utils/validate'

type GuestBody = Record<string, unknown>

const TEXT_FIELDS = [
  'salutation', 'phone', 'notes', 'gender', 'preferredLanguage', 'membershipId', 'membershipStatus',
  'address', 'country', 'city', 'state'
] as const

// [field, min, max] for the optional day / month / year parts.
const DATE_PARTS = [
  ['birthDay', 1, 31], ['birthMonth', 1, 12], ['birthYear', 1900, 2100],
  ['anniversaryDay', 1, 31], ['anniversaryMonth', 1, 12], ['anniversaryYear', 1900, 2100]
] as const

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid guest id')

  const body = await readBody<GuestBody>(event)
  const set: Partial<typeof guests.$inferInsert> = {}

  if (body.firstName !== undefined) {
    if (!String(body.firstName ?? '').trim()) badRequest('First name is required')
    set.firstName = String(body.firstName).trim()
  }
  if (body.lastName !== undefined) set.lastName = String(body.lastName ?? '').trim()
  if (body.email !== undefined) {
    const email = optionalText(body.email)
    if (email && !EMAIL_RE.test(email)) badRequest('Email address looks invalid')
    set.email = email
  }
  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) set[field] = optionalText(body[field]) ?? null
  }
  for (const [field, min, max] of DATE_PARTS) {
    if (body[field] === undefined) continue
    const v = body[field] === null || body[field] === '' ? null : Number(body[field])
    if (v !== null && (!Number.isInteger(v) || v < min || v > max)) badRequest('Invalid date')
    set[field] = v
  }
  if (body.preferredSectionId !== undefined) {
    set.preferredSectionId = body.preferredSectionId === null || body.preferredSectionId === '' ? null : Number(body.preferredSectionId)
  }
  if (body.tags !== undefined) set.tags = cleanTags(body.tags)
  if (body.vip !== undefined) set.vip = Boolean(body.vip)
  if (body.marketingOptIn !== undefined) set.marketingOptIn = Boolean(body.marketingOptIn)
  if (body.socialLinks !== undefined) {
    if (!Array.isArray(body.socialLinks)) badRequest('Social links must be a list')
    set.socialLinks = (body.socialLinks as { platform?: unknown, url?: unknown }[])
      .map(l => ({ platform: String(l?.platform ?? '').trim(), url: String(l?.url ?? '').trim() }))
      .filter(l => l.url)
      .slice(0, 10)
    for (const l of set.socialLinks) {
      if (!/^https?:\/\//i.test(l.url)) badRequest('Social links must start with http:// or https://')
    }
  }

  const db = useDb()
  try {
    const [updated] = await db.update(guests).set({ ...set, updatedAt: new Date() }).where(eq(guests.id, id)).returning()
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Guest not found' })
    return updated
  } catch (error: any) {
    if (error?.cause?.code === '23505' || error?.code === '23505') badRequest('Another guest already uses this email')
    throw error
  }
})
