import { accessLabels, cleanPermissions, DEFAULT_HOST_ACCESS } from '#shared/utils/permissions'
import { staff } from '../../../database/schema'
import { audit } from '../../../utils/audit'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { hashPassword } from '../../../utils/password'
import { assertEmailFree, checkPassword, cleanEmail, cleanName, cleanRole, staffPublicColumns } from '../../../utils/staff-input'

// Creates a dashboard user. With mustChangePassword the password is a temporary
// one: the user has to replace it before they can use the dashboard.
export default defineEventHandler(async (event) => {
  const current = await requireManager(event)
  const body = await readBody<Record<string, unknown>>(event)

  const name = cleanName(body?.name)
  const email = cleanEmail(body?.email)
  const role = cleanRole(body?.role)
  const password = checkPassword(body?.password)
  // Which areas a non-manager can open; managers can open everything anyway.
  const permissions = body?.permissions === undefined ? DEFAULT_HOST_ACCESS : cleanPermissions(body.permissions)
  await assertEmailFree(email)

  const [user] = await useDb()
    .insert(staff)
    .values({
      name,
      email,
      role,
      permissions,
      passwordHash: await hashPassword(password),
      mustChangePassword: body?.mustChangePassword !== false
    })
    .returning(staffPublicColumns)

  await audit(event, current, 'users.created', {
    target: `${name} (${email})`,
    details: { role, access: role === 'manager' ? ['Everything'] : accessLabels(permissions) }
  })
  return { user }
})
