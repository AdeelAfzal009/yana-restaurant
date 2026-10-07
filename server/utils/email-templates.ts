// Reservation emails. The wording comes from the editable EmailContent
// (shared/utils/email-content.ts, edited in Admin → Email templates); the
// branded layout below is fixed. Table-based with inline styles, because that
// is what Outlook and Gmail reliably render.
import { DEFAULT_EMAIL_CONTENT, fillPlaceholders } from '#shared/utils/email-content'
import type { EmailContent, EmailPlaceholder, EmailTemplateContent, EmailTemplateKey } from '#shared/utils/email-content'
import { getMailConfig } from './mail'
import type { MailMessage } from './mail'

export type EmailTemplate = EmailTemplateKey

export interface ReservationEmailData {
  reference: string
  firstName: string
  lastName: string
  salutation?: string | null
  email: string
  phone?: string | null
  /** YYYY-MM-DD, Abu Dhabi wall-clock. */
  date: string
  /** HH:MM, Abu Dhabi wall-clock. */
  time: string
  partySize: number
  durationMinutes: number
  tableName?: string | null
  sectionName?: string | null
  notes?: string | null
  source?: string
}

const NAVY = '#0F1E2E'
const GOLD = '#D9B690'
const GOLD_DK = '#8A6B45'
const CREAM = '#F3ECE1'
const INK = '#16232F'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

// Dates are stored as local wall-clock, so they are formatted from their parts
// rather than passed through a timezone conversion.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatEmailDate(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const dow = DAYS[new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()]
  return `${dow}, ${d} ${MONTHS[m! - 1]} ${y}`
}

export function formatEmailTime(time: string) {
  const [h, min] = time.split(':').map(Number)
  const hour = h! % 12 || 12
  return `${hour}:${String(min ?? 0).padStart(2, '0')} ${h! < 12 ? 'AM' : 'PM'}`
}

function guestName(r: ReservationEmailData) {
  return [r.salutation, r.firstName, r.lastName].filter(Boolean).join(' ').trim()
}

function detailRows(r: ReservationEmailData, includeTable: boolean) {
  const rows: [string, string][] = [
    ['Reference', r.reference],
    ['Date', formatEmailDate(r.date)],
    ['Time', formatEmailTime(r.time)],
    ['Guests', String(r.partySize)]
  ]
  if (includeTable && r.tableName) {
    rows.push(['Table', r.sectionName ? `${r.tableName} · ${r.sectionName}` : r.tableName])
  }
  if (r.notes) rows.push(['Your note', r.notes])
  return rows
}

interface LayoutParts {
  preheader: string
  heading: string
  /** Already-escaped HTML. */
  intro: string
  rows: [string, string][]
  /** Already-escaped HTML. */
  body?: string
  ctaLabel?: string
  ctaUrl?: string
  /** Already-escaped HTML. */
  footerNote?: string
  tagline: string
  address: string
  /** Already-escaped HTML. */
  changeNote?: string
}

