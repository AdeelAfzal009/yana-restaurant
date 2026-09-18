import { eq } from 'drizzle-orm'
import { guests, reservations } from '../../../database/schema'
import { logActivity } from '../../../utils/activity'
import { requireAuth } from '../../../utils/auth'
import { generateReference, useDb } from '../../../utils/db'
import { findOrCreateGuest } from '../../../utils/guests'
import { parseReservationFields, stampStatusTimes, type ReservationBody } from '../../../utils/reservation-input'
import { badRequest } from '../../../utils/validate'

// Staff-created bookings: phone reservations, walk-ins and waitlist entries.
// Unlike the public endpoint these may be in the past (a walk-in seated now)
// and may skip contact details.
export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)

  const body = await readBody<ReservationBody & { guestId?: number }>(event)
  const fields = parseReservationFields(body)
  if (!fields.date || !fields.time) badRequest('Date and time are required')
  if (!fields.partySize) badRequest('Party size is required')
  if (!fields.firstName) badRequest('Guest name is required')

  const db = useDb()
  const contact = {
    firstName: fields.firstName,
    lastName: fields.lastName ?? '',
    email: fields.email ?? null,
    phone: fields.phone ?? null
  }

  let guestId: number | null = null
  if (body.guestId) {
    const [existing] = await db.select({ id: guests.id }).from(guests).where(eq(guests.id, Number(body.guestId))).limit(1)
    guestId = existing?.id ?? null
  }
  guestId ??= await findOrCreateGuest(db, contact)

  const status = fields.status ?? 'confirmed'
  const values = {
    ...fields,
    ...contact,
    guestId,
    status,
    source: fields.source ?? 'phone',
    createdBy: me.id,
    updatedBy: me.id,
    seatedGuests: fields.seatedGuests ?? (status === 'seated' ? fields.partySize : null),
    ...stampStatusTimes(status)
  } as typeof reservations.$inferInsert

  for (let attempt = 0; attempt < 5; attempt++) {
    const [created] = await db
      .insert(reservations)
      .values({ ...values, reference: generateReference() })
      .onConflictDoNothing({ target: reservations.reference })
      .returning({ id: reservations.id, reference: reservations.reference })
    if (created) {
      await logActivity(db, created.id, me.id, 'created')
      return created
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Could not create reservation. Please try again.' })
})
