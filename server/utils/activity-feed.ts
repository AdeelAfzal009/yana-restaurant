import { EMAIL_TEMPLATE_META } from '#shared/utils/email-content'
import type { EmailTemplateKey } from '#shared/utils/email-content'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { auditLog, emailLog, reservationActivity, reservations, staff } from '../database/schema'
import { useDb } from './db'

// One timeline for the Logs page, merged from three logs: dashboard actions
// (audit_log), booking changes (reservation_activity) and emails (email_log).

export const LOG_CATEGORIES = ['signins', 'users', 'content', 'setup', 'reservations', 'guests', 'emails'] as const
export type LogCategory = (typeof LOG_CATEGORIES)[number]
export type LogTone = 'default' | 'success' | 'warning' | 'danger'

export interface LogEntry {
  key: string
  at: string
  category: LogCategory
  tone: LogTone
  title: string
  // Who did it; null for the website itself or the system.
  who: string | null
  target: string | null
  details: string[]
  changes: { field: string, from?: unknown, to?: unknown }[]
  ip: string | null
}

// Every dashboard action, in words.
const AUDIT_ACTIONS: Record<string, { category: LogCategory, title: string, tone?: LogTone }> = {
  'auth.sign_in': { category: 'signins', title: 'Signed in', tone: 'success' },
  'auth.sign_in_failed': { category: 'signins', title: 'Sign-in failed', tone: 'danger' },
  'auth.rate_limited': { category: 'signins', title: 'Sign-ins blocked after too many attempts', tone: 'danger' },
  'auth.sign_out': { category: 'signins', title: 'Signed out' },
  'auth.password_changed': { category: 'signins', title: 'Changed their password' },
  'users.created': { category: 'users', title: 'Added a user' },
  'users.updated': { category: 'users', title: 'Changed a user' },
  'users.deleted': { category: 'users', title: 'Deleted a user', tone: 'warning' },
  'content.saved': { category: 'content', title: 'Saved website content' },
  'content.reset': { category: 'content', title: 'Put a website section back to the original', tone: 'warning' },
  'media.uploaded': { category: 'content', title: 'Uploaded a file' },
  'media.deleted': { category: 'content', title: 'Deleted a file', tone: 'warning' },
  'chatbot.saved': { category: 'setup', title: 'Saved the website chatbot' },
  'chatbot.reset': { category: 'setup', title: 'Reset the website chatbot', tone: 'warning' },
  'emails.templates_saved': { category: 'setup', title: 'Saved the email templates' },
  'emails.templates_reset': { category: 'setup', title: 'Reset the email templates', tone: 'warning' },
  'floorplan.saved': { category: 'setup', title: 'Saved the floorplan' },
  'emails.test_sent': { category: 'emails', title: 'Sent a test email' },
  'guests.updated': { category: 'guests', title: 'Edited a guest profile' }
}

// Entries that point to something going wrong.
const PROBLEM_ACTIONS = ['auth.sign_in_failed', 'auth.rate_limited']

const SOURCE_RANK = { audit: 3, reservation: 2, email: 1 } as const
type Source = keyof typeof SOURCE_RANK

// Postgres keeps microseconds; JavaScript dates don't. Timestamps travel as
// exact UTC strings so paging never skips entries saved in the same instant.
const atKey = (column: PgColumn) => sql<string>`to_char(${column} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`

interface Cursor { at: string, source: Source, id: number }

export function encodeCursor(c: Cursor) {
  return Buffer.from(JSON.stringify(c)).toString('base64url')
}

export function decodeCursor(value: unknown): Cursor | null {
  if (typeof value !== 'string' || !value) return null
  try {
    const c = JSON.parse(Buffer.from(value, 'base64url').toString())
    if (typeof c.at === 'string' && c.source in SOURCE_RANK && Number.isInteger(c.id)) return c
  } catch {}
  return null
}

// "Older than the cursor" in the feed's order: time, then source, then id.
function olderThan(cursor: Cursor | null, source: Source, at: PgColumn, id: PgColumn): SQL | undefined {
  if (!cursor) return undefined
  const rank = SOURCE_RANK[source]
  const cursorRank = SOURCE_RANK[cursor.source]
  const time = sql`${cursor.at}::timestamptz`
  if (rank < cursorRank) return sql`${at} <= ${time}`
  if (rank > cursorRank) return sql`${at} < ${time}`
  return sql`(${at} < ${time} or (${at} = ${time} and ${id} < ${cursor.id}))`
}

