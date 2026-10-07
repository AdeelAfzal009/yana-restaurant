import { and, eq, ne } from 'drizzle-orm'
import { staff } from '../../../database/schema'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { hashPassword } from '../../../utils/password'
import { assertEmailFree, checkPassword, cleanEmail, cleanName, cleanRole, staffPublicColumns } from '../../../utils/staff-input'
import { badRequest } from '../../../utils/validate'

// Edits a user: details, role, active/deactivated, or a new password.
// Deactivating signs the user out immediately (sessions re-check `active`).
export default defineEventHandler(async (event) => {
  const current = await requireManager(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid user id')

  const body = await readBody<Record<string, unknown>>(event)
  const db = useDb()
  const [existing] = await db.select().from(staff).where(eq(staff.id, id)).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const updates: Partial<typeof staff.$inferInsert> = {}
  if (body?.name !== undefined) updates.name = cleanName(body.name)
  if (body?.email !== undefined) {
    updates.email = cleanEmail(body.email)
    await assertEmailFree(updates.email, id)
  }
  if (body?.role !== undefined) updates.role = cleanRole(body.role)
  if (body?.active !== undefined) updates.active = body.active === true
  if (body?.password !== undefined && body.password !== '') {
    updates.passwordHash = await hashPassword(checkPassword(body.password))
    updates.mustChangePassword = body?.mustChangePassword !== false
  } else if (body?.mustChangePassword !== undefined) {
    updates.mustChangePassword = body.mustChangePassword === true
  }

  // Managers can't lock themselves out by mistake.
  if (id === current.id) {
    if (updates.active === false) badRequest('You can\'t deactivate your own account')
    if (updates.role && updates.role !== 'manager') badRequest('You can\'t remove your own manager access')
  }

  // There must always be at least one active manager.
  const losesManager = existing.role === 'manager' && existing.active
    && (updates.role === 'host' || updates.active === false)
  if (losesManager) {
    const [other] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(and(eq(staff.role, 'manager'), eq(staff.active, true), ne(staff.id, id)))
      .limit(1)
    if (!other) badRequest('Keep at least one active manager')
  }

  if (!Object.keys(updates).length) badRequest('Nothing to update')

  const [user] = await db.update(staff).set(updates).where(eq(staff.id, id)).returning(staffPublicColumns)
  return { user }
})
