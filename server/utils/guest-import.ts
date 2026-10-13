import { and, eq, isNotNull } from 'drizzle-orm'
import readXlsxFile from 'read-excel-file/node'
import { GENDERS, SALUTATIONS } from '#shared/utils/reservation-meta'
import { guests, reservations } from '../database/schema'
import type { Guest } from '../database/schema'
import { useDb } from './db'
import { badRequest, EMAIL_RE } from './validate'

// Importing a guest list exported from another booking system (built around
// ServMe's guest book export, but columns are recognised by name, so other
// exports with similar headings work too).
//
// Guests are matched to existing profiles by email, then phone. A match only
// fills in what's missing and adds tags, never overwrites, so importing the
// same file twice changes nothing.

export const IMPORT_LIMITS = { bytes: 10 * 1024 * 1024, rows: 20_000 }

type Field =
  | 'salutation' | 'name' | 'firstName' | 'lastName' | 'phone' | 'email' | 'tags' | 'notes'
  | 'createdAt' | 'lastVisit' | 'gender' | 'birthday' | 'anniversary' | 'optIn' | 'company'
  | 'jobTitle' | 'visits' | 'noShows' | 'cancellations' | 'membershipId' | 'membershipStatus'
  | 'city' | 'country' | 'state' | 'language' | 'vip'

// Header names (lower-case, letters and digits only) each field is read from.
const COLUMNS: Record<Field, { label: string, headers: string[] }> = {
  salutation: { label: 'Salutation', headers: ['salutation', 'title'] },
  name: { label: 'Name', headers: ['name', 'fullname', 'guestname', 'guest'] },
  firstName: { label: 'First name', headers: ['firstname', 'first', 'givenname'] },
  lastName: { label: 'Last name', headers: ['lastname', 'last', 'surname', 'familyname'] },
  phone: { label: 'Phone', headers: ['phonenumber', 'phone', 'mobile', 'mobilenumber', 'telephone', 'contactnumber', 'tel'] },
  email: { label: 'Email', headers: ['email', 'emailaddress', 'mail'] },
  tags: { label: 'Tags', headers: ['guesttags', 'tags', 'tag'] },
  notes: { label: 'Notes', headers: ['guestnote', 'guestnotes', 'notes', 'note', 'comments'] },
  createdAt: { label: 'Guest since', headers: ['creationdate', 'createdat', 'created', 'datecreated'] },
  lastVisit: { label: 'Last visit', headers: ['dateoflastvisit', 'lastvisit', 'lastvisitdate'] },
  gender: { label: 'Gender', headers: ['gender', 'sex'] },
  birthday: { label: 'Birthday', headers: ['birthdaydate', 'birthday', 'dateofbirth', 'dob'] },
  anniversary: { label: 'Anniversary', headers: ['anniversary', 'anniversarydate'] },
  optIn: { label: 'Marketing opt-in', headers: ['marketingoptin', 'optin', 'marketing', 'newsletter', 'subscribed'] },
  company: { label: 'Company', headers: ['company', 'companyname', 'organisation', 'organization'] },
  jobTitle: { label: 'Job title', headers: ['jobtitle', 'position', 'role'] },
  visits: { label: 'Visits', headers: ['arrivals', 'visits', 'visitcount', 'totalvisits'] },
  noShows: { label: 'No-shows', headers: ['noshows', 'noshow'] },
  cancellations: { label: 'Cancellations', headers: ['cancellations', 'cancelled', 'cancellation'] },
  membershipId: { label: 'Membership ID', headers: ['membershipid'] },
  membershipStatus: { label: 'Membership status', headers: ['membershipstatus'] },
  city: { label: 'City', headers: ['city'] },
  country: { label: 'Country', headers: ['country'] },
  state: { label: 'State', headers: ['state', 'region'] },
  language: { label: 'Preferred language', headers: ['preferredlanguage', 'language'] },
  vip: { label: 'VIP', headers: ['vip'] }
}