export interface FeedFilters {
  category: LogCategory | null
  staffId: number | null
  problemsOnly: boolean
  cursor: Cursor | null
  limit: number
}

const fmtDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return `${(h! % 12) || 12}:${String(m).padStart(2, '0')}${h! < 12 ? 'am' : 'pm'}`
}

const SOURCE_LABEL: Record<string, string> = { online: 'Online', phone: 'Phone', walk_in: 'Walk-in', staff: 'Added by staff' }

async function auditEntries(f: FeedFilters) {
  const actions = Object.entries(AUDIT_ACTIONS)
    .filter(([action, meta]) => (!f.category || meta.category === f.category) && (!f.problemsOnly || PROBLEM_ACTIONS.includes(action)))
    .map(([action]) => action)
  if (!actions.length) return []

  const rows = await useDb()
    .select({
      id: auditLog.id,
      at: atKey(auditLog.createdAt),
      action: auditLog.action,
      staffName: auditLog.staffName,
      currentName: staff.name,
      target: auditLog.target,
      details: auditLog.details,
      ip: auditLog.ip
    })
    .from(auditLog)
    .leftJoin(staff, eq(staff.id, auditLog.staffId))
    .where(and(
      inArray(auditLog.action, actions),
      f.staffId ? eq(auditLog.staffId, f.staffId) : undefined,
      olderThan(f.cursor, 'audit', auditLog.createdAt, auditLog.id)
    ))
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .limit(f.limit)

  return rows.map((r): LogEntry & { source: Source, id: number } => {
    const meta = AUDIT_ACTIONS[r.action]!
    const d = r.details ?? {}
    const details: string[] = []
    if (typeof d.reason === 'string') details.push(d.reason)
    if (Array.isArray(d.access)) details.push(`Access: ${d.access.length ? d.access.join(', ') : 'none'}`)
    if (typeof d.role === 'string') details.push(`Role: ${d.role === 'manager' ? 'Manager' : 'Host'}`)
    if (typeof d.to === 'string') details.push(`Sent to ${d.to}`)
    if (typeof d.size === 'number') details.push(`${d.kind === 'pdf' ? 'PDF' : 'Image'}, ${Math.max(1, Math.round(d.size / 1024))} KB after resizing`)
    if (typeof d.tables === 'number') details.push(`${d.sections} sections, ${d.tables} tables`)
    if (Array.isArray(d.fields) && d.fields.length) details.push(`Changed: ${d.fields.join(', ')}`)
    return {
      source: 'audit',
      id: r.id,
      key: `audit-${r.id}`,
      at: r.at,
      category: meta.category,
      tone: meta.tone ?? 'default',
      title: meta.title,
      who: r.currentName ?? r.staffName,
      target: r.target,
      details,
      changes: Array.isArray(d.changes) ? d.changes as LogEntry['changes'] : [],
      ip: r.ip
    }
  })
}

async function reservationEntries(f: FeedFilters) {
  if ((f.category && f.category !== 'reservations') || f.problemsOnly) return []
  const rows = await useDb()
    .select({
      id: reservationActivity.id,
      at: atKey(reservationActivity.createdAt),
      action: reservationActivity.action,
      changes: reservationActivity.changes,
      staffName: staff.name,
      staffId: reservationActivity.staffId,
      reference: reservations.reference,
      firstName: reservations.firstName,
      lastName: reservations.lastName,
      partySize: reservations.partySize,
      date: reservations.date,
      time: reservations.time,
      bookingSource: reservations.source
    })
    .from(reservationActivity)
    .innerJoin(reservations, eq(reservations.id, reservationActivity.reservationId))
    .leftJoin(staff, eq(staff.id, reservationActivity.staffId))
    .where(and(
      f.staffId ? eq(reservationActivity.staffId, f.staffId) : undefined,
      olderThan(f.cursor, 'reservation', reservationActivity.createdAt, reservationActivity.id)
    ))
    .orderBy(desc(reservationActivity.createdAt), desc(reservationActivity.id))
    .limit(f.limit)

  return rows.map((r): LogEntry & { source: Source, id: number } => {
    const status = r.changes.find(c => c.field === 'Status')
    const endedBadly = status && ['cancelled', 'no_show'].includes(String(status.to))
    const title = r.action === 'created'
      ? (r.staffId ? 'Added a booking' : 'New online booking')
      : r.action === 'status' ? 'Changed a booking\'s status' : 'Edited a booking'
    return {
      source: 'reservation',
      id: r.id,
      key: `reservation-${r.id}`,
      at: r.at,
      category: 'reservations',
      tone: r.action === 'created' ? 'success' : endedBadly ? 'warning' : 'default',
      title,
      who: r.staffName,
      target: `#${r.reference} · ${`${r.firstName} ${r.lastName}`.trim()}`,
      details: r.action === 'created'
        ? [`${r.partySize} ${r.partySize === 1 ? 'guest' : 'guests'} · ${fmtDate(r.date)}, ${fmtTime(r.time)} · ${SOURCE_LABEL[r.bookingSource] ?? r.bookingSource}`]
        : [],
      changes: r.action === 'created' ? [] : r.changes,
      ip: null
    }
  })
}

