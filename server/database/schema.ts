import { pgTable, pgEnum, serial, integer, text, boolean, date, time, timestamp, varchar, index } from 'drizzle-orm/pg-core'

export const reservationStatusEnum = pgEnum('reservation_status', ['pending', 'confirmed', 'cancelled'])
export const staffRoleEnum = pgEnum('staff_role', ['manager', 'host'])

// date/time are stored as local Abu Dhabi wall-clock, not UTC: a 20:00 booking is
// 20:00 in the dining room regardless of where the server runs.
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  reference: varchar('reference', { length: 12 }).notNull().unique(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  partySize: integer('party_size').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  notes: text('notes'),
  status: reservationStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
  index('reservations_date_idx').on(table.date),
  index('reservations_status_idx').on(table.status)
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
export type Staff = typeof staff.$inferSelect
export type Settings = typeof settings.$inferSelect