// Labels the old system sets by itself from visit counts. Copied over they'd
// go stale, and visits are counted here anyway.
const AUTOMATIC_TAGS = new Set(['new guest', 'returning guest', 'first visit', 'regular guest'])

const INVISIBLE = /[​-‏‪-‮⁠﻿]/g

const key = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, '')

// ---------- Reading the file ----------

export type Cell = string | number | boolean | Date | null

function parseCsv(text: string): Cell[][] {
  const clean = text.replace(/^﻿/, '')
  const firstLine = clean.slice(0, clean.indexOf('\n') >>> 0)
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: Cell[][] = []
  let row: Cell[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter) { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(c => String(c ?? '').trim()))
}

export async function readSpreadsheet(file: { data: Buffer, filename?: string }): Promise<Cell[][]> {
  if (file.data.length > IMPORT_LIMITS.bytes) badRequest('The file is larger than 10 MB.')
  const name = (file.filename ?? '').toLowerCase()
  // .xlsx files are zip archives and start with "PK".
  if (name.endsWith('.xlsx') || file.data.subarray(0, 2).toString('latin1') === 'PK') {
    try {
      return await readXlsxFile(file.data) as Cell[][]
    } catch {
      badRequest('That Excel file could not be read. Try opening it and saving it again as .xlsx or .csv.')
    }
  }
  if (name.endsWith('.xls')) badRequest('Old .xls files aren\'t supported. Open it in Excel and save it as .xlsx or .csv.')
  return parseCsv(file.data.toString('utf8'))
}

// ---------- Cleaning values ----------

export const text = (v: Cell | undefined) => {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString()
  return String(v).replace(INVISIBLE, '').trim()
}

// Keeps a leading + and the digits; 00971… becomes +971….
export function cleanPhone(raw: string) {
  const compact = raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  const digits = compact.replace(/\D/g, '')
  if (digits.length < 7) return null
  if (compact.startsWith('00')) return `+${digits.slice(2)}`
  return compact
}

// One comparable form per number, so 0501234567, +971501234567 and
// 00971501234567 count as the same phone (UAE local numbers start with 0).
export function phoneKey(phone: string | null | undefined) {
  if (!phone) return null
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.length === 10 && digits.startsWith('0')) digits = `971${digits.slice(1)}`
  return digits.length >= 7 ? digits : null
}

