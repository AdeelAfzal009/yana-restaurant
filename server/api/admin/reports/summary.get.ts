import { and, gte, lte, sql } from 'drizzle-orm'
import { reservations } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { badRequest, DATE_RE } from '../../../utils/validate'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const from = String(query.from ?? '')
  const to = String(query.to ?? '')
  const shift = String(query.shift ?? 'all')
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) badRequest('A valid date range is required')
  if (from > to) badRequest('Start date must be before end date')

  const shiftDef = SHIFTS.find(s => s.key === shift) ?? SHIFTS[0]
  const where = and(
    gte(reservations.date, from),
    lte(reservations.date, to),
    gte(reservations.time, `${shiftDef.start}:00`),
    // Midnight end is stored as 24:00 — every time is below it.
    shiftDef.end === '24:00' ? undefined : sql`${reservations.time} < ${`${shiftDef.end}:00`}`
  )

  const db = useDb()
  const rows = await db
    .select({
      date: sql<string>`${reservations.date}::text`,
      hour: sql<number>`extract(hour from ${reservations.time})::int`,
      status: reservations.status,
      source: reservations.source,
      reservations: sql<number>`count(*)::int`,
      covers: sql<number>`sum(${reservations.partySize})::int`
    })
    .from(reservations)
    .where(where)
    .groupBy(reservations.date, sql`extract(hour from ${reservations.time})`, reservations.status, reservations.source)

  return { from, to, shift: shiftDef.key, rows }
})
