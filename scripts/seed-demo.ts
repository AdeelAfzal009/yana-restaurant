// Fills a LOCAL database with realistic demo guests and bookings so the
// dashboard, floor plan, timeline and reports have something to show.
//
//   npm run db:seed-demo            add demo data (replaces any previous demo data)
//   npm run db:seed-demo -- --clean remove demo data only
//
// Every demo guest uses an @demo.yana.test email, which is how --clean finds
// them; real bookings are never touched. Refuses to run against a non-local
// database unless --allow-remote is passed.
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq, inArray, like } from 'drizzle-orm'
import { Pool } from 'pg'
import { guests, reservationActivity, reservations, restaurantTables, staff } from '../server/database/schema'
import { resolvePgSsl } from '../server/utils/pg-ssl'

const DEMO_DOMAIN = '@demo.yana.test'
const PAST_DAYS = 45
const FUTURE_DAYS = 21

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const host = new URL(databaseUrl).hostname
if (!['localhost', '127.0.0.1', 'db'].includes(host) && !process.argv.includes('--allow-remote')) {
  throw new Error(`Refusing to seed demo data into ${host}. This is meant for a local database.`)
}

const pool = new Pool({ connectionString: databaseUrl, ssl: resolvePgSsl(databaseUrl) })
const db = drizzle(pool)

// Deterministic randomness so repeated runs produce the same restaurant.
let seed = 20260918
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)]!
const chance = (p: number) => rand() < p
function weighted<T>(options: [T, number][]) {
  const total = options.reduce((n, [, w]) => n + w, 0)
  let r = rand() * total
  for (const [value, w] of options) {
    r -= w
    if (r <= 0) return value
  }
  return options[0]![0]
}

const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const usedRefs = new Set<string>()
function reference() {
  let ref = ''
  do {
    ref = Array.from({ length: 6 }, () => pick(REF_ALPHABET.split(''))).join('')
  } while (usedRefs.has(ref))
  usedRefs.add(ref)
  return ref
}

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hhmm = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const at = (date: string, minutes: number) => new Date(`${date}T${hhmm(minutes)}:00`)

async function clean() {
  const demoGuests = await db.select({ id: guests.id }).from(guests).where(like(guests.email, `%${DEMO_DOMAIN}`))
  const ids = demoGuests.map(g => g.id)
  if (ids.length) {
    await db.delete(reservations).where(inArray(reservations.guestId, ids))
    await db.delete(guests).where(inArray(guests.id, ids))
  }
  console.log(`Removed ${ids.length} demo guests and their bookings.`)
}

const FIRST = ['Omar', 'Layla', 'Ahmed', 'Fatima', 'Khalid', 'Noura', 'Rashid', 'Mariam', 'Saeed', 'Aisha', 'James', 'Sophie', 'Daniel', 'Olivia', 'Lucas', 'Emma', 'Marco', 'Giulia', 'Pierre', 'Camille', 'Arjun', 'Priya', 'Rohan', 'Ananya', 'Hassan', 'Yasmin', 'Dmitri', 'Anastasia', 'Carlos', 'Valentina', 'Wei', 'Mei', 'Jimmy', 'Sara', 'Tariq', 'Hana', 'Michael', 'Chloe', 'Ali', 'Zara']
const LAST = ['Al Mansouri', 'Haddad', 'Al Nahyan', 'Khalil', 'Al Suwaidi', 'Rahman', 'Smith', 'Laurent', 'Rossi', 'Patel', 'Sharma', 'Ivanova', 'Garcia', 'Chen', 'Tavarez', 'Lopez', 'Al Qubaisi', 'Nasser', 'Williams', 'Dubois', 'Kapoor', 'Petrov', 'Moreno', 'Wong', 'Al Hashimi', 'Farouk', 'Brown', 'Martin']
const GUEST_TAGS = ['Regular', 'Influencer', 'Press', 'Owner friend', 'Allergy', 'Vegetarian', 'Vegan', 'Pescatarian']
const GUEST_NOTES = ['Prefers the terrace in winter', 'Shellfish allergy — tell the kitchen', 'Likes table P2 by the window', 'Always orders the tasting menu', 'Celebrates with champagne, keep a bottle chilled', 'Gluten free', 'Friend of the GM', 'Brings a small dog on the terrace']
const RES_TAGS = ['Birthday', 'Anniversary', 'Allergy', 'Business', 'Date night', 'High chair', 'Window seat', 'Terrace request', 'Proposal']
const RES_NOTES = ['Birthday cake at 9pm please', '25th anniversary', 'Nut allergy', 'Needs a high chair', 'Quiet table if possible', 'Business dinner, fast service', 'Surprise proposal — ring with dessert', 'Celebrating a promotion', 'Running 15 minutes late', 'Window table please']
const INTERNAL = ['Deposit taken AED 500', 'Called to confirm', 'VIP — manager to greet', 'Regular, knows the sommelier', 'Complained last visit, comp dessert']

