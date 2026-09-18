import { sql } from 'drizzle-orm'
import { pgTable, pgEnum, serial, integer, text, boolean, date, time, timestamp, varchar, index, uniqueIndex, jsonb } from 'drizzle-orm/pg-core'

// pending = booked online, awaiting confirmation. The service lifecycle is
// confirmed → arrived → seated → finished; cancelled / no_show end a booking early.
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending', 'confirmed', 'cancelled', 'waitlist', 'arrived', 'seated', 'finished', 'no_show'
])
export const reservationSourceEnum = pgEnum('reservation_source', ['online', 'phone', 'walk_in', 'staff'])
export const staffRoleEnum = pgEnum('staff_role', ['manager', 'host'])
export const tableShapeEnum = pgEnum('table_shape', ['square', 'rect', 'round'])
export const decorKindEnum = pgEnum('decor_kind', ['wall', 'bar', 'zone', 'door', 'plant', 'label'])

// One profile per guest, matched by email, so visit history and preferences
// survive across bookings.
export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  salutation: text('salutation'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull().default(''),
  email: text('email'),
  phone: text('phone'),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  notes: text('notes'),
  vip: boolean('vip').notNull().default(false),
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
  // Birthday and anniversary are split so the year can be left out.
  birthDay: integer('birth_day'),
  birthMonth: integer('birth_month'),
  birthYear: integer('birth_year'),
  anniversaryDay: integer('anniversary_day'),
  anniversaryMonth: integer('anniversary_month'),
  anniversaryYear: integer('anniversary_year'),
  gender: text('gender'),
  preferredLanguage: text('preferred_language'),
  preferredSectionId: integer('preferred_section_id').references(() => floorSections.id, { onDelete: 'set null' }),
  membershipId: text('membership_id'),
  membershipStatus: text('membership_status'),
  address: text('address'),
  country: text('country'),
  city: text('city'),
  state: text('state'),
  socialLinks: jsonb('social_links').$type<{ platform: string, url: string }[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  uniqueIndex('guests_email_unique').on(sql`lower(${table.email})`).where(sql`${table.email} is not null`),
  index('guests_phone_idx').on(table.phone)
])

export const floorSections = pgTable('floor_sections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

// Coordinates are in a fixed 1400×800 canvas per section; the UI scales it to fit.
export const restaurantTables = pgTable('restaurant_tables', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull().references(() => floorSections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  minCovers: integer('min_covers').notNull().default(1),
  maxCovers: integer('max_covers').notNull(),
  shape: tableShapeEnum('shape').notNull().default('square'),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
}, table => [
  index('restaurant_tables_section_idx').on(table.sectionId)
])

export const floorDecor = pgTable('floor_decor', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull().references(() => floorSections.id, { onDelete: 'cascade' }),
  kind: decorKindEnum('kind').notNull(),
  label: text('label'),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull()
})

// date/time are stored as local Abu Dhabi wall-clock, not UTC: a 20:00 booking is
// 20:00 in the dining room regardless of where the server runs.
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  reference: varchar('reference', { length: 12 }).notNull().unique(),
  guestId: integer('guest_id').references(() => guests.id, { onDelete: 'set null' }),
  tableId: integer('table_id').references(() => restaurantTables.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  time: time('time').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(90),
  partySize: integer('party_size').notNull(),
  // How many of the party have actually sat down (ServMe's "2 / 4").
  seatedGuests: integer('seated_guests'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  source: reservationSourceEnum('source').notNull().default('online'),
  status: reservationStatusEnum('status').notNull().default('pending'),
  notifyGuest: boolean('notify_guest').notNull().default(true),
  createdBy: integer('created_by').references(() => staff.id, { onDelete: 'set null' }),
  updatedBy: integer('updated_by').references(() => staff.id, { onDelete: 'set null' }),
  arrivedAt: timestamp('arrived_at', { withTimezone: true }),
  seatedAt: timestamp('seated_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  index('reservations_date_idx').on(table.date),
  index('reservations_status_idx').on(table.status),
  index('reservations_guest_idx').on(table.guestId)
])

// Audit trail shown in the reservation's "Activity logs" tab.
export const reservationActivity = pgTable('reservation_activity', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id').notNull().references(() => reservations.id, { onDelete: 'cascade' }),
  staffId: integer('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  changes: jsonb('changes').$type<{ field: string, from: unknown, to: unknown }[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  index('reservation_activity_reservation_idx').on(table.reservationId)
])

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: staffRoleEnum('role').notNull().default('host'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
})

// Single row (id = 1) holding the booking engine's global rules.
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  slotIntervalMinutes: integer('slot_interval_minutes').notNull().default(15),
  maxPartySize: integer('max_party_size').notNull().default(10),
  maxCoversPerSlot: integer('max_covers_per_slot').notNull().default(40),
  minLeadMinutes: integer('min_lead_minutes').notNull().default(30),
  maxAdvanceDays: integer('max_advance_days').notNull().default(180),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

// One row per day of week, 0 = Sunday. closesAt may be '24:00:00' for late nights.
export const servicePeriods = pgTable('service_periods', {
  id: serial('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),
  opensAt: time('opens_at').notNull(),
  closesAt: time('closes_at').notNull()
})

export const blackoutDates = pgTable('blackout_dates', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  reason: text('reason')
})

export type Reservation = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
export type Guest = typeof guests.$inferSelect
export type RestaurantTable = typeof restaurantTables.$inferSelect
export type Staff = typeof staff.$inferSelect
export type Settings = typeof settings.$inferSelect
