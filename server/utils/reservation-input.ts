import type { NewReservation } from '../database/schema'
import { badRequest, cleanTags, DATE_RE, EMAIL_RE, optionalText, TIME_RE } from './validate'

export interface ReservationBody {
  date?: string
  time?: string
  durationMinutes?: number
  partySize?: number
  seatedGuests?: number | null
  notifyGuest?: boolean
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  notes?: string | null
  internalNotes?: string | null
  tags?: string[]
  status?: string
  source?: string
  tableId?: number | null
}

// Validates whichever fields are present; staff edits are partial.
export function parseReservationFields(body: ReservationBody) {
  const out: Partial<NewReservation> = {}

  if (body.date !== undefined) {
    if (!DATE_RE.test(String(body.date))) badRequest('A valid date is required')
    out.date = body.date
  }
  if (body.time !== undefined) {
    if (!TIME_RE.test(String(body.time))) badRequest('A valid time is required')
    out.time = `${body.time}:00`
  }
  if (body.durationMinutes !== undefined) {
    const d = Number(body.durationMinutes)
    if (!Number.isInteger(d) || d < 15 || d > 480) badRequest('Duration must be 15–480 minutes')
    out.durationMinutes = d
  }
  if (body.partySize !== undefined) {
    const p = Number(body.partySize)
    if (!Number.isInteger(p) || p < 1 || p > 50) badRequest('Party size must be between 1 and 50')
    out.partySize = p
  }
  if (body.seatedGuests !== undefined) {
    const n = body.seatedGuests === null ? null : Number(body.seatedGuests)
    if (n !== null && (!Number.isInteger(n) || n < 0 || n > 50)) badRequest('Seated guests must be 0–50')
    out.seatedGuests = n
  }
  if (body.notifyGuest !== undefined) out.notifyGuest = Boolean(body.notifyGuest)
  if (body.firstName !== undefined) {
    const name = String(body.firstName).trim()
    if (!name) badRequest('First name is required')
    out.firstName = name
  }
  if (body.lastName !== undefined) out.lastName = String(body.lastName ?? '').trim()
  if (body.email !== undefined) {
    const email = optionalText(body.email)
    if (email && !EMAIL_RE.test(email)) badRequest('Email address looks invalid')
    out.email = email
  }
  if (body.phone !== undefined) out.phone = optionalText(body.phone)
  if (body.notes !== undefined) out.notes = optionalText(body.notes)
  if (body.internalNotes !== undefined) out.internalNotes = optionalText(body.internalNotes)
  if (body.tags !== undefined) out.tags = cleanTags(body.tags)
  if (body.status !== undefined) {
    if (!RESERVATION_STATUSES.includes(body.status as ReservationStatus)) badRequest('Invalid status')
    out.status = body.status as ReservationStatus
  }
  if (body.source !== undefined) {
    if (!RESERVATION_SOURCES.includes(body.source as ReservationSource)) badRequest('Invalid source')
    out.source = body.source as ReservationSource
  }
  if (body.tableId !== undefined) {
    if (body.tableId !== null && !Number.isInteger(Number(body.tableId))) badRequest('Invalid table')
    out.tableId = body.tableId === null ? null : Number(body.tableId)
  }

  return out
}

// Service timestamps are stamped the first time a booking reaches each stage.
export function stampStatusTimes(status: ReservationStatus | undefined, now = new Date()) {
  const out: Partial<NewReservation> = {}
  if (status === 'arrived') out.arrivedAt = now
  if (status === 'seated') out.seatedAt = now
  if (status === 'finished') out.finishedAt = now
  return out
}
