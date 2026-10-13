import { inArray, isNotNull } from 'drizzle-orm'
import { guests, reservations, restaurantTables } from '../database/schema'
import { useDb } from './db'
import { cleanPhone, phoneKey, text } from './guest-import'
import type { Cell } from './guest-import'
import { badRequest, EMAIL_RE } from './validate'

// Importing past and upcoming bookings from ServMe's "Manager Report"
// reservations export. The report opens with a summary block; the bookings
// table starts at the row headed "Reservation Date … Pre Service Status".
//
// ServMe reuses reference numbers, so a booking is identified by reference +
// date + time (external_id); importing the same file again skips what's there.

type Status = typeof reservations.$inferInsert.status
type Source = typeof reservations.$inferInsert.source

const SOURCE_NAME = 'ServMe'
const NAME_PREFIXES = /^(mr|mrs|ms|miss|dr|sheikh|sheikha|he)\.?\s+/i
const SALUTATION = { mr: 'Mr', mrs: 'Mrs', ms: 'Ms', miss: 'Miss', dr: 'Dr', sheikh: 'Sheikh', sheikha: 'Sheikha', he: 'HE' } as Record<string, string>

const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '')

interface FileTable {
  name: string
  header: string[]
  rows: Cell[][]
  // What the report's own summary says, to check the import against.
  reportTotal: number | null
  period: string | null
}

// Finds the bookings table inside a ServMe report.
export function findBookingTable(name: string, rows: Cell[][]): FileTable {
  const headerIndex = rows.findIndex((r) => {
    const keys = r.map(c => norm(text(c)))
    return keys.includes('reservationdate') && keys.includes('covers')
  })
  if (headerIndex < 0) {
    badRequest(`${name}: this doesn't look like a ServMe reservations report (no "Reservation Date" and "Covers" columns). For guest lists, use Guests › Import.`)
  }
  const summary = rows.slice(0, headerIndex)
  const totalRow = summary.find(r => norm(text(r[0])) === 'totalreservationsmade')
  const reportTotal = totalRow ? Number(totalRow.find((c, i) => i > 0 && typeof c === 'number') ?? Number.NaN) : null
  const periodRow = summary.find(r => norm(text(r[0])) === 'date')
  return {
    name,
    header: rows[headerIndex]!.map(c => text(c)),
    rows: rows.slice(headerIndex + 1).filter(r => r.some(c => text(c))),
    reportTotal: Number.isFinite(reportTotal) ? reportTotal : null,
    period: periodRow ? periodRow.slice(1).map(c => text(c)).filter(Boolean).join(' ') : null
  }
}

const dubai = (date: string, time: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}/.test(time)) return null
  const [h, m] = time.split(':')
  return new Date(`${date}T${h!.padStart(2, '0')}:${m!.slice(0, 2)}:00+04:00`)
}

const todayInDubai = () => new Date(Date.now() + 4 * 3600_000).toISOString().slice(0, 10)

// ServMe has two status columns: before service (Confirmed / Pending /
// Cancel) and during service (Pending / Seated / Left / No-show).
function mapStatus(pre: string, during: string, date: string): Status {
  const p = pre.toLowerCase()
  const d = during.toLowerCase()
  if (p.startsWith('cancel')) return 'cancelled'
  if (d.includes('no-show') || d.includes('no show')) return 'no_show'
  if (d === 'left') return 'finished'
  // Never closed in ServMe: still "seated" only if it's today.
  if (d.includes('seated')) return date < todayInDubai() ? 'finished' : 'seated'
  return p === 'confirmed' ? 'confirmed' : 'pending'
}

function mapSource(type: string, source: string): Source {
  if (/walk/i.test(type)) return 'walk_in'
  if (/widget/i.test(source)) return 'online'
  return 'phone'
}

// Table names as written in ServMe → this floor plan ("2V" and "v6" are VIP tables).
function tableKey(name: string) {
  const k = name.toLowerCase().replace(/\s+/g, '')
  const vip = /^(\d+)v$/.exec(k) ?? /^v(\d+)$/.exec(k)
  return vip ? `vip${vip[1]}` : k
}

