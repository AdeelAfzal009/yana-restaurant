import { and, eq, ne } from 'drizzle-orm'
import { staff } from '../../../database/schema'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { badRequest } from '../../../utils/validate'

// Permanently removes a user. Bookings, activity logs and saved settings they
// touched are kept; their "created/changed by" link is cleared by the database.
export default defineEventHandler(async (event) => {
  const current = await requireManager(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid user id')
  if (id === current.id) badRequest('You can\'t delete your own account')

  const db = useDb()
  const [existing] = await db.select().from(staff).where(eq(staff.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  if (existing.role === 'manager' && existing.active) {
    const [other] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(and(eq(staff.role, 'manager'), eq(staff.active, true), ne(staff.id, id)))
      .limit(1)
    if (!other) badRequest('Keep at least one active manager')
  }

  await db.delete(staff).where(eq(staff.id, id))
  return { ok: true }
})
