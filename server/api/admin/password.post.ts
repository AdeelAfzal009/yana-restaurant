import { eq } from 'drizzle-orm'
import { staff } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { hashPassword, verifyPassword } from '../../utils/password'

const MIN_LENGTH = 12

export default defineEventHandler(async (event) => {
  const current = await requireAuth(event)
  const body = await readBody<{ currentPassword?: string, newPassword?: string }>(event)

  if (!body?.currentPassword || !body?.newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Current and new password are required' })
  }

  if (body.newPassword.length < MIN_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `New password must be at least ${MIN_LENGTH} characters` })
  }

  // Re-check the current password even though the session is valid, so a
  // borrowed laptop can't be used to lock the real owner out of their account.
  if (!(await verifyPassword(body.currentPassword, current.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect' })
  }

  const db = useDb()
  await db
    .update(staff)
    .set({ passwordHash: await hashPassword(body.newPassword) })
    .where(eq(staff.id, current.id))

  return { ok: true }
})