// Dates in exports are restaurant (Abu Dhabi, UTC+4) wall-clock time.
export function parseDateTime(v: Cell | undefined): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  const s = text(v)
  let m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s)
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? '00'}:${m[5] ?? '00'}:${m[6] ?? '00'}+04:00`)
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/.exec(s)
  if (m) {
    const pad = (n: string) => n.padStart(2, '0')
    return new Date(`${m[3]}-${pad(m[2]!)}-${pad(m[1]!)}T${pad(m[4] ?? '0')}:${m[5] ?? '00'}:00+04:00`)
  }
  return null
}

// Birthday / anniversary: day and month, year optional.
function parseDayMonth(v: Cell | undefined): { day: number, month: number, year: number | null } | null {
  if (v instanceof Date) return { day: v.getUTCDate(), month: v.getUTCMonth() + 1, year: v.getUTCFullYear() }
  const s = text(v)
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)
  if (m) return valid(+m[3]!, +m[2]!, +m[1]!)
  m = /^-{0,2}(\d{1,2})-(\d{1,2})$/.exec(s)
  if (m) return valid(+m[2]!, +m[1]!, null)
  m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(s)
  if (m) return valid(+m[1]!, +m[2]!, m[3] ? +m[3] : null)
  return null
  function valid(day: number, month: number, year: number | null) {
    return day >= 1 && day <= 31 && month >= 1 && month <= 12 ? { day, month, year } : null
  }
}

const count = (v: Cell | undefined) => {
  const n = Number(text(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

const yes = (v: Cell | undefined) => /^(yes|y|true|1|subscribed|opted ?in)$/i.test(text(v))

const fromList = (value: string, list: readonly string[]) =>
  list.find(item => item.toLowerCase() === value.toLowerCase().replace(/\.$/, '')) ?? null

// ---------- Planning ----------

interface ImportedGuest {
  row: number
  firstName: string
  lastName: string
  salutation: string | null
  email: string | null
  phone: string | null
  tags: string[]
  notes: string | null
  vip: boolean
  marketingOptIn: boolean
  gender: string | null
  birthday: ReturnType<typeof parseDayMonth>
  anniversary: ReturnType<typeof parseDayMonth>
  membershipId: string | null
  membershipStatus: string | null
  city: string | null
  country: string | null
  state: string | null
  preferredLanguage: string | null
  createdAt: Date | null
  priorVisits: number
  priorNoShows: number
  priorCancellations: number
  priorLastVisit: Date | null
}

export interface ImportIssue { row: number, name: string, message: string }

export interface ImportPlan {
  totalRows: number
  source: string
  columns: { label: string, header: string }[]
  ignoredHeaders: string[]
  creates: ImportedGuest[]
  updates: { guestId: number, name: string, patch: Partial<typeof guests.$inferInsert> }[]
  unchanged: number
  merged: number
  skipped: ImportIssue[]
  warnings: ImportIssue[]
  droppedTags: Record<string, number>
}

const fullName = (g: { firstName: string, lastName: string }) => `${g.firstName} ${g.lastName}`.trim()

function mergeInto(a: ImportedGuest, b: ImportedGuest) {
  for (const k of ['salutation', 'email', 'phone', 'notes', 'gender', 'birthday', 'anniversary', 'membershipId', 'membershipStatus', 'city', 'country', 'state', 'preferredLanguage', 'createdAt'] as const) {
    if (!a[k] && b[k]) (a as any)[k] = b[k]
  }
  if (!a.lastName && b.lastName) a.lastName = b.lastName
  a.tags = [...new Set([...a.tags, ...b.tags])]
  a.vip ||= b.vip
  a.marketingOptIn ||= b.marketingOptIn
  a.priorVisits = Math.max(a.priorVisits, b.priorVisits)
  a.priorNoShows = Math.max(a.priorNoShows, b.priorNoShows)
  a.priorCancellations = Math.max(a.priorCancellations, b.priorCancellations)
  if (b.priorLastVisit && (!a.priorLastVisit || b.priorLastVisit > a.priorLastVisit)) a.priorLastVisit = b.priorLastVisit
}

export async function planImport(rows: Cell[][]): Promise<ImportPlan> {
  const headerIndex = rows.findIndex(r => r.filter(c => text(c)).length >= 2)
  if (headerIndex < 0) badRequest('The file is empty.')
  const header = rows[headerIndex]!.map(text)
  const data = rows.slice(headerIndex + 1)
  if (data.length > IMPORT_LIMITS.rows) badRequest(`Up to ${IMPORT_LIMITS.rows.toLocaleString()} rows can be imported at once.`)

  // Which column each field comes from (first matching header wins).
  const at: Partial<Record<Field, number>> = {}
  header.forEach((h, i) => {
    const k = key(h)
    const field = (Object.keys(COLUMNS) as Field[]).find(f => COLUMNS[f].headers.includes(k))
    if (field && at[field] === undefined) at[field] = i
  })
  if (at.name === undefined && at.firstName === undefined) badRequest('No name column found. The first row should have headings like "Name" or "First name".')
  if (at.phone === undefined && at.email === undefined) badRequest('No phone or email column found, so guests couldn\'t be matched to bookings.')

  const get = (r: Cell[], f: Field) => at[f] === undefined ? undefined : r[at[f]!]
  const usedIdx = new Set(Object.values(at))
  const ignoredHeaders = header.filter((h, i) => h && !usedIdx.has(i))
  const columns = (Object.keys(at) as Field[]).sort((a, b) => at[a]! - at[b]!).map(f => ({ label: COLUMNS[f].label, header: header[at[f]!]! }))
  const sourceColumn = header.findIndex(h => key(h) === 'source')
  const fromServme = header.some(h => key(h) === 'revpash') || data.some(r => sourceColumn >= 0 && /servme/i.test(text(r[sourceColumn])))
  const source = fromServme ? 'ServMe' : 'Import'

  const skipped: ImportIssue[] = []
  const warnings: ImportIssue[] = []
  const droppedTags: Record<string, number> = {}
  const parsed: ImportedGuest[] = []

  data.forEach((r, i) => {
    const row = headerIndex + i + 2 // spreadsheet row number, header = row 1
    let firstName = text(get(r, 'firstName'))
    let lastName = text(get(r, 'lastName'))
    // A title typed into the name ("Ms Becky") becomes the salutation.
    let titleInName: string | null = null
    if (!firstName) {
      const parts = text(get(r, 'name')).split(/\s+/).filter(Boolean)
      const title = parts.length > 1 ? fromList(parts[0]!, SALUTATIONS) : null
      if (title) {
        titleInName = title
        parts.shift()
      }
      firstName = parts.shift() ?? ''
      lastName ||= parts.join(' ')
    }
    const name = `${firstName} ${lastName}`.trim()
    if (!firstName) return skipped.push({ row, name: '(no name)', message: 'No name' })

    // Some cells hold more than one address; the first valid one is used.
    const rawEmail = text(get(r, 'email')).toLowerCase()
    const addresses = rawEmail.split(/[\s,;/]+/).filter(Boolean)
    let email: string | null = addresses.find(e => EMAIL_RE.test(e)) ?? null
    if (rawEmail && !email) warnings.push({ row, name, message: `Email "${rawEmail}" doesn't look valid, so it was left out` })
    else if (addresses.length > 1) warnings.push({ row, name, message: `Had ${addresses.length} emails; kept ${email}` })
    const phone = cleanPhone(text(get(r, 'phone')))
    if (!email && !phone) return skipped.push({ row, name, message: 'No phone number or email, so it can\'t be matched to bookings' })

    const tags: string[] = []
    let vip = yes(get(r, 'vip'))
    for (const tag of text(get(r, 'tags')).split(/[,;|]/).map(t => t.trim()).filter(Boolean)) {
      if (AUTOMATIC_TAGS.has(tag.toLowerCase())) {
        droppedTags[tag] = (droppedTags[tag] ?? 0) + 1
        continue
      }
      if (tag.toLowerCase() === 'vip') vip = true
      if (!tags.some(t => t.toLowerCase() === tag.toLowerCase())) tags.push(tag)
    }

    const noteParts = [text(get(r, 'notes'))]
    const company = text(get(r, 'company'))
    const jobTitle = text(get(r, 'jobTitle'))
    if (company || jobTitle) noteParts.push([company && `Company: ${company}`, jobTitle && `Job title: ${jobTitle}`].filter(Boolean).join(' · '))

    const salutationRaw = text(get(r, 'salutation'))
    const genderRaw = text(get(r, 'gender'))
    parsed.push({
      row,
      firstName,
      lastName,
      salutation: salutationRaw ? fromList(salutationRaw, SALUTATIONS) ?? salutationRaw.slice(0, 20) : titleInName,
      email,
      phone,
      tags: tags.slice(0, 20),
      notes: noteParts.filter(Boolean).join('\n').slice(0, 2000) || null,
      vip,
      marketingOptIn: yes(get(r, 'optIn')),
      gender: genderRaw ? fromList(genderRaw, GENDERS) ?? 'Other' : null,
      birthday: parseDayMonth(get(r, 'birthday')),
      anniversary: parseDayMonth(get(r, 'anniversary')),
      membershipId: text(get(r, 'membershipId')) || null,
      membershipStatus: text(get(r, 'membershipStatus')) || null,
      city: text(get(r, 'city')) || null,
      country: text(get(r, 'country')) || null,
      state: text(get(r, 'state')) || null,
      preferredLanguage: text(get(r, 'language')) || null,
      createdAt: parseDateTime(get(r, 'createdAt')),
      priorVisits: count(get(r, 'visits')),
      priorNoShows: count(get(r, 'noShows')),
      priorCancellations: count(get(r, 'cancellations')),
      priorLastVisit: parseDateTime(get(r, 'lastVisit'))
    })
  })

  // The same person listed twice in the file becomes one guest.
  const unique: ImportedGuest[] = []
  const byEmail = new Map<string, ImportedGuest>()
  const byPhone = new Map<string, ImportedGuest>()
  let merged = 0
  for (const g of parsed) {
    const pk = phoneKey(g.phone)
    const twin = (g.email && byEmail.get(g.email)) || (pk && byPhone.get(pk))
    if (twin) {
      mergeInto(twin, g)
      merged++
    } else unique.push(g)
    const target = twin || g
    if (target.email) byEmail.set(target.email, target)
    const tk = phoneKey(target.phone)
    if (tk) byPhone.set(tk, target)
  }

  // Match against guests already in the dashboard.
  const existing = await useDb().select().from(guests)
  // Guests whose real bookings were imported already have their visits counted.
  const withImportedBookings = new Set((await useDb().selectDistinct({ id: reservations.guestId }).from(reservations)
    .where(and(isNotNull(reservations.importedFrom), isNotNull(reservations.guestId)))).map(r => r.id!))
  const existingByEmail = new Map<string, Guest>()
  const existingByPhone = new Map<string, Guest>()
  for (const g of existing) {
    if (g.email) existingByEmail.set(g.email.toLowerCase(), g)
    const pk = phoneKey(g.phone)
    if (pk && !existingByPhone.has(pk)) existingByPhone.set(pk, g)
  }

  const creates: ImportedGuest[] = []
  const updates: ImportPlan['updates'] = []
  let unchanged = 0
  for (const g of unique) {
    const match = (g.email && existingByEmail.get(g.email)) || existingByPhone.get(phoneKey(g.phone) ?? '')
    if (!match) {
      creates.push(g)
      continue
    }
    const patch = buildPatch(match, g, existingByEmail, withImportedBookings.has(match.id))
    if (Object.keys(patch).length) updates.push({ guestId: match.id, name: fullName(match), patch })
    else unchanged++
  }

  return { totalRows: data.length, source, columns, ignoredHeaders, creates, updates, unchanged, merged, skipped, warnings, droppedTags }
}

