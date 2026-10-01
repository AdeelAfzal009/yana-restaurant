// Guest-facing email content. Table-based layout with inline styles, because
// that is what Outlook and Gmail reliably render.
import { getMailConfig } from './mail'
import type { MailMessage } from './mail'

export type EmailTemplate =
  | 'booking_received'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'waitlist_added'
  | 'staff_new_booking'

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

const ADDRESS = 'Al Saadiyat Island, Abu Dhabi, United Arab Emirates'

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

function layout(opts: { preheader: string, heading: string, intro: string, rows: [string, string][], body?: string, ctaLabel?: string, ctaUrl?: string, footerNote?: string }) {
  const { siteUrl, phone } = getMailConfig()
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
            <div style="color:${GOLD};font-size:26px;letter-spacing:8px;font-weight:300;">YANA</div>
            <div style="color:rgba(255,255,255,0.6);font-size:10px;letter-spacing:3px;margin-top:8px;text-transform:uppercase;">Pan-Asian Fusion &middot; Peruvian Flair</div>
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
                <a href="${opts.ctaUrl}" style="display:inline-block;padding:14px 30px;color:${NAVY};font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:600;">${escapeHtml(opts.ctaLabel)}</a>
              </td></tr>
            </table>`
              : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 30px;">
            <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#66707A;">
              Need to change or cancel? Call us on
              <a href="tel:${phone.replace(/\s/g, '')}" style="color:${GOLD_DK};text-decoration:none;">${escapeHtml(phone)}</a>
              and quote your reference.
            </p>
            ${opts.footerNote ? `<p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#66707A;">${opts.footerNote}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="background:${NAVY};padding:22px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.72);font-size:12px;line-height:1.7;">${escapeHtml(ADDRESS)}</p>
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

function textBlock(heading: string, intro: string, rows: [string, string][], extra?: string) {
  const { siteUrl, phone } = getMailConfig()
  return [
    'YANA RESTAURANT',
    '',
    heading,
    '',
    intro.replace(/<[^>]*>/g, ''),
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    ...(extra ? [extra.replace(/<[^>]*>/g, ''), ''] : []),
    `Need to change or cancel? Call ${phone} and quote your reference.`,
    '',
    ADDRESS,
    siteUrl
  ].join('\n')
}

// ---- Calendar invite -------------------------------------------------------

export function buildIcs(r: ReservationEmailData) {
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
    `LOCATION:${escape(ADDRESS)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

// ---- Templates -------------------------------------------------------------

export function buildEmail(template: EmailTemplate, r: ReservationEmailData): MailMessage {
  const { siteUrl } = getMailConfig()
  const first = escapeHtml(r.firstName)

  switch (template) {
    case 'booking_received': {
      const rows = detailRows(r, false)
      const heading = 'We have your reservation request'
      const intro = `Thank you, ${first}. We have received your request and our team is confirming it now — you will get a second email once your table is held.`
      return {
        to: r.email,
        subject: `Reservation request received — ${r.reference}`,
        html: layout({ preheader: `We are confirming your table for ${formatEmailDate(r.date)}.`, heading, intro, rows, ctaLabel: 'View the Menu', ctaUrl: `${siteUrl}/menu` }),
        text: textBlock(heading, intro, rows)
      }
    }

    case 'booking_confirmed': {
      const rows = detailRows(r, true)
      const heading = 'Your table is confirmed'
      const intro = `We look forward to welcoming you, ${first}. Your table is held as below.`
      const body = 'Please arrive a few minutes early. We hold tables for 15 minutes past the reservation time, after which we may need to release them.'
      return {
        to: r.email,
        subject: `Confirmed: ${formatEmailDate(r.date)} at ${formatEmailTime(r.time)} — ${r.reference}`,
        html: layout({ preheader: `${formatEmailDate(r.date)} at ${formatEmailTime(r.time)}, ${r.partySize} guests.`, heading, intro, rows, body, ctaLabel: 'Get Directions', ctaUrl: 'https://maps.google.com/?q=YANA+Restaurant+Saadiyat+Island+Abu+Dhabi', footerNote: 'A calendar invitation is attached to this email.' }),
        text: textBlock(heading, intro, rows, body),
        attachments: [{ filename: `yana-${r.reference}.ics`, content: buildIcs(r) }]
      }
    }

    case 'booking_cancelled': {
      const rows = detailRows(r, false)
      const heading = 'Your reservation has been cancelled'
      const intro = `Your booking below has been cancelled, ${first}. If this was not what you expected, please call us and we will put it right.`
      return {
        to: r.email,
        subject: `Cancelled: your YANA reservation — ${r.reference}`,
        html: layout({ preheader: 'Your reservation has been cancelled.', heading, intro, rows, ctaLabel: 'Book Another Evening', ctaUrl: `${siteUrl}/reservation` }),
        text: textBlock(heading, intro, rows)
      }
    }

    case 'waitlist_added': {
      const rows = detailRows(r, false)
      const heading = 'You are on the waitlist'
      const intro = `Thank you, ${first}. We are fully booked at that time, so we have added you to the waitlist and will call you the moment a table frees up.`
      return {
        to: r.email,
        subject: `Waitlisted for ${formatEmailDate(r.date)} — ${r.reference}`,
        html: layout({ preheader: 'We will call you as soon as a table opens.', heading, intro, rows }),
        text: textBlock(heading, intro, rows)
      }
    }

    case 'staff_new_booking': {
      const rows: [string, string][] = [
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
      const heading = 'New online reservation'
      const intro = 'A guest has just booked through the website. Confirm it in the dashboard to send their confirmation email.'
      return {
        to: '',
        subject: `New booking — ${formatEmailDate(r.date)} ${formatEmailTime(r.time)}, ${r.partySize} guests (${r.reference})`,
        html: layout({ preheader: intro, heading, intro, rows, ctaLabel: 'Open Dashboard', ctaUrl: `${siteUrl}/admin/reservations?date=${r.date}` }),
        text: textBlock(heading, intro, rows)
      }
    }
  }
}
