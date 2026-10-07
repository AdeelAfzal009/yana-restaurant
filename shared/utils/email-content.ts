// Editable wording for the reservation emails. Managers change it in
// Admin → Email templates; it is stored as one JSON document and merged over
// these defaults, so a missing or partial save can never produce a blank email.
// The branded layout and the booking-details table stay in code
// (server/utils/email-templates.ts) so emails always render correctly.

export const EMAIL_TEMPLATE_KEYS = [
  'booking_received',
  'booking_confirmed',
  'booking_cancelled',
  'waitlist_added',
  'staff_new_booking'
] as const
export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number]

export const EMAIL_TEMPLATE_META: Record<EmailTemplateKey, { name: string, when: string, audience: 'Guest' | 'Staff' }> = {
  booking_received: { name: 'Booking received', when: 'Sent when a guest books online and the booking is pending.', audience: 'Guest' },
  booking_confirmed: { name: 'Booking confirmed', when: 'Sent when a booking is confirmed. Includes a calendar invite.', audience: 'Guest' },
  booking_cancelled: { name: 'Booking cancelled', when: 'Sent when a booking is cancelled.', audience: 'Guest' },
  waitlist_added: { name: 'Added to waitlist', when: 'Sent when a booking is put on the waitlist.', audience: 'Guest' },
  staff_new_booking: { name: 'New booking alert', when: 'Sent to the team inbox for every new online booking.', audience: 'Staff' }
}

export const EMAIL_PLACEHOLDERS = [
  { key: 'firstName', label: 'Guest first name' },
  { key: 'lastName', label: 'Guest last name' },
  { key: 'guestName', label: 'Guest full name' },
  { key: 'reference', label: 'Booking reference' },
  { key: 'date', label: 'Date, e.g. Friday, 9 October 2026' },
  { key: 'time', label: 'Time, e.g. 8:00 PM' },
  { key: 'partySize', label: 'Number of guests' },
  { key: 'tableName', label: 'Table (confirmed bookings)' },
  { key: 'phone', label: 'Restaurant phone' },
  { key: 'siteUrl', label: 'Website address' }
] as const
export type EmailPlaceholder = (typeof EMAIL_PLACEHOLDERS)[number]['key'] | 'dateIso'

export interface EmailTemplateContent {
  subject: string
  /** Grey preview line shown next to the subject in most inboxes. */
  preheader: string
  heading: string
  intro: string
  /** Optional extra paragraph under the booking details. */
  body: string
  ctaLabel: string
  ctaUrl: string
  /** Optional small note above the footer. */
  footerNote: string
}

export interface EmailSharedContent {
  tagline: string
  address: string
  /** The "need to change or cancel" line every guest email ends with. */
  changeNote: string
}

export interface EmailContent {
  shared: EmailSharedContent
  templates: Record<EmailTemplateKey, EmailTemplateContent>
}

export const EMAIL_FIELD_LIMITS: Record<keyof EmailTemplateContent | keyof EmailSharedContent, number> = {
  subject: 160,
  preheader: 160,
  heading: 120,
  intro: 800,
  body: 1200,
  ctaLabel: 40,
  ctaUrl: 400,
  footerNote: 400,
  tagline: 80,
  address: 160,
  changeNote: 300
}

