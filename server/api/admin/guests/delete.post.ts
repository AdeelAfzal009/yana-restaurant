import { and, eq, inArray } from 'drizzle-orm'
import { guests, honorsMembers, reservations } from '../../../database/schema'
import { audit } from '../../../utils/audit'
import { requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { syncGoogleCard } from '../../../utils/google-wallet'
import { siteOrigin } from '../../../utils/request'
import { badRequest } from '../../../utils/validate'

const MAX = 5000

// Deletes guest profiles: { ids: number[], deleteBookings?: boolean }.
// Without deleteBookings their bookings stay (with the name and contact they
// were made under) and are simply no longer linked to a profile.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'guests')
  const body = await readBody<{ ids?: unknown, deleteBookings?: unknown }>(event)
  if (!Array.isArray(body?.ids) || !body.ids.length) badRequest('Choose at least one guest')
  const ids = [...new Set(body.ids.map(Number).filter(n => Number.isInteger(n) && n > 0))]
  if (!ids.length) badRequest('Choose at least one guest')
  if (ids.length > MAX) badRequest(`Up to ${MAX.toLocaleString()} guests can be deleted at once`)
  const deleteBookings = body.deleteBookings === true

  const db = useDb()
  // Their Yana Honors cards go with them (cascade); a card already in Google
  // Wallet is switched off first so it doesn't stay valid on the phone.
  const cards = await db.select({ member: honorsMembers, guest: guests }).from(honorsMembers)
    .innerJoin(guests, eq(guests.id, honorsMembers.guestId))
    .where(and(inArray(honorsMembers.guestId, ids), eq(honorsMembers.status, 'active')))
  for (const { member, guest } of cards) await syncGoogleCard({ ...member, status: 'revoked' }, guest, siteOrigin(event))

  const result = await db.transaction(async (tx) => {
    let bookings = 0
    // Booking activity and email history go with their bookings (cascade).
    if (deleteBookings) bookings = (await tx.delete(reservations).where(inArray(reservations.guestId, ids)).returning({ id: reservations.id })).length
    const removed = await tx.delete(guests).where(inArray(guests.id, ids)).returning({ firstName: guests.firstName, lastName: guests.lastName })
    return { removed, bookings }
  })

  const names = result.removed.map(g => `${g.firstName} ${g.lastName}`.trim())
  await audit(event, current, 'guests.deleted', {
    target: names.length === 1 ? names[0] : `${names.length} guests`,
    details: { deleted: names.length, bookings: result.bookings, names: names.slice(0, 20) }
  })
  return { deleted: names.length, bookingsDeleted: result.bookings }
})