interface ParsedBooking {
  file: string
  row: number
  externalId: string
  reference: string
  date: string
  time: string
  partySize: number
  seatedGuests: number | null
  durationMinutes: number
  firstName: string
  lastName: string
  salutation: string | null
  email: string | null
  phone: string | null
  notes: string | null
  internalNotes: string | null
  bookedBy: string | null
  tags: string[]
  source: Source
  status: Status
  tableName: string | null
  createdAt: Date | null
  seatedAt: Date | null
  finishedAt: Date | null
}

export interface BookingIssue { file: string, row: number, message: string }

export async function planBookingImport(files: FileTable[]) {
  const db = useDb()
  const tables = await db.select({ id: restaurantTables.id, name: restaurantTables.name }).from(restaurantTables)
  const tableIds = new Map(tables.map(t => [tableKey(t.name), t.id]))
  const existingExternal = new Set((await db.select({ id: reservations.externalId }).from(reservations).where(isNotNull(reservations.externalId))).map(r => r.id!))
  const usedReferences = new Set((await db.select({ ref: reservations.reference }).from(reservations)).map(r => r.ref))

  const parsed: ParsedBooking[] = []
  const skipped: BookingIssue[] = []
  const unmatchedTables: Record<string, number> = {}
  const seenExternal = new Set<string>()
  let alreadyImported = 0
  let duplicatesInFiles = 0

  for (const file of files) {
    const at = new Map(file.header.map((h, i) => [norm(h), i]))
    const col = (r: Cell[], ...names: string[]) => {
      for (const n of names) {
        const i = at.get(n)
        if (i !== undefined) return text(r[i])
      }
      return ''
    }
    file.rows.forEach((r, i) => {
      const row = i + 1
      const date = col(r, 'reservationdate')
      const time = col(r, 'reservationtime').slice(0, 5)
      const ref = col(r, 'reference')
      const covers = Number(col(r, 'covers'))
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) return skipped.push({ file: file.name, row, message: 'No valid date or time' })
      if (!Number.isInteger(covers) || covers < 1) return skipped.push({ file: file.name, row, message: `${col(r, 'reservationtype') || 'Booking'} on ${date} with 0 guests (probably entered by mistake in ServMe)` })

      const externalId = `${SOURCE_NAME.toLowerCase()}:${ref || `row${row}`}:${date}:${time}`
      if (seenExternal.has(externalId)) { duplicatesInFiles++; return }
      seenExternal.add(externalId)
      if (existingExternal.has(externalId)) { alreadyImported++; return }

      // "Mr Alex" → salutation Mr, first name Alex. Plain "Walk in" → Walk-in.
      let rawName = col(r, 'guestname') || col(r, 'reservationfullname')
      if (/^walk[\s-]?in$/i.test(rawName)) rawName = 'Walk-in'
      const prefix = NAME_PREFIXES.exec(rawName)
      const salutation = prefix ? SALUTATION[prefix[1]!.toLowerCase()] ?? null : null
      const parts = rawName.replace(NAME_PREFIXES, '').split(/\s+/).filter(Boolean)
      const firstName = parts.shift() ?? 'Guest'

      const rawEmail = col(r, 'email').toLowerCase()
      const email = rawEmail.split(/[\s,;/]+/).find(e => EMAIL_RE.test(e)) ?? null
      const phone = cleanPhone(col(r, 'phonenumber', 'phone'))

      const tableField = col(r, 'tableno', 'table')
      const tableNames = tableField.split(',').map(t => t.trim()).filter(Boolean)
      const tableName = tableNames.find(t => tableIds.has(tableKey(t))) ?? null
      for (const t of tableNames) if (!tableIds.has(tableKey(t))) unmatchedTables[t] = (unmatchedTables[t] ?? 0) + 1

      const status = mapStatus(col(r, 'preservicestatus'), col(r, 'inservicestatus'), date)
      const seated = Number(col(r, 'seated'))
      const duration = Number(col(r, 'duration'))

      // A reused ServMe reference gets a suffix so references stay unique here.
      let reference = (ref || 'IMP').slice(0, 9)
      for (let n = 2; usedReferences.has(reference); n++) reference = `${(ref || 'IMP').slice(0, 9)}-${n}`
      usedReferences.add(reference)

      const staffNotes = [
        tableNames.length > 1 || (tableNames.length && !tableName) ? `ServMe table${tableNames.length > 1 ? 's' : ''}: ${tableNames.join(', ')}` : ''
      ].filter(Boolean)

      parsed.push({
        file: file.name,
        row,
        externalId,
        reference,
        date,
        time,
        partySize: Math.min(covers, 500),
        seatedGuests: (status === 'seated' || status === 'finished') && seated > 0 ? Math.min(seated, 500) : null,
        durationMinutes: duration >= 30 && duration <= 600 ? Math.round(duration) : 120,
        firstName: firstName.slice(0, 80),
        lastName: parts.join(' ').slice(0, 80),
        salutation,
        email,
        phone,
        notes: col(r, 'reservationnotes').slice(0, 2000) || null,
        internalNotes: staffNotes.join('\n') || null,
        bookedBy: col(r, 'bookedby').slice(0, 80) || null,
        tags: col(r, 'reservationtags').split(',').map(t => t.trim()).filter(Boolean).slice(0, 10),
        source: mapSource(col(r, 'reservationtype'), col(r, 'source')),
        status,
        tableName,
        createdAt: dubai(col(r, 'creationdate'), col(r, 'creationtime')),
        seatedAt: status === 'seated' || status === 'finished' ? dubai(col(r, 'seateddate'), col(r, 'seatedtime')) : null,
        finishedAt: status === 'finished' ? dubai(col(r, 'leftdate'), col(r, 'lefttime')) : null
      })
    })
  }

  // Link to guest profiles by email, then phone; people not in the guest
  // book yet get a profile. Bookings without contact details stay unlinked.
  const existingGuests = await db.select({ id: guests.id, email: guests.email, phone: guests.phone }).from(guests)
  const guestByEmail = new Map<string, number>()
  const guestByPhone = new Map<string, number>()
  for (const g of existingGuests) {
    if (g.email) guestByEmail.set(g.email.toLowerCase(), g.id)
    const k = phoneKey(g.phone)
    if (k && !guestByPhone.has(k)) guestByPhone.set(k, g.id)
  }
  // Each new person is represented by their first booking, found by email or phone.
  const newGuests = new Map<string, ParsedBooking>()
  const links: (number | ParsedBooking | null)[] = parsed.map((b) => {
    const pk = phoneKey(b.phone)
    const existing = (b.email && guestByEmail.get(b.email)) || (pk && guestByPhone.get(pk))
    if (existing) return existing
    if (!b.email && !pk) return null
    const person = (b.email && newGuests.get(`e:${b.email}`)) || (pk && newGuests.get(`p:${pk}`)) || b
    if (b.email) newGuests.set(`e:${b.email}`, person)
    if (pk) newGuests.set(`p:${pk}`, person)
    return person
  })

  return { files, parsed, links, newGuests, skipped, unmatchedTables, alreadyImported, duplicatesInFiles, tableIds }
}