// Fill-in-the-blanks changes for a guest who already exists.
function buildPatch(current: Guest, g: ImportedGuest, emailOwners: Map<string, Guest>, hasImportedBookings: boolean) {
  const patch: Partial<typeof guests.$inferInsert> = {}
  const fill = <K extends keyof Guest & keyof typeof guests.$inferInsert>(k: K, value: Guest[K] | null | undefined) => {
    if (value !== null && value !== undefined && value !== '' && (current[k] === null || current[k] === '')) (patch as any)[k] = value
  }
  fill('salutation', g.salutation)
  fill('lastName', g.lastName)
  if (g.email && !current.email && !emailOwners.has(g.email)) patch.email = g.email
  fill('phone', g.phone)
  fill('gender', g.gender)
  fill('membershipId', g.membershipId)
  fill('membershipStatus', g.membershipStatus)
  fill('city', g.city)
  fill('country', g.country)
  fill('state', g.state)
  fill('preferredLanguage', g.preferredLanguage)
  if (g.birthday && current.birthDay === null) Object.assign(patch, { birthDay: g.birthday.day, birthMonth: g.birthday.month, birthYear: g.birthday.year })
  if (g.anniversary && current.anniversaryDay === null) Object.assign(patch, { anniversaryDay: g.anniversary.day, anniversaryMonth: g.anniversary.month, anniversaryYear: g.anniversary.year })
  if (g.notes && !(current.notes ?? '').includes(g.notes)) patch.notes = current.notes ? `${current.notes}\n${g.notes}` : g.notes
  const newTags = g.tags.filter(t => !current.tags.some(c => c.toLowerCase() === t.toLowerCase()))
  if (newTags.length) patch.tags = [...current.tags, ...newTags]
  if (g.vip && !current.vip) patch.vip = true
  if (g.marketingOptIn && !current.marketingOptIn) patch.marketingOptIn = true
  // History: the larger number wins, so re-importing doesn't double it. Skipped
  // when the guest's actual bookings have been imported (those are counted).
  if (hasImportedBookings) return patch
  if (g.priorVisits > current.priorVisits) patch.priorVisits = g.priorVisits
  if (g.priorNoShows > current.priorNoShows) patch.priorNoShows = g.priorNoShows
  if (g.priorCancellations > current.priorCancellations) patch.priorCancellations = g.priorCancellations
  if (g.priorLastVisit && (!current.priorLastVisit || g.priorLastVisit > current.priorLastVisit)) patch.priorLastVisit = g.priorLastVisit
  return patch
}

