import { desc, eq } from 'drizzle-orm'
import { floorSections, guests, reservations, restaurantTables } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { badRequest } from '../../../utils/validate'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid guest id')

  const db = useDb()
  const [guest] = await db.select().from(guests).where(eq(guests.id, id)).limit(1)
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Guest not found' })

  const history = await db
    .select({
      id: reservations.id,
      reference: reservations.reference,
      date: reservations.date,
      time: reservations.time,
      partySize: reservations.partySize,
      seatedGuests: reservations.seatedGuests,
      durationMinutes: reservations.durationMinutes,
      seatedAt: reservations.seatedAt,
      finishedAt: reservations.finishedAt,
      internalNotes: reservations.internalNotes,
      sectionName: floorSections.name,
      status: reservations.status,
      source: reservations.source,
      tags: reservations.tags,
      notes: reservations.notes,
      tableName: restaurantTables.name
    })
    .from(reservations)
    .leftJoin(restaurantTables, eq(reservations.tableId, restaurantTables.id))
    .leftJoin(floorSections, eq(restaurantTables.sectionId, floorSections.id))
    .where(eq(reservations.guestId, id))
    .orderBy(desc(reservations.date), desc(reservations.time))

  return { ...guest, history: history.map(h => ({ ...h, time: h.time.slice(0, 5) })) }
})
