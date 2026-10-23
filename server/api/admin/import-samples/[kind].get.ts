import { requirePermission } from '../../../utils/auth'

// Sample sheets for the dashboard's two imports, so staff can see which
// columns to fill and in what format. Served as CSV (opens in Excel); the
// example rows use exactly the formats the importers read.

const SAMPLES = {
  // Same column names as ServMe's "Manager Report" export, which the bookings
  // import reads. Only "Reservation Date", "Reservation Time" and "Covers" are
  // required; the rest can be left empty.
  bookings: {
    permission: 'reservations',
    filename: 'yana-bookings-import-sample.csv',
    rows: [
      ['Reference', 'Reservation Date', 'Reservation Time', 'Covers', 'Guest Name', 'Phone Number', 'Email', 'Table no', 'Pre Service Status', 'In Service Status', 'Reservation Type', 'Source', 'Reservation Notes', 'Reservation Tags', 'Booked By', 'Seated', 'Duration', 'Creation Date', 'Creation Time', 'Seated Date', 'Seated Time', 'Left Date', 'Left Time'],
      ['A1B2C', '2026-11-05', '19:30', '4', 'Mr Omar Haddad', '+971 50 123 4567', 'omar@example.com', '7', 'Confirmed', 'Pending', 'Reservation', 'Phone', 'Window table if possible', 'Birthday', 'Sara', '', '120', '2026-10-28', '14:05', '', '', '', ''],
      ['D3E4F', '2026-10-14', '20:00', '2', 'Ms Lena Fischer', '+49 151 2345 6789', 'lena@example.com', 'T3', 'Confirmed', 'Left', 'Reservation', 'Widget', 'Vegetarian', '', '', '2', '105', '2026-10-10', '09:12', '2026-10-14', '20:04', '2026-10-14', '21:49'],
      ['G5H6J', '2026-10-15', '18:45', '3', 'Walk-in', '', '', 'BAR2', 'Confirmed', 'Left', 'Walk-in', '', '', '', '', '3', '90', '2026-10-15', '18:45', '2026-10-15', '18:45', '2026-10-15', '20:15'],
      ['K7L8M', '2026-10-16', '21:00', '6', 'Ms Aisha Al Mansoori', '+971 55 765 4321', '', '', 'Cancel', 'Pending', 'Reservation', 'Phone', 'Guest called to cancel', '', 'Sara', '', '', '2026-10-12', '11:30', '', '', '', '']
    ],
    notes: [
      'HOW TO FILL: one booking per row. Dates as YYYY-MM-DD, times as HH:MM (24-hour).',
      'Required: Reservation Date, Reservation Time, Covers. Everything else may be left empty.',
      'Pre Service Status: Confirmed, Pending or Cancel. In Service Status: Pending, Seated, Left or No-show.',
      'Reservation Type "Walk-in" marks a walk-in. Source "Widget" marks an online booking; anything else counts as phone.',
      'Table no must match a table name on the floor plan (e.g. 7, T3, BAR2). Seated = guests who came; Duration in minutes.',
      'Delete these HOW TO FILL lines and the example rows before importing.'
    ]
  },
  // Guest list (contacts). Only a name (or first name) is required; a phone
  // or email lets the import match guests who are already in the system.
  guests: {
    permission: 'guests',
    filename: 'yana-guests-import-sample.csv',
    rows: [
      ['Salutation', 'First Name', 'Last Name', 'Phone Number', 'Email', 'Gender', 'Birthday', 'Anniversary', 'Company', 'Job Title', 'Tags', 'Notes', 'Marketing Opt-in', 'VIP', 'Visits', 'Last Visit', 'City', 'Country', 'Preferred Language'],
      ['Mr', 'Omar', 'Haddad', '+971 50 123 4567', 'omar@example.com', 'Male', '1988-03-14', '06-21', 'Haddad Group', 'Director', 'Regular, Wine lover', 'Prefers table 7', 'Yes', 'Yes', '12', '2026-10-05', 'Abu Dhabi', 'United Arab Emirates', 'English'],
      ['Ms', 'Lena', 'Fischer', '+49 151 2345 6789', 'lena@example.com', 'Female', '22/09', '', '', '', 'Vegetarian', 'Allergic to nuts', 'No', 'No', '2', '2026-09-18', 'Berlin', 'Germany', 'German'],
      ['', 'Aisha', 'Al Mansoori', '+971 55 765 4321', '', '', '', '', '', '', '', '', '', '', '', '', 'Dubai', 'United Arab Emirates', 'Arabic']
    ],
    notes: [
      'HOW TO FILL: one guest per row. A first name is required; add a phone number or email so existing guests are matched instead of duplicated.',
      'Phone with country code (+971 …). Dates as YYYY-MM-DD; Birthday and Anniversary can also be day and month only (22/09 or 09-22).',
      'Tags separated by commas. Marketing Opt-in and VIP: Yes or No. Visits: number of past visits.',
      'Delete these HOW TO FILL lines and the example rows before importing.'
    ]
  }
} as const

const csvCell = (v: string) => /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v

export default defineEventHandler(async (event) => {
  const kind = getRouterParam(event, 'kind')
  const sample = kind === 'bookings' || kind === 'guests' ? SAMPLES[kind] : null
  if (!sample) throw createError({ statusCode: 404, statusMessage: 'No such sample' })
  await requirePermission(event, sample.permission)

  const width = sample.rows[0].length
  const lines = [
    ...sample.rows.map(r => r.map(csvCell).join(',')),
    '',
    ...sample.notes.map(n => [csvCell(n), ...Array(width - 1).fill('')].join(','))
  ]
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${sample.filename}"`
  })
  // The byte-order mark makes Excel open the file as UTF-8 (names with accents).
  return `﻿${lines.join('\r\n')}\r\n`
})