// ---------- Saving ----------

export async function applyImport(plan: ImportPlan) {
  const now = new Date()
  const values = plan.creates.map(g => ({
    firstName: g.firstName,
    lastName: g.lastName,
    salutation: g.salutation,
    email: g.email,
    phone: g.phone,
    tags: g.tags,
    notes: g.notes,
    vip: g.vip,
    marketingOptIn: g.marketingOptIn,
    gender: g.gender,
    birthDay: g.birthday?.day ?? null,
    birthMonth: g.birthday?.month ?? null,
    birthYear: g.birthday?.year ?? null,
    anniversaryDay: g.anniversary?.day ?? null,
    anniversaryMonth: g.anniversary?.month ?? null,
    anniversaryYear: g.anniversary?.year ?? null,
    membershipId: g.membershipId,
    membershipStatus: g.membershipStatus,
    city: g.city,
    country: g.country,
    state: g.state,
    preferredLanguage: g.preferredLanguage,
    priorVisits: g.priorVisits,
    priorNoShows: g.priorNoShows,
    priorCancellations: g.priorCancellations,
    priorLastVisit: g.priorLastVisit,
    importedFrom: plan.source,
    createdAt: g.createdAt ?? now,
    updatedAt: now
  }))

  let created = 0
  await useDb().transaction(async (tx) => {
    for (let i = 0; i < values.length; i += 250) {
      // An email taken since the preview is simply skipped instead of failing the whole import.
      const rows = await tx.insert(guests).values(values.slice(i, i + 250)).onConflictDoNothing().returning({ id: guests.id })
      created += rows.length
    }
    for (const u of plan.updates) {
      await tx.update(guests).set({ ...u.patch, updatedAt: now }).where(eq(guests.id, u.guestId))
    }
  })
  return { created, updated: plan.updates.length }
}

// What the dashboard shows before and after importing.
export function describePlan(plan: ImportPlan) {
  const sample = plan.creates.slice(0, 8).map(g => ({
    row: g.row,
    name: fullName(g),
    phone: g.phone,
    email: g.email,
    tags: g.tags,
    visits: g.priorVisits,
    lastVisit: g.priorLastVisit?.toISOString() ?? null
  }))
  return {
    totalRows: plan.totalRows,
    source: plan.source,
    columns: plan.columns,
    ignoredHeaders: plan.ignoredHeaders,
    counts: {
      create: plan.creates.length,
      update: plan.updates.length,
      unchanged: plan.unchanged,
      merged: plan.merged,
      skipped: plan.skipped.length,
      withHistory: plan.creates.filter(g => g.priorVisits || g.priorNoShows || g.priorCancellations).length
    },
    updates: plan.updates.slice(0, 50).map(u => ({ name: u.name, fields: Object.keys(u.patch) })),
    skipped: plan.skipped.slice(0, 200),
    warnings: plan.warnings.slice(0, 200),
    droppedTags: plan.droppedTags,
    sample
  }
}