export type BookingPlan = Awaited<ReturnType<typeof planBookingImport>>

const uniqueNewGuests = (plan: BookingPlan) => [...new Set(plan.newGuests.values())]

export function describeBookingPlan(plan: BookingPlan) {
  const byStatus: Record<string, number> = {}
  for (const b of plan.parsed) byStatus[b.status!] = (byStatus[b.status!] ?? 0) + 1
  const dates = plan.parsed.map(b => b.date).sort()
  return {
    files: plan.files.map(f => ({
      name: f.name,
      period: f.period,
      rows: f.rows.length,
      reportTotal: f.reportTotal
    })),
    counts: {
      create: plan.parsed.length,
      alreadyImported: plan.alreadyImported,
      duplicatesInFiles: plan.duplicatesInFiles,
      skipped: plan.skipped.length,
      linkedToExistingGuests: plan.links.filter(l => typeof l === 'number').length,
      linkedToNewGuests: plan.links.filter(l => l !== null && typeof l === 'object').length,
      newGuestProfiles: uniqueNewGuests(plan).length,
      withoutGuest: plan.links.filter(l => l === null).length,
      walkIns: plan.parsed.filter(b => b.source === 'walk_in').length,
      covers: plan.parsed.reduce((n, b) => n + b.partySize, 0),
      onTables: plan.parsed.filter(b => b.tableName).length
    },
    byStatus,
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
    unmatchedTables: plan.unmatchedTables,
    skipped: plan.skipped.slice(0, 200),
    sample: plan.parsed.slice(0, 8).map(b => ({
      reference: b.reference,
      date: b.date,
      time: b.time,
      name: `${b.firstName} ${b.lastName}`.trim(),
      partySize: b.partySize,
      status: b.status,
      source: b.source,
      table: b.tableName
    }))
  }
}

