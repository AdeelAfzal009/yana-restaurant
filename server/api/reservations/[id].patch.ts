import { eq } from 'drizzle-orm'
import { guests, reservations, restaurantTables } from '../../database/schema'
import { diffReservation, logActivity } from '../../utils/activity'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { parseReservationFields, stampStatusTimes, type ReservationBody } from '../../utils/reservation-input'
import { formatReservation, reservationColumns } from '../../utils/reservation-query'
import { badRequest } from '../../utils/validate'

export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid reservation id')

  const fields = parseReservationFields(await readBody<ReservationBody>(event))
  if (Object.keys(fields).length === 0) badRequest('Nothing to update')

  const db = useDb()
  const [before] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1)
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Reservation not found' })

  // Seating a party defaults the seated count to the full party.
  const seatedDefault = fields.status === 'seated' && fields.seatedGuests === undefined && before.seatedGuests == null
    ? { seatedGuests: fields.partySize ?? before.partySize }
    : {}

  const [after] = await db
    .update(reservations)
    .set({ ...fields, ...seatedDefault, ...stampStatusTimes(fields.status === before.status ? undefined : fields.status), updatedBy: me.id, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning()

  const changes = diffReservation(before as Record<string, unknown>, after as Record<string, unknown>)
  if (changes.some(c => c.field === 'Table')) {
    const ids = [before.tableId, after!.tableId].filter((v): v is number => v != null)
    const names = ids.length ? await db.select({ id: restaurantTables.id, name: restaurantTables.name }).from(restaurantTables) : []
    const nameOf = (v: unknown) => names.find(n => n.id === v)?.name ?? null
    for (const c of changes) if (c.field === 'Table') Object.assign(c, { from: nameOf(c.from), to: nameOf(c.to) })
  }
  if (changes.length) {
    const statusOnly = changes.length === 1 && changes[0]!.field === 'Status'
    await logActivity(db, id, me.id, statusOnly ? 'status' : 'updated', changes)
  }

  const [row] = await db
    .select(reservationColumns)
    .from(reservations)
    .leftJoin(restaurantTables, eq(reservations.tableId, restaurantTables.id))
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .where(eq(reservations.id, id))

  return formatReservation(row!)
})
