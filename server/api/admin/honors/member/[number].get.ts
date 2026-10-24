import { eq, sql } from 'drizzle-orm'
import { guests, honorsMembers } from '../../../../database/schema'
import { requirePermission } from '../../../../utils/auth'
import { useDb } from '../../../../utils/db'
import { memberName, publicHonors } from '../../../../utils/honors'

// A card by its member ID, for the page staff reach by scanning the QR code
// on a guest's wallet card.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'reservations', 'guests')
  const number = String(getRouterParam(event, 'number') ?? '').trim()

  const [row] = await useDb()
    .select({ member: honorsMembers, guest: guests })
    .from(honorsMembers)
    .innerJoin(guests, eq(guests.id, honorsMembers.guestId))
    .where(sql`upper(${honorsMembers.memberNumber}) = upper(${number})`)
    .limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'No Yana Honors card with this member ID' })

  return {
    ...publicHonors(row.member),
    guestId: row.guest.id,
    name: [row.guest.salutation, memberName(row.guest)].filter(Boolean).join(' '),
    vip: row.guest.vip,
    notes: row.guest.notes
  }
})
