import { isHonorsTier } from '#shared/utils/honors'
import { eq } from 'drizzle-orm'
import { guests, honorsMembers } from '../../../database/schema'
import { audit } from '../../../utils/audit'
import { requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { honorsForGuest, memberName, parseDiscount } from '../../../utils/honors'
import { badRequest } from '../../../utils/validate'

// Issues a Yana Honors card: { guestId, tier, discountPercent }. The guest then
// gets it onto their phone through a link (QR at reception, or by email).
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'guests')
  const body = await readBody<{ guestId?: unknown, tier?: unknown, discountPercent?: unknown }>(event)

  const guestId = Number(body?.guestId)
  if (!Number.isInteger(guestId)) badRequest('Invalid guest id')
  if (!isHonorsTier(body.tier)) badRequest('Choose Silver or Platinum')
  const discountPercent = parseDiscount(body.discountPercent)
  if (discountPercent === null) badRequest('Discount must be a whole number from 0 to 100')

  const db = useDb()
  const [guest] = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1)
  if (!guest) throw createError({ statusCode: 404, statusMessage: 'Guest not found' })

  const [created] = await db.insert(honorsMembers)
    .values({ guestId, tier: body.tier, discountPercent, issuedBy: current.id })
    .onConflictDoNothing({ target: honorsMembers.guestId })
    .returning()
  if (!created) badRequest('This guest already has a Yana Honors card')

  await audit(event, current, 'honors.issued', {
    target: memberName(guest),
    details: { guestId, memberNumber: created.memberNumber, tier: created.tier, discountPercent }
  })
  return honorsForGuest(guestId)
})
