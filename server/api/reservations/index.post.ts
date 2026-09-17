import { reservations } from '../../database/schema'
import { useDb, generateReference } from '../../utils/db'

interface ReservationInput {
  date?: string
  time?: string
  partySize?: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

export default defineEventHandler(async (event) => {
  const body = await readBody<ReservationInput>(event)

  if (!body?.date || !DATE_RE.test(body.date)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid date is required' })
  }
  if (!body.time || !TIME_RE.test(body.time)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid time is required' })
  }
  const partySize = Number(body.partySize)
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Party size must be between 1 and 20' })
  }
  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'First and last name are required' })
  }
  if (!body.email || !EMAIL_RE.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email is required' })
  }
  if (!body.phone?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'A phone number is required' })
  }

  const requestedAt = new Date(`${body.date}T${body.time}:00`)
  const graceMs = 5 * 60 * 1000
  if (Number.isNaN(requestedAt.getTime()) || requestedAt.getTime() < Date.now() - graceMs) {
    throw createError({ statusCode: 400, statusMessage: 'Reservation date/time must be in the future' })
  }

  const db = useDb()

  const values = {
    date: body.date,
    time: `${body.time}:00`,
    partySize,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    notes: body.notes?.trim() || null
  }

  // References are random, so a collision is possible but rare — retry rather than fail the booking.
  for (let attempt = 0; attempt < 5; attempt++) {
    const [created] = await db
      .insert(reservations)
      .values({ ...values, reference: generateReference() })
      .onConflictDoNothing({ target: reservations.reference })
      .returning({ reference: reservations.reference })

    if (created) {
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
