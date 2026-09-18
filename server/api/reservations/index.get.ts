import { and, asc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import { guests, reservations, restaurantTables } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { formatReservation, reservationColumns } from '../../utils/reservation-query'
import { badRequest, DATE_RE } from '../../utils/validate'

// ?date=YYYY-MM-DD for one day, ?from&to for a range, or ?q= to search every date.
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const from = String(query.date ?? query.from ?? '')
  const to = String(query.date ?? query.to ?? '')

  const conditions = []
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`
    conditions.push(or(
      ilike(reservations.firstName, like),
      ilike(reservations.lastName, like),
      ilike(sql`${reservations.firstName} || ' ' || ${reservations.lastName}`, like),
      ilike(reservations.email, like),
      ilike(reservations.phone, like),
      ilike(reservations.reference, like)
    ))
  } else {
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) badRequest('A date or date range is required')
    conditions.push(gte(reservations.date, from), lte(reservations.date, to))
  }

  const db = useDb()
  const rows = await db
    .select(reservationColumns)
    .from(reservations)
    .leftJoin(restaurantTables, eq(reservations.tableId, restaurantTables.id))
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .where(and(...conditions))
    .orderBy(q ? sql`${reservations.date} desc` : asc(reservations.date), asc(reservations.time), asc(reservations.id))
    .limit(q ? 100 : 2000)

  return rows.map(formatReservation)
})
