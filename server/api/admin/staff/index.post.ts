import { staff } from '../../../database/schema'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { hashPassword } from '../../../utils/password'
import { assertEmailFree, checkPassword, cleanEmail, cleanName, cleanRole, staffPublicColumns } from '../../../utils/staff-input'

// Creates a dashboard user. With mustChangePassword the password is a temporary
// one: the user has to replace it before they can use the dashboard.
export default defineEventHandler(async (event) => {
  await requireManager(event)
  const body = await readBody<Record<string, unknown>>(event)

  const name = cleanName(body?.name)
  const email = cleanEmail(body?.email)
  const role = cleanRole(body?.role)
  const password = checkPassword(body?.password)
  await assertEmailFree(email)

  const [user] = await useDb()
    .insert(staff)
    .values({
      name,
      email,
      role,
      passwordHash: await hashPassword(password),
      mustChangePassword: body?.mustChangePassword !== false
    })
    .returning(staffPublicColumns)

  return { user }
})