export async function applyBookingImport(plan: BookingPlan) {
  const now = new Date()
  return useDb().transaction(async (tx) => {
    // New guest profiles first, so bookings can point at them.
    const newGuestIds = new Map<ParsedBooking, number>()
    const fresh = uniqueNewGuests(plan)
    for (let i = 0; i < fresh.length; i += 250) {
      const chunk = fresh.slice(i, i + 250)
      const rows = await tx.insert(guests).values(chunk.map(b => ({
        firstName: b.firstName,
        lastName: b.lastName,
        salutation: b.salutation,
        email: b.email,
        phone: b.phone,
        importedFrom: SOURCE_NAME,
        createdAt: b.createdAt ?? now,
        updatedAt: now
      }))).onConflictDoNothing().returning({ id: guests.id, email: guests.email, phone: guests.phone })
      // Match returned rows back by contact (a conflicting email returns nothing).
      for (const b of chunk) {
        const row = rows.find(r => (b.email && r.email === b.email) || (!b.email && r.phone === b.phone))
        if (row) newGuestIds.set(b, row.id)
      }
    }

    const values = plan.parsed.map((b, i) => {
      const link = plan.links[i]
      const guestId = typeof link === 'number' ? link : link ? newGuestIds.get(link) ?? null : null
      return {
        reference: b.reference,
        guestId,
        tableId: b.tableName ? plan.tableIds.get(tableKey(b.tableName)) ?? null : null,
        date: b.date,
        time: `${b.time}:00`,
        durationMinutes: b.durationMinutes,
        partySize: b.partySize,
        seatedGuests: b.seatedGuests,
        firstName: b.firstName,
        lastName: b.lastName,
        email: b.email,
        phone: b.phone,
        notes: b.notes,
        internalNotes: b.internalNotes,
        bookedBy: b.bookedBy,
        tags: b.tags,
        source: b.source,
        status: b.status,
        // Never email anyone about a booking from the old system.
        notifyGuest: false,
        importedFrom: SOURCE_NAME,
        externalId: b.externalId,
        arrivedAt: b.seatedAt,
        seatedAt: b.seatedAt,
        finishedAt: b.finishedAt,
        createdAt: b.createdAt ?? now,
        updatedAt: now
      }
    })

    let created = 0
    for (let i = 0; i < values.length; i += 250) {
      created += (await tx.insert(reservations).values(values.slice(i, i + 250)).onConflictDoNothing().returning({ id: reservations.id })).length
    }

    // Guests whose real bookings are now here no longer need the totals
    // copied from the guest book; keeping both would count visits twice.
    const linkedIds = [...new Set(values.map(v => v.guestId).filter((id): id is number => id !== null))]
    for (let i = 0; i < linkedIds.length; i += 1000) {
      await tx.update(guests)
        .set({ priorVisits: 0, priorNoShows: 0, priorCancellations: 0, priorLastVisit: null })
        .where(inArray(guests.id, linkedIds.slice(i, i + 1000)))
    }

    return { created, newGuests: newGuestIds.size, guestsLinked: linkedIds.length }
  })
}
