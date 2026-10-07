// Decides whether a reservation email should go out, sends it, and records the
// attempt. Nothing in here is allowed to throw into a request handler: a guest
// must never see a booking fail because the mail provider was down.
import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { emailLog, type Reservation } from '../database/schema'
import { useDb } from './db'
import { buildEmail, type EmailTemplate, type ReservationEmailData } from './email-templates'
import { getMailConfig, sendMail } from './mail'
import { getEmailContent } from './site-content'

type Db = ReturnType<typeof useDb>

// Which status a booking has to reach for each guest email.
const STATUS_TEMPLATES: Partial<Record<Reservation['status'], EmailTemplate>> = {
  pending: 'booking_received',
  confirmed: 'booking_confirmed',
  cancelled: 'booking_cancelled',
  waitlist: 'waitlist_added'
  // arrived / seated / finished / no_show are floor states — never emailed.
}

export function templateForStatus(status: Reservation['status']) {
  return STATUS_TEMPLATES[status]
}

function toEmailData(r: Reservation, extra?: { tableName?: string | null, sectionName?: string | null, salutation?: string | null }): ReservationEmailData {
  return {
    reference: r.reference,
    firstName: r.firstName,
    lastName: r.lastName,
    salutation: extra?.salutation ?? null,
    email: r.email ?? '',
    phone: r.phone,
    date: r.date,
    time: r.time.slice(0, 5),
    partySize: r.partySize,
    durationMinutes: r.durationMinutes,
    tableName: extra?.tableName ?? null,
    sectionName: extra?.sectionName ?? null,
    notes: r.notes,
    source: r.source
  }
}

async function alreadySent(db: Db, reservationId: number, template: EmailTemplate) {
  const [row] = await db
    .select({ id: emailLog.id })
    .from(emailLog)
    .where(and(eq(emailLog.reservationId, reservationId), eq(emailLog.template, template), eq(emailLog.status, 'sent')))
    .limit(1)
  return !!row
}

interface NotifyOptions {
  /** Send again even if this template was already delivered (the Resend button). */
  force?: boolean
  tableName?: string | null
  sectionName?: string | null
  salutation?: string | null
}

export async function sendReservationEmail(
  reservation: Reservation,
  template: EmailTemplate,
  options: NotifyOptions = {}
): Promise<{ status: string, error?: string }> {
  const db = useDb()

  if (!reservation.email) return { status: 'skipped', error: 'guest has no email address' }
  if (!reservation.notifyGuest && !options.force) return { status: 'skipped', error: 'notifications disabled for this booking' }
  if (!options.force && await alreadySent(db, reservation.id, template)) {
    return { status: 'skipped', error: 'already sent' }
  }

  const message = buildEmail(template, toEmailData(reservation, options), await getEmailContent())
  const result = await sendMail(message)

  await db.insert(emailLog).values({
    reservationId: reservation.id,
    template,
    recipient: message.to,
    subject: message.subject,
    status: result.status,
    providerId: result.providerId ?? null,
    error: result.error ?? null
  })

  if (result.status === 'failed') {
    console.error(`[mail] ${template} to ${message.to} failed: ${result.error}`)
  }
  return { status: result.status, error: result.error }
}

export async function sendStaffNewBooking(reservation: Reservation) {
  const { staffTo } = getMailConfig()
  if (!staffTo) return { status: 'skipped', error: 'MAIL_STAFF_TO not set' }

  const db = useDb()
  const message = buildEmail('staff_new_booking', toEmailData(reservation), await getEmailContent())
  const result = await sendMail({ ...message, to: staffTo })

  await db.insert(emailLog).values({
    reservationId: reservation.id,
    template: 'staff_new_booking',
    recipient: staffTo,
    subject: message.subject,
    status: result.status,
    providerId: result.providerId ?? null,
    error: result.error ?? null
  })
  return { status: result.status, error: result.error }
}

// Email sending must not delay the HTTP response, but on serverless platforms an
// un-awaited promise can be killed mid-flight — waitUntil keeps it alive.
export function queueEmail(event: H3Event, work: () => Promise<unknown>) {
  const promise = work().catch(error => console.error('[mail] unexpected failure:', error))
  const waitUntil = (event.context as { waitUntil?: (p: Promise<unknown>) => void }).waitUntil
  if (typeof waitUntil === 'function') waitUntil(promise)
  return promise
}