async function main() {
  await clean()
  if (process.argv.includes('--clean')) return

  const [me] = await db.select({ id: staff.id }).from(staff).where(eq(staff.active, true)).limit(1)
  const staffId = me?.id ?? null
  const tables = await db.select().from(restaurantTables)
  if (!tables.length) throw new Error('No tables found — run the app once so migrations seed the floor plan.')

  // ---- Guests ----
  const guestRows = Array.from({ length: 70 }, (_, i) => {
    const firstName = FIRST[i % FIRST.length]!
    const lastName = pick(LAST)
    const vip = chance(0.12)
    return {
      salutation: pick(['Mr', 'Mrs', 'Ms', 'Dr', null, null]),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}.${i}${DEMO_DOMAIN}`,
      phone: `+9715${pick(['0', '2', '5', '6'])}${String(1000000 + Math.floor(rand() * 8999999))}`,
      vip,
      tags: [...new Set([...(vip ? ['VIP'] : []), ...(chance(0.35) ? [pick(GUEST_TAGS)] : [])])],
      notes: chance(0.25) ? pick(GUEST_NOTES) : null,
      marketingOptIn: chance(0.5),
      birthDay: chance(0.4) ? 1 + Math.floor(rand() * 28) : null,
      birthMonth: chance(0.4) ? 1 + Math.floor(rand() * 12) : null,
      preferredLanguage: pick(['English', 'Arabic', 'English', 'French', 'Russian', null]),
      gender: pick(['Female', 'Male', null]),
      city: pick(['Abu Dhabi', 'Abu Dhabi', 'Dubai', 'Al Ain', null]),
      country: 'United Arab Emirates'
    }
  })
  const insertedGuests = await db.insert(guests).values(guestRows).returning()

  // A third of guests are regulars and book far more often.
  const regulars = insertedGuests.slice(0, 22)
  const pickGuest = () => (chance(0.55) ? pick(regulars) : pick(insertedGuests))

  // ---- Bookings ----
  const now = new Date()
  const today = iso(now)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const rows: (typeof reservations.$inferInsert)[] = []

  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + offset)
    const date = iso(day)
    const dow = day.getDay()
    const weekend = dow === 5 || dow === 6 // Fri & Sat are busy in the UAE
    // Further-out future dates have fewer bookings so far.
    const fill = offset > 0 ? Math.max(0.25, 1 - offset / 28) : 1

    const plan: [number, number, number][] = [
      // [count, window start, window end] in minutes
      [Math.round((weekend ? 3 : 1) * fill), 9 * 60, 11 * 60 + 30],
      [Math.round((weekend ? 9 : 6) * fill * (0.8 + rand() * 0.4)), 12 * 60, 15 * 60 + 30],
      [Math.round((weekend ? 22 : 13) * fill * (0.8 + rand() * 0.4)), 18 * 60, 22 * 60 + 30]
    ]

    // Per-table busy intervals, so assignments never overlap.
    const busy = new Map<number, [number, number][]>()

    for (const [count, from, to] of plan) {
      for (let n = 0; n < count; n++) {
        const start = from + Math.floor(rand() * ((to - from) / 15 + 1)) * 15
        const partySize = weighted<number>([[2, 42], [3, 12], [4, 24], [5, 7], [6, 7], [8, 4], [10, 2], [1, 2]])
        const duration = partySize >= 7 ? 150 : partySize >= 5 ? 120 : 90
        const guest = pickGuest()
        const isPast = date < today || (date === today && start + duration <= nowMin)
        const isNow = date === today && start <= nowMin && start + duration > nowMin

        const source = weighted<'online' | 'phone' | 'walk_in' | 'staff'>(
          offset > 0 ? [['online', 60], ['phone', 35], ['staff', 5]] : [['online', 48], ['phone', 30], ['walk_in', 17], ['staff', 5]]
        )

        let status: typeof reservations.$inferInsert.status
        if (isPast) status = weighted([['finished', 82], ['cancelled', 10], ['no_show', 5], ['seated', 0], ['finished', 3]])
        else if (isNow) status = weighted([['seated', 70], ['arrived', 15], ['confirmed', 15]])
        else status = weighted([['confirmed', 66], ['pending', 26], ['waitlist', 4], ['cancelled', 4]])
        if (source === 'walk_in' && (status === 'cancelled' || status === 'no_show')) status = 'finished'

        // Assign a free table that fits; future bookings are only partly assigned.
        let tableId: number | null = null
        const wantsTable = status !== 'cancelled' && status !== 'no_show' && status !== 'waitlist' && (isPast || isNow || chance(0.7))
        if (wantsTable) {
          const fits = tables
            .filter(t => partySize <= t.maxCovers && partySize >= Math.min(t.minCovers, partySize))
            .sort((a, b) => a.maxCovers - b.maxCovers + (rand() - 0.5) * 3)
          const free = fits.find(t => !(busy.get(t.id) ?? []).some(([s, e]) => start < e && s < start + duration))
          if (free) {
            tableId = free.id
            busy.set(free.id, [...(busy.get(free.id) ?? []), [start, start + duration]])
          }
        }

        const seated = status === 'seated' || status === 'finished' || status === 'arrived'
        const lateBy = Math.floor(rand() * 20) - 5
        const seatedAt = status === 'seated' || status === 'finished' ? at(date, start + Math.max(0, lateBy)) : null
        const stayed = duration - 20 + Math.floor(rand() * 45)
        const finishedAt = status === 'finished' && seatedAt ? new Date(seatedAt.getTime() + stayed * 60000) : null
        const bookedDaysAhead = source === 'walk_in' ? 0 : 1 + Math.floor(rand() * 14)
        const createdAt = source === 'walk_in' ? at(date, start) : new Date(at(date, start).getTime() - bookedDaysAhead * 86400000)
        const withTag = chance(0.22)

        rows.push({
          reference: reference(),
          guestId: guest.id,
          tableId,
          date,
          time: `${hhmm(start)}:00`,
          durationMinutes: duration,
          partySize,
          seatedGuests: seated ? (chance(0.12) ? Math.max(1, partySize - 1) : partySize) : null,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: source === 'walk_in' ? null : guest.email,
          phone: guest.phone,
          notes: chance(0.2) ? pick(RES_NOTES) : null,
          internalNotes: chance(0.08) ? pick(INTERNAL) : null,
          tags: withTag ? [pick(RES_TAGS)] : [],
          source,
          status,
          createdBy: source === 'online' ? null : staffId,
          updatedBy: source === 'online' && !seated ? null : staffId,
          arrivedAt: seated ? at(date, start + Math.max(0, lateBy) - 2) : null,
          seatedAt,
          finishedAt,
          createdAt,
          updatedAt: finishedAt ?? seatedAt ?? createdAt
        })
      }
    }
  }

  const created: { id: number, status: string, createdAt: Date, seatedAt: Date | null, finishedAt: Date | null, createdBy: number | null }[] = []
  for (let i = 0; i < rows.length; i += 200) {
    created.push(...await db.insert(reservations).values(rows.slice(i, i + 200)).returning({
      id: reservations.id,
      status: reservations.status,
      createdAt: reservations.createdAt,
      seatedAt: reservations.seatedAt,
      finishedAt: reservations.finishedAt,
      createdBy: reservations.createdBy
    }))
  }

  // Activity log: created, then seated / left / cancelled as it happened.
  const activity: (typeof reservationActivity.$inferInsert)[] = []
  for (const r of created) {
    activity.push({ reservationId: r.id, staffId: r.createdBy, action: 'created', createdAt: r.createdAt })
    if (r.seatedAt) activity.push({ reservationId: r.id, staffId, action: 'status', changes: [{ field: 'Status', from: 'confirmed', to: 'seated' }], createdAt: r.seatedAt })
    if (r.finishedAt) activity.push({ reservationId: r.id, staffId, action: 'status', changes: [{ field: 'Status', from: 'seated', to: 'finished' }], createdAt: r.finishedAt })
    if (r.status === 'cancelled' || r.status === 'no_show') {
      activity.push({ reservationId: r.id, staffId, action: 'status', changes: [{ field: 'Status', from: 'confirmed', to: r.status }], createdAt: r.createdAt })
    }
  }
  for (let i = 0; i < activity.length; i += 500) {
    await db.insert(reservationActivity).values(activity.slice(i, i + 500))
  }

  const past = rows.filter(r => r.date! < today).length
  const future = rows.filter(r => r.date! > today).length
  console.log(`Created ${insertedGuests.length} guests and ${rows.length} bookings (${past} past, ${rows.length - past - future} today, ${future} upcoming).`)
}

try {
  await main()
} finally {
  await pool.end()
}