function layout(opts: LayoutParts) {
  const { siteUrl } = getMailConfig()
  const rows = opts.rows.map(([label, value]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #E4DFD6;color:#66707A;font-size:13px;width:38%;">${escapeHtml(label)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #E4DFD6;color:${INK};font-size:15px;font-weight:600;">${escapeHtml(value)}</td>
            </tr>`).join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:'Montserrat',Helvetica,Arial,sans-serif;">
<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid #E4DFD6;">
        <tr>
          <td style="background:${NAVY};padding:30px 32px;text-align:center;">
            <a href="${siteUrl}" style="text-decoration:none;">
              <img src="${siteUrl}/images/email/yana-logo.png" width="190" height="53" alt="YANA"
                   style="display:block;margin:0 auto;width:190px;height:auto;border:0;outline:none;text-decoration:none;color:${GOLD};font-size:24px;letter-spacing:8px;">
            </a>
            ${opts.tagline ? `<div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:3px;margin-top:12px;text-transform:uppercase;">${escapeHtml(opts.tagline)}</div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:34px 32px 8px;">
            <h1 style="margin:0 0 14px;font-size:24px;font-weight:300;color:${INK};letter-spacing:-0.3px;">${escapeHtml(opts.heading)}</h1>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#4A5561;">${opts.intro}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E4DFD6;">${rows}
            </table>
            ${opts.body ? `<p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#4A5561;">${opts.body}</p>` : ''}
            ${opts.ctaLabel && opts.ctaUrl
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;">
              <tr><td style="background:${GOLD};">
                <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;padding:14px 30px;color:${NAVY};font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:600;">${escapeHtml(opts.ctaLabel)}</a>
              </td></tr>
            </table>`
              : ''}
          </td>
        </tr>
        ${opts.changeNote || opts.footerNote
          ? `<tr>
          <td style="padding:22px 32px 30px;">
            ${opts.changeNote ? `<p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#66707A;">${opts.changeNote}</p>` : ''}
            ${opts.footerNote ? `<p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#66707A;">${opts.footerNote}</p>` : ''}
          </td>
        </tr>`
          : '<tr><td style="padding:0 0 22px;"></td></tr>'}
        <tr>
          <td style="background:${NAVY};padding:22px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.72);font-size:12px;line-height:1.7;">${escapeHtml(opts.address)}</p>
            <a href="${siteUrl}" style="color:${GOLD};font-size:12px;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function textBlock(parts: { heading: string, intro: string, rows: [string, string][], body?: string, ctaLabel?: string, ctaUrl?: string, footerNote?: string, changeNote?: string, address: string }) {
  const { siteUrl } = getMailConfig()
  return [
    'YANA RESTAURANT',
    '',
    parts.heading,
    '',
    parts.intro,
    '',
    ...parts.rows.map(([k, v]) => `${k}: ${v}`),
    '',
    ...(parts.body ? [parts.body, ''] : []),
    ...(parts.ctaLabel && parts.ctaUrl ? [`${parts.ctaLabel}: ${parts.ctaUrl}`, ''] : []),
    ...(parts.changeNote ? [parts.changeNote, ''] : []),
    ...(parts.footerNote ? [parts.footerNote, ''] : []),
    parts.address,
    siteUrl
  ].join('\n')
}

// ---- Calendar invite -------------------------------------------------------

export function buildIcs(r: ReservationEmailData, address = DEFAULT_EMAIL_CONTENT.shared.address) {
  const [y, m, d] = r.date.split('-')
  const [hh, mm] = r.time.split(':')
  const start = `${y}${m}${d}T${hh}${mm}00`
  const endMinutes = Number(hh) * 60 + Number(mm) + r.durationMinutes
  const endStamp = `${y}${m}${d}T${String(Math.floor(endMinutes / 60) % 24).padStart(2, '0')}${String(endMinutes % 60).padStart(2, '0')}00`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const escape = (v: string) => v.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YANA Restaurant//Reservations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:reservation-${r.reference}@yanarestaurants.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Dubai:${start}`,
    `DTEND;TZID=Asia/Dubai:${endStamp}`,
    `SUMMARY:${escape(`Dinner at YANA (${r.partySize} guests)`)}`,
    `DESCRIPTION:${escape(`Reservation ${r.reference} for ${r.partySize} guests.`)}`,
    `LOCATION:${escape(address)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

// ---- Templates -------------------------------------------------------------

function placeholderValues(r: ReservationEmailData): Record<EmailPlaceholder, string> {
  const { siteUrl, phone } = getMailConfig()
  return {
    firstName: r.firstName,
    lastName: r.lastName,
    guestName: guestName(r) || r.firstName,
    reference: r.reference,
    date: formatEmailDate(r.date),
    dateIso: r.date,
    time: formatEmailTime(r.time),
    partySize: String(r.partySize),
    tableName: r.tableName ? (r.sectionName ? `${r.tableName} · ${r.sectionName}` : r.tableName) : '',
    phone,
    siteUrl
  }
}

// Turns one editable template into plain-text and HTML versions of each field.
// In HTML the wording is escaped first and the guest's details are escaped as
// they go in, so nothing typed in the dashboard or by a guest can inject markup.
function renderFields(t: EmailTemplateContent, shared: EmailContent['shared'], r: ReservationEmailData) {
  const vars = placeholderValues(r)
  const plain = (tpl: string) => fillPlaceholders(tpl, vars)

  const htmlVars = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, escapeHtml(v)])) as Record<EmailPlaceholder, string>
  htmlVars.phone = `<a href="tel:${escapeHtml(vars.phone.replace(/[^\d+]/g, ''))}" style="color:${GOLD_DK};text-decoration:none;">${escapeHtml(vars.phone)}</a>`
  const html = (tpl: string) => fillPlaceholders(escapeHtml(tpl), htmlVars).replace(/\n/g, '<br>')

  // Links must end up as http(s) once filled in; anything else drops the button.
  const ctaUrl = plain(t.ctaUrl)
  const ctaOk = !!t.ctaLabel && /^https?:\/\/\S+$/i.test(ctaUrl)

  return {
    subject: plain(t.subject),
    preheader: plain(t.preheader),
    heading: plain(t.heading),
    intro: { text: plain(t.intro), html: html(t.intro) },
    body: { text: plain(t.body), html: html(t.body) },
    cta: ctaOk ? { label: plain(t.ctaLabel), url: ctaUrl } : null,
    footerNote: { text: plain(t.footerNote), html: html(t.footerNote) },
    changeNote: { text: plain(shared.changeNote), html: html(shared.changeNote) },
    tagline: plain(shared.tagline),
    address: shared.address
  }
}

export function buildEmail(template: EmailTemplate, r: ReservationEmailData, content: EmailContent = DEFAULT_EMAIL_CONTENT): MailMessage {
  const isStaff = template === 'staff_new_booking'

  let rows: [string, string][]
  if (isStaff) {
    rows = [
      ['Reference', r.reference],
      ['Guest', guestName(r) || r.firstName],
      ['Date', formatEmailDate(r.date)],
      ['Time', formatEmailTime(r.time)],
      ['Guests', String(r.partySize)],
      ['Phone', r.phone || '—'],
      ['Email', r.email || '—'],
      ['Source', r.source || 'online']
    ]
    if (r.notes) rows.push(['Guest note', r.notes])
  } else {
    rows = detailRows(r, template === 'booking_confirmed')
  }

  const f = renderFields(content.templates[template], content.shared, r)
  // The staff alert is internal, so it skips the guest-facing "change or cancel" line.
  const changeNote = isStaff ? undefined : f.changeNote

  return {
    to: isStaff ? '' : r.email,
    subject: f.subject,
    html: layout({
      preheader: f.preheader,
      heading: f.heading,
      intro: f.intro.html,
      rows,
      body: f.body.html || undefined,
      ctaLabel: f.cta?.label,
      ctaUrl: f.cta?.url,
      footerNote: f.footerNote.html || undefined,
      changeNote: changeNote?.html || undefined,
      tagline: f.tagline,
      address: f.address
    }),
    text: textBlock({
      heading: f.heading,
      intro: f.intro.text,
      rows,
      body: f.body.text || undefined,
      ctaLabel: f.cta?.label,
      ctaUrl: f.cta?.url,
      footerNote: f.footerNote.text || undefined,
      changeNote: changeNote?.text || undefined,
      address: f.address
    }),
    ...(template === 'booking_confirmed'
      ? { attachments: [{ filename: `yana-${r.reference}.ics`, content: buildIcs(r, f.address) }] }
      : {})
  }
}

// Sample booking used by the dashboard preview and test sends.
export function sampleEmailData(email: string): ReservationEmailData {
  const d = new Date(Date.now() + 3 * 86400000)
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    reference: 'YN7K4Q',
    firstName: 'Layla',
    lastName: 'Haddad',
    salutation: 'Ms',
    email,
    phone: '+971 50 123 4567',
    date,
    time: '20:00',
    partySize: 4,
    durationMinutes: 90,
    tableName: 'T12',
    sectionName: 'Terrace',
    notes: 'Celebrating an anniversary',
    source: 'online'
  }
}
