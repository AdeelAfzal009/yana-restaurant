import { isHonorsTier } from '#shared/utils/honors'
import { eq } from 'drizzle-orm'
import { honorsMembers } from '../../../database/schema'
import { audit } from '../../../utils/audit'
import { requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { syncGoogleCard } from '../../../utils/google-wallet'
import { honorsForGuest, loadHonorsMember, memberName } from '../../../utils/honors'
import { siteOrigin } from '../../../utils/request'
import { badRequest } from '../../../utils/validate'

// Changes a card: { tier?, status? }. Revoking also stops
// any link still out there and marks the card inactive in Google Wallet.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'guests')

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid card id')
  const row = await loadHonorsMember(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Card not found' })

  const body = await readBody<{ tier?: unknown, status?: unknown }>(event)
  const set: Partial<typeof honorsMembers.$inferInsert> = {}

  if (body.tier !== undefined) {
    if (!isHonorsTier(body.tier)) badRequest('Choose Silver or Platinum')
    set.tier = body.tier
  }
  if (body.status !== undefined) {
    if (body.status !== 'active' && body.status !== 'revoked') badRequest('Invalid status')
    set.status = body.status
    if (body.status === 'revoked') Object.assign(set, { token: null, tokenExpiresAt: null, tokenUsedAt: null })
  }

  const [updated] = await useDb().update(honorsMembers).set({ ...set, updatedAt: new Date() }).where(eq(honorsMembers.id, id)).returning()

  const walletChanged = updated!.tier !== row.member.tier || updated!.status !== row.member.status
  const warning = walletChanged ? await syncGoogleCard(updated!, row.guest, siteOrigin(event)) : null

  const statusChange = updated!.status !== row.member.status
  await audit(event, current, statusChange ? (updated!.status === 'revoked' ? 'honors.revoked' : 'honors.reactivated') : 'honors.updated', {
    target: memberName(row.guest),
    details: { guestId: row.guest.id, memberNumber: updated!.memberNumber, fields: Object.keys(set), tier: updated!.tier }
  })
  return { honors: await honorsForGuest(row.guest.id), warning }
})