async function emailEntries(f: FeedFilters) {
  // Emails are sent by the system, so filtering by a person leaves them out.
  if ((f.category && f.category !== 'emails') || f.staffId) return []
  const rows = await useDb()
    .select({
      id: emailLog.id,
      at: atKey(emailLog.createdAt),
      template: emailLog.template,
      recipient: emailLog.recipient,
      subject: emailLog.subject,
      status: emailLog.status,
      error: emailLog.error,
      reference: reservations.reference
    })
    .from(emailLog)
    .leftJoin(reservations, eq(reservations.id, emailLog.reservationId))
    .where(and(
      f.problemsOnly ? eq(emailLog.status, 'failed') : undefined,
      olderThan(f.cursor, 'email', emailLog.createdAt, emailLog.id)
    ))
    .orderBy(desc(emailLog.createdAt), desc(emailLog.id))
    .limit(f.limit)

  return rows.map((r): LogEntry & { source: Source, id: number } => {
    const name = EMAIL_TEMPLATE_META[r.template as EmailTemplateKey]?.name ?? r.template
    const details = [`To ${r.recipient}`, `Subject: ${r.subject}`]
    if (r.error) details.push(`${r.status === 'failed' ? 'Error' : 'Reason'}: ${r.error}`)
    return {
      source: 'email',
      id: r.id,
      key: `email-${r.id}`,
      at: r.at,
      category: 'emails',
      tone: r.status === 'failed' ? 'danger' : r.status === 'sent' ? 'default' : 'warning',
      title: r.status === 'sent' ? 'Email sent' : r.status === 'failed' ? 'Email failed to send' : 'Email not sent',
      who: null,
      target: r.reference ? `${name} · #${r.reference}` : name,
      details,
      changes: [],
      ip: null
    }
  })
}

// The newest `limit` entries across all three logs, plus a cursor for the next
// page. Each log's own newest `limit` rows are enough to find the overall top.
export async function getActivityFeed(f: FeedFilters) {
  const parts = await Promise.all([auditEntries(f), reservationEntries(f), emailEntries(f)])
  const merged = parts.flat().sort((a, b) =>
    a.at === b.at ? (SOURCE_RANK[b.source] - SOURCE_RANK[a.source]) || (b.id - a.id) : a.at < b.at ? 1 : -1)
  const page = merged.slice(0, f.limit)
  const hasMore = merged.length > f.limit || parts.some(p => p.length === f.limit)
  const last = page[page.length - 1]
  return {
    entries: page.map(({ source: _source, id: _id, ...entry }) => entry),
    nextCursor: hasMore && last ? encodeCursor({ at: last.at, source: last.source, id: last.id }) : null
  }
}

// Counts for the summary at the top of the page.
export async function getActivitySummary(days = 7) {
  const since = sql`now() - ${`${days} days`}::interval`
  const db = useDb()
  const count = sql<number>`count(*)::int`
  const [[failedSignIns], [contentChanges], [failedEmails], [newBookings]] = await Promise.all([
    db.select({ n: count }).from(auditLog).where(and(inArray(auditLog.action, PROBLEM_ACTIONS), sql`${auditLog.createdAt} > ${since}`)),
    db.select({ n: count }).from(auditLog).where(and(inArray(auditLog.action, ['content.saved', 'content.reset', 'media.uploaded', 'media.deleted']), sql`${auditLog.createdAt} > ${since}`)),
    db.select({ n: count }).from(emailLog).where(and(eq(emailLog.status, 'failed'), sql`${emailLog.createdAt} > ${since}`)),
    db.select({ n: count }).from(reservationActivity).where(and(eq(reservationActivity.action, 'created'), sql`${reservationActivity.createdAt} > ${since}`))
  ])
  return {
    days,
    failedSignIns: failedSignIns?.n ?? 0,
    contentChanges: contentChanges?.n ?? 0,
    failedEmails: failedEmails?.n ?? 0,
    newBookings: newBookings?.n ?? 0
  }
}
