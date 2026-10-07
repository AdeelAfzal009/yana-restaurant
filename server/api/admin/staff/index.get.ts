import { asc, desc } from 'drizzle-orm'
import { staff } from '../../../database/schema'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { staffPublicColumns } from '../../../utils/staff-input'

export default defineEventHandler(async (event) => {
  const current = await requireManager(event)
  const users = await useDb()
    .select(staffPublicColumns)
    .from(staff)
    .orderBy(desc(staff.active), asc(staff.name))
  return { users, currentUserId: current.id }
})
