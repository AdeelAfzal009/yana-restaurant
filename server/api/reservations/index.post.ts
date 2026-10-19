import { reservations } from '../../database/schema'
import { useDb, generateReference } from '../../utils/db'
import { findOrCreateGuest } from '../../utils/guests'
import { logActivity } from '../../utils/activity'
import { queueEmail, sendReservationEmail, sendStaffNewBooking } from '../../utils/notify'
import { DATE_RE, EMAIL_RE, TIME_RE } from '../../utils/validate'
import { isOnlineBookingTime } from '#shared/utils/reservation-meta'
import { clientIp, rateLimiter } from '../../utils/request'

interface ReservationInput {
  date?: string
  time?: string
  partySize?: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
  website?: string
}

// Generous for real guests, tight enough to stop a script from flooding the
// book (or using it to send emails to strangers).
const perVisitor = rateLimiter(6, 60 * 60 * 1000)
const MAX_DAYS_AHEAD = 365
const PHONE_RE = /^[\d\s()+.-]{6,30}$/

export default defineEventHandler(async (event) => {
  if (perVisitor.hit(clientIp(event))) {
    throw createError({ statusCode: 429, statusMessage: 'Too many bookings from this connection. Please call or WhatsApp us to book.' })
  }

  const body = await readBody<ReservationInput>(event)

  if (!body?.date || !DATE_RE.test(body.date)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid date is required' })
  }
  if (!body.time || !TIME_RE.test(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid time is required' })
  }
  if (!isOnlineBookingTime(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'Online bookings are from 12pm to 10pm' })
  }
  const partySize = Number(body.partySize)
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Party size must be between 1 and 20' })
  }
  if (typeof body.firstName !== 'string' || typeof body.lastName !== 'string' || !body.firstName.trim() || !body.lastName.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'First and last name are required' })
  }
  if (body.firstName.trim().length > 60 || body.lastName.trim().length > 60) {
    throw createError({ statusCode: 400, statusMessage: 'Names can be up to 60 characters' })
  }
  if (typeof body.email !== 'string' || body.email.length > 254 || !EMAIL_RE.test(body.email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email is required' })
  }
  if (typeof body.phone !== 'string' || !PHONE_RE.test(body.phone.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'A valid phone number is required' })
  }
  if (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 1000)) {
    throw createError({ statusCode: 400, statusMessage: 'Requests can be up to 1000 characters' })
  }

  const requestedAt = new Date(`${body.date}T${body.time}:00`)
  const graceMs = 5 * 60 * 1000
  if (Number.isNaN(requestedAt.getTime()) || requestedAt.getTime() < Date.now() - graceMs) {
    throw createError({ statusCode: 400, statusMessage: 'Reservation date/time must be in the future' })
  }
  if (requestedAt.getTime() > Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Bookings can be made up to a year ahead' })
  }

  // The hidden "website" field is only ever filled by bots. They get a normal-
  // looking answer, but nothing is booked and no email is sent.
  if (body.website) {
    return { reference: 'YANA', date: body.date, time: body.time, partySize }
  }

  const db = useDb()

  const contact = {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim(),
    phone: body.phone.trim()
  }

  const values = {
    guestId: await findOrCreateGuest(db, contact),
    source: 'online' as const,
    date: body.date,
    time: `${body.time}:00`,
    partySize,
    ...contact,
    notes: body.notes?.trim() || null
  }

  // References are random, so a collision is possible but rare — retry rather than fail the booking.
  for (let attempt = 0; attempt < 5; attempt++) {
    const [created] = await db
      .insert(reservations)
      .values({ ...values, reference: generateReference() })
      .onConflictDoNothing({ target: reservations.reference })
      .returning()

    if (created) {
      await logActivity(db, created.id, null, 'created')
      // Fire-and-forget: a mail outage must not fail the guest's booking.
      queueEmail(event, async () => {
        await sendReservationEmail(created, 'booking_received')
        await sendStaffNewBooking(created)
      })
      return {
        reference: created.reference,
        date: body.date,
        time: body.time,
        partySize
      }
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Could not create reservation. Please try again.' })
})
