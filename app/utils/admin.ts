export interface AdminReservation {
  id: number
  reference: string
  date: string
  time: string
  durationMinutes: number
  partySize: number
  seatedGuests: number | null
  notifyGuest: boolean
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  notes: string | null
  internalNotes: string | null
  tags: string[]
  source: ReservationSource
  status: ReservationStatus
  tableId: number | null
  tableName: string | null
  sectionId: number | null
  sectionName: string | null
  guestId: number | null
  guestSalutation: string | null
  guestTags: string[]
  guestVip: boolean
  guestNotes: string | null
  guestVisits: number
  arrivedAt: string | null
  seatedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
  createdByName: string | null
  updatedByName: string | null
}

export interface GuestHistoryItem {
  id: number
  reference: string
  date: string
  time: string
  partySize: number
  seatedGuests: number | null
  durationMinutes: number
  seatedAt: string | null
  finishedAt: string | null
  status: ReservationStatus
  source: ReservationSource
  tags: string[]
  notes: string | null
  internalNotes: string | null
  tableName: string | null
  sectionName: string | null
}

export interface GuestProfile {
  id: number
  salutation: string | null
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  tags: string[]
  notes: string | null
  vip: boolean
  marketingOptIn: boolean
  birthDay: number | null
  birthMonth: number | null
  birthYear: number | null
  anniversaryDay: number | null
  anniversaryMonth: number | null
  anniversaryYear: number | null
  gender: string | null
  preferredLanguage: string | null
  preferredSectionId: number | null
  membershipId: string | null
  membershipStatus: string | null
  address: string | null
  country: string | null
  city: string | null
  state: string | null
  socialLinks: { platform: string, url: string }[]
  createdAt: string
  history: GuestHistoryItem[]
}

export interface ActivityEntry {
  id: number
  action: string
  changes: { field: string, from: unknown, to: unknown }[]
  createdAt: string
  staffName: string | null
}

export function formatStamp(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function staffInitials(name: string | null) {
  if (!name) return 'Online'
  return name.split(/\s+/).map(p => `${p[0]}.`).join('').toUpperCase()
}

// Minutes actually spent at the table, once the party has been seated.
export function actualMinutes(r: { seatedAt: string | null, finishedAt: string | null }) {
  if (!r.seatedAt) return null
  const end = r.finishedAt ? new Date(r.finishedAt) : new Date()
  return Math.max(0, Math.round((end.getTime() - new Date(r.seatedAt).getTime()) / 60000))
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

// Opens a narrow, receipt-printer-friendly ticket and triggers the print dialog.
export function printWaiterTicket(r: AdminReservation) {
  const w = window.open('', '_blank', 'width=380,height=600')
  if (!w) return
  const rows: [string, string][] = [
    ['Date', formatDateLong(r.date)],
    ['Time', formatTime(r.time)],
    ['Guests', String(r.partySize)],
    ['Table', r.tableName ? `${r.tableName}${r.sectionName ? ` · ${r.sectionName}` : ''}` : 'Unassigned'],
    ['Ref', `#${r.reference}`]
  ]
  const tags = [...r.guestTags, ...r.tags]
  w.document.write(`<!doctype html><html><head><title>Ticket #${escapeHtml(r.reference)}</title>
<style>
  body { font: 14px/1.4 -apple-system, Helvetica, Arial, sans-serif; margin: 16px; color: #000; }
  h1 { font-size: 20px; margin: 0 0 2px; } .sub { margin: 0 0 12px; color: #444; }
  table { width: 100%; border-collapse: collapse; } td { padding: 4px 0; border-bottom: 1px dashed #999; }
  td:first-child { color: #555; width: 70px; } .box { margin-top: 12px; padding: 8px; border: 1px solid #000; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #555; }
  @page { margin: 6mm; }
</style></head><body>
<h1>${escapeHtml([r.guestSalutation, guestName(r)].filter(Boolean).join(' '))}${r.guestVip ? ' ★ VIP' : ''}</h1>
<p class="sub">YANA Restaurant${r.phone ? ` · ${escapeHtml(r.phone)}` : ''}</p>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}</table>
${tags.length ? `<div class="box"><div class="label">Tags</div>${escapeHtml(tags.join(', '))}</div>` : ''}
${r.notes ? `<div class="box"><div class="label">Guest request</div>${escapeHtml(r.notes)}</div>` : ''}
${r.guestNotes ? `<div class="box"><div class="label">Guest profile</div>${escapeHtml(r.guestNotes)}</div>` : ''}
${r.internalNotes ? `<div class="box"><div class="label">Staff notes</div>${escapeHtml(r.internalNotes)}</div>` : ''}
<script>window.onload = () => { window.print() }<\/script>
</body></html>`)
  w.document.close()
}

export interface FloorTable {
  id?: number
  sectionId?: number
  name: string
  minCovers: number
  maxCovers: number
  shape: 'square' | 'rect' | 'round'
  x: number
  y: number
  width: number
  height: number
}

export interface FloorDecor {
  kind: 'wall' | 'bar' | 'zone' | 'door' | 'plant' | 'label'
  label: string | null
  x: number
  y: number
  width: number
  height: number
}

export interface FloorSection {
  id?: number
  name: string
  tables: FloorTable[]
  decor: FloorDecor[]
}

export const FLOOR_WIDTH = 1400
export const FLOOR_HEIGHT = 800

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayIso() {
  return isoDate(new Date())
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export function formatDateLong(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const hour = (h ?? 0) % 24
  return `${hour % 12 || 12}:${pad(m ?? 0)}${hour < 12 ? 'am' : 'pm'}`
}

export function nowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function guestName(r: { firstName: string, lastName: string }) {
  return `${r.firstName} ${r.lastName}`.trim()
}

export function initials(r: { firstName: string, lastName: string }) {
  return `${r.firstName[0] ?? ''}${r.lastName[0] ?? ''}`.toUpperCase()
}

export function errorMessage(err: any, fallback: string) {
  return err?.data?.statusMessage || err?.statusMessage || fallback
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = rows.map(r => r.map(escape).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