export const DEFAULT_EMAIL_CONTENT: EmailContent = {
  shared: {
    tagline: 'Pan-Asian Fusion · Peruvian Flair',
    address: 'Al Saadiyat Island, Abu Dhabi, United Arab Emirates',
    changeNote: 'Need to change or cancel? Call us on {{phone}} and quote your reference.'
  },
  templates: {
    booking_received: {
      subject: 'Reservation request received — {{reference}}',
      preheader: 'We are confirming your table for {{date}}.',
      heading: 'We have your reservation request',
      intro: 'Thank you, {{firstName}}. We have received your request and our team is confirming it now — you will get a second email once your table is held.',
      body: '',
      ctaLabel: 'View the Menu',
      ctaUrl: '{{siteUrl}}/menu',
      footerNote: ''
    },
    booking_confirmed: {
      subject: 'Confirmed: {{date}} at {{time}} — {{reference}}',
      preheader: '{{date}} at {{time}}, {{partySize}} guests.',
      heading: 'Your table is confirmed',
      intro: 'We look forward to welcoming you, {{firstName}}. Your table is held as below.',
      body: 'Please arrive a few minutes early. We hold tables for 15 minutes past the reservation time, after which we may need to release them.',
      ctaLabel: 'Get Directions',
      ctaUrl: 'https://maps.google.com/?q=YANA+Restaurant+Saadiyat+Island+Abu+Dhabi',
      footerNote: 'A calendar invitation is attached to this email.'
    },
    booking_cancelled: {
      subject: 'Cancelled: your YANA reservation — {{reference}}',
      preheader: 'Your reservation has been cancelled.',
      heading: 'Your reservation has been cancelled',
      intro: 'Your booking below has been cancelled, {{firstName}}. If this was not what you expected, please call us and we will put it right.',
      body: '',
      ctaLabel: 'Book Another Evening',
      ctaUrl: '{{siteUrl}}/reservation',
      footerNote: ''
    },
    waitlist_added: {
      subject: 'Waitlisted for {{date}} — {{reference}}',
      preheader: 'We will call you as soon as a table opens.',
      heading: 'You are on the waitlist',
      intro: 'Thank you, {{firstName}}. We are fully booked at that time, so we have added you to the waitlist and will call you the moment a table frees up.',
      body: '',
      ctaLabel: '',
      ctaUrl: '',
      footerNote: ''
    },
    staff_new_booking: {
      subject: 'New booking — {{date}} {{time}}, {{partySize}} guests ({{reference}})',
      preheader: 'A guest has just booked through the website.',
      heading: 'New online reservation',
      intro: 'A guest has just booked through the website. Confirm it in the dashboard to send their confirmation email.',
      body: '',
      ctaLabel: 'Open Dashboard',
      ctaUrl: '{{siteUrl}}/admin/reservations?date={{dateIso}}',
      footerNote: ''
    }
  }
}

const text = (value: unknown, max: number, fallback: string) =>
  typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : fallback

// Fields that must never be blank; if a save empties them, the default comes back.
const REQUIRED: (keyof EmailTemplateContent)[] = ['subject', 'heading', 'intro']

// Merges anything (a saved row, a request body) over the defaults. Unknown keys
// are dropped, every field is trimmed and length-limited.
export function normalizeEmailContent(input: unknown): EmailContent {
  const src = (input && typeof input === 'object' ? input : {}) as { shared?: unknown, templates?: unknown }
  const d = DEFAULT_EMAIL_CONTENT
  const L = EMAIL_FIELD_LIMITS

  const shared = (src.shared && typeof src.shared === 'object' ? src.shared : {}) as Partial<Record<keyof EmailSharedContent, unknown>>
  const templatesIn = (src.templates && typeof src.templates === 'object' ? src.templates : {}) as Partial<Record<EmailTemplateKey, unknown>>

  const templates = {} as Record<EmailTemplateKey, EmailTemplateContent>
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const t = (templatesIn[key] && typeof templatesIn[key] === 'object' ? templatesIn[key] : {}) as Partial<Record<keyof EmailTemplateContent, unknown>>
    const def = d.templates[key]
    const out = {} as EmailTemplateContent
    for (const field of Object.keys(def) as (keyof EmailTemplateContent)[]) {
      out[field] = text(t[field], L[field], def[field])
      if (REQUIRED.includes(field) && !out[field]) out[field] = def[field]
    }
    // Single-line fields.
    out.subject = out.subject.replace(/\s*\n\s*/g, ' ')
    out.preheader = out.preheader.replace(/\s*\n\s*/g, ' ')
    out.ctaLabel = out.ctaLabel.replace(/\s*\n\s*/g, ' ')
    out.ctaUrl = out.ctaUrl.replace(/\s+/g, '')
    templates[key] = out
  }

  return {
    shared: {
      tagline: text(shared.tagline, L.tagline, d.shared.tagline),
      address: text(shared.address, L.address, d.shared.address) || d.shared.address,
      changeNote: text(shared.changeNote, L.changeNote, d.shared.changeNote)
    },
    templates
  }
}

// Replaces {{placeholders}}. Unknown placeholders are left visible so a typo is
// easy to spot in the preview instead of silently vanishing.
export function fillPlaceholders(template: string, vars: Partial<Record<EmailPlaceholder, string>>, encode: (v: string) => string = v => v) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key as EmailPlaceholder]
    return value === undefined ? match : encode(value)
  })
}
