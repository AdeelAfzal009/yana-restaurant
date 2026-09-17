import { eq } from 'drizzle-orm'
import { reservations, reservationStatusEnum } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'

type ReservationStatus = (typeof reservationStatusEnum.enumValues)[number]

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid reservation id' })
  }

  const { status } = await readBody<{ status?: string }>(event)
  if (!status || !reservationStatusEnum.enumValues.includes(status as ReservationStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const db = useDb()
  const [updated] = await db
    .update(reservations)
    .set({ status: status as ReservationStatus, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning({ id: reservations.id })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Reservation not found' })
  }

  return { ok: true }
})
