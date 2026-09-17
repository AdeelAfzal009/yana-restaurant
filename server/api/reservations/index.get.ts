import { desc } from 'drizzle-orm'
import { reservations } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const db = useDb()
  const rows = await db
    .select()
    .from(reservations)
    .orderBy(desc(reservations.date), desc(reservations.time), desc(reservations.id))

  return rows.map(row => ({
    ...row,
    time: row.time.slice(0, 5)
  }))
})
