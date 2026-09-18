import { desc, eq } from 'drizzle-orm'
import { reservationActivity, staff } from '../../../../database/schema'
import { requireAuth } from '../../../../utils/auth'
import { useDb } from '../../../../utils/db'
import { badRequest } from '../../../../utils/validate'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid reservation id')

  return useDb()
    .select({
      id: reservationActivity.id,
      action: reservationActivity.action,
      changes: reservationActivity.changes,
      createdAt: reservationActivity.createdAt,
      staffName: staff.name
    })
    .from(reservationActivity)
    .leftJoin(staff, eq(reservationActivity.staffId, staff.id))
    .where(eq(reservationActivity.reservationId, id))
    .orderBy(desc(reservationActivity.createdAt), desc(reservationActivity.id))
})
