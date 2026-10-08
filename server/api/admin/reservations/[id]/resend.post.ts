import { eq } from 'drizzle-orm'
import { reservations, restaurantTables } from '../../../../database/schema'
import { requirePermission } from '../../../../utils/auth'
import { useDb } from '../../../../utils/db'
import { sendReservationEmail, templateForStatus } from '../../../../utils/notify'
import { badRequest } from '../../../../utils/validate'
import type { EmailTemplate } from '../../../../utils/email-templates'

const ALLOWED: EmailTemplate[] = ['booking_received', 'booking_confirmed', 'booking_cancelled', 'waitlist_added']

// Staff-triggered resend. Unlike the automatic sends this ignores both the
// per-booking notification switch and the already-sent check, because a host
// only presses it when the guest says the email never arrived.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'reservations')

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid reservation id')

  const body = await readBody<{ template?: string }>(event)

  const db = useDb()
  const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1)
  if (!reservation) throw createError({ statusCode: 404, statusMessage: 'Reservation not found' })

  const template = (body?.template as EmailTemplate | undefined) ?? templateForStatus(reservation.status)
  if (!template || !ALLOWED.includes(template)) {
    badRequest('There is no guest email for this status')
  }
  if (!reservation.email) badRequest('This booking has no email address')

  const [joined] = await db
    .select({ tableName: restaurantTables.name })
    .from(reservations)
    .leftJoin(restaurantTables, eq(reservations.tableId, restaurantTables.id))
    .where(eq(reservations.id, id))

  const result = await sendReservationEmail(reservation, template, { force: true, tableName: joined?.tableName })
  return { ok: result.status !== 'failed', ...result, template }
})
