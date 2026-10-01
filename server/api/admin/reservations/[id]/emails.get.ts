import { desc, eq } from 'drizzle-orm'
import { emailLog } from '../../../../database/schema'
import { requireAuth } from '../../../../utils/auth'
import { useDb } from '../../../../utils/db'
import { badRequest } from '../../../../utils/validate'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid reservation id')

  return useDb()
    .select({
      id: emailLog.id,
      template: emailLog.template,
      recipient: emailLog.recipient,
      subject: emailLog.subject,
      status: emailLog.status,
      error: emailLog.error,
      createdAt: emailLog.createdAt
    })
    .from(emailLog)
    .where(eq(emailLog.reservationId, id))
    .orderBy(desc(emailLog.createdAt), desc(emailLog.id))
})
