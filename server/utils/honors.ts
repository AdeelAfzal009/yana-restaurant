import { randomBytes } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import { guests, honorsMembers, staff } from '../database/schema'
import type { Guest, HonorsMember } from '../database/schema'
import { useDb } from './db'
import { getMailConfig } from './mail'

// How long an "add to wallet" link works: shown as a QR at reception it only
// needs to last while the guest is at the desk; emailed, the guest may open it
// days later. Once a pass has been handed out the link keeps working a little
// longer (a second tap, the other wallet), then stops, so a forwarded link
// can't put someone else's card on another phone.
const MINUTE = 60 * 1000
export const HONORS_LINK_TTL_MS = { qr: 30 * MINUTE, email: 7 * 24 * 60 * MINUTE }
const LINK_GRACE_MS = 30 * MINUTE

export type HonorsLinkChannel = keyof typeof HONORS_LINK_TTL_MS

export const honorsLinkUrl = (origin: string, token: string) => `${origin}/add/${token}`

// The live https site. Wallet cards outlive the request that made them, and
// Google fetches their images itself, so they never point at localhost.
export function publicOrigin(origin: string) {
  return origin.startsWith('https://') ? origin : getMailConfig().siteUrl
}

// What the QR code on the card opens: the member in the dashboard, for staff
// to check the card is genuine and active and see the discount.
export const honorsVerifyUrl = (origin: string, memberNumber: string) => `${publicOrigin(origin)}/admin/honors/${memberNumber}`

export const memberName = (guest: Pick<Guest, 'firstName' | 'lastName'>) => `${guest.firstName} ${guest.lastName}`.trim()

// A fresh link for the card; any earlier link stops working.
export async function createHonorsLink(memberId: number, channel: HonorsLinkChannel) {
  const token = randomBytes(24).toString('base64url')
  const expiresAt = new Date(Date.now() + HONORS_LINK_TTL_MS[channel])
  await useDb().update(honorsMembers)
    .set({ token, tokenExpiresAt: expiresAt, tokenUsedAt: null, updatedAt: new Date() })
    .where(eq(honorsMembers.id, memberId))
  return { token, expiresAt }
}

// The card a link belongs to, or null when the link is unknown, expired, used
// up, or the card has been revoked.
export async function findHonorsByToken(token: string) {
  if (!/^[\w-]{20,64}$/.test(token)) return null
  const [row] = await useDb()
    .select({ member: honorsMembers, guest: guests })
    .from(honorsMembers)
    .innerJoin(guests, eq(guests.id, honorsMembers.guestId))
    .where(and(eq(honorsMembers.token, token), eq(honorsMembers.status, 'active')))
    .limit(1)
  if (!row) return null
  const now = Date.now()
  if (!row.member.tokenExpiresAt || row.member.tokenExpiresAt.getTime() < now) return null
  if (row.member.tokenUsedAt && row.member.tokenUsedAt.getTime() + LINK_GRACE_MS < now) return null
  return row
}

export async function markHonorsLinkUsed(memberId: number) {
  await useDb().update(honorsMembers)
    .set({ tokenUsedAt: sql`coalesce(${honorsMembers.tokenUsedAt}, now())` })
    .where(eq(honorsMembers.id, memberId))
}

// What the dashboard shows about a guest's card. The link secret stays on the
// server; staff get a link only by asking for a new one.
export async function honorsForGuest(guestId: number) {
  const [row] = await useDb()
    .select({ member: honorsMembers, issuedByName: staff.name })
    .from(honorsMembers)
    .leftJoin(staff, eq(staff.id, honorsMembers.issuedBy))
    .where(eq(honorsMembers.guestId, guestId))
    .limit(1)
  return row ? publicHonors(row.member, row.issuedByName) : null
}

export function publicHonors(member: HonorsMember, issuedByName: string | null = null) {
  return {
    id: member.id,
    memberNumber: member.memberNumber,
    tier: member.tier,
    discountPercent: member.discountPercent,
    status: member.status,
    issuedByName,
    createdAt: member.createdAt,
    // When the latest link was first used to add the card to a wallet.
    linkUsedAt: member.tokenUsedAt
  }
}

export async function loadHonorsMember(id: number) {
  const [row] = await useDb()
    .select({ member: honorsMembers, guest: guests })
    .from(honorsMembers)
    .innerJoin(guests, eq(guests.id, honorsMembers.guestId))
    .where(eq(honorsMembers.id, id))
    .limit(1)
  return row ?? null
}

export function parseDiscount(value: unknown) {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : null
}

export async function loadHonorsForGuest(guestId: number) {
  const [member] = await useDb().select().from(honorsMembers).where(eq(honorsMembers.guestId, guestId)).limit(1)
  return member ?? null
}
