import { desc, ilike, or, sql } from 'drizzle-orm'
import { guests } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`

  const db = useDb()
  const stats = sql`(
    select
      count(*) filter (where r.status in ('seated', 'finished'))::int as visits,
      coalesce(sum(r.party_size) filter (where r.status in ('seated', 'finished')), 0)::int as covers,
      count(*) filter (where r.status = 'no_show')::int as no_shows,
      count(*) filter (where r.status = 'cancelled')::int as cancellations,
      count(*)::int as bookings,
      max(r.date) filter (where r.status in ('seated', 'finished'))::text as last_visit,
      min(r.date) filter (where r.date >= current_date and r.status in ('pending', 'confirmed'))::text as next_booking
    from reservations r where r.guest_id = ${guests.id}
  )`

  const rows = await db
    .select({
      id: guests.id,
      firstName: guests.firstName,
      lastName: guests.lastName,
      email: guests.email,
      phone: guests.phone,
      tags: guests.tags,
      vip: guests.vip,
      notes: guests.notes,
      createdAt: guests.createdAt,
      stats: sql<{
        visits: number
        covers: number
        no_shows: number
        cancellations: number
        bookings: number
        last_visit: string | null
        next_booking: string | null
      }>`(select row_to_json(s) from ${stats} s)`
    })
    .from(guests)
    .where(q
      ? or(
          ilike(sql`${guests.firstName} || ' ' || ${guests.lastName}`, like),
          ilike(guests.email, like),
          ilike(guests.phone, like),
          sql`exists (select 1 from unnest(${guests.tags}) t where t ilike ${like})`
        )
      : undefined)
    .orderBy(desc(guests.vip), desc(guests.updatedAt))
    .limit(500)

  return rows
})
