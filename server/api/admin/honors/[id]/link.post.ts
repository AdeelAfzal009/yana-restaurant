import { audit } from '../../../../utils/audit'
import { requirePermission } from '../../../../utils/auth'
import { createHonorsLink, honorsLinkUrl, loadHonorsMember, memberName } from '../../../../utils/honors'
import { sendHonorsCardEmail } from '../../../../utils/honors-email'
import { siteOrigin } from '../../../../utils/request'
import { badRequest } from '../../../../utils/validate'

// A new "add to wallet" link for the card: { channel: 'qr' | 'email' }.
// qr returns the link for the QR code shown at reception; email sends it to
// the guest. Either way, any earlier link stops working.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'guests')

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid card id')
  const { channel } = await readBody<{ channel?: unknown }>(event)
  if (channel !== 'qr' && channel !== 'email') badRequest('Invalid channel')

  const row = await loadHonorsMember(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  if (row.member.status !== 'active') badRequest('This card is revoked. Reactivate it first.')
  if (channel === 'email' && !row.guest.email) badRequest('Add the guest\'s email to their profile first')

  const { token, expiresAt } = await createHonorsLink(id, channel)
  const url = honorsLinkUrl(siteOrigin(event), token)
  if (channel === 'qr') return { url, expiresAt }

  const result = await sendHonorsCardEmail(row.member, row.guest, url, expiresAt)
  if (result.status === 'failed') throw createError({ statusCode: 502, statusMessage: `The email could not be sent: ${result.error}` })
  await audit(event, current, 'honors.link_emailed', {
    target: memberName(row.guest),
    details: { guestId: row.guest.id, memberNumber: row.member.memberNumber, to: row.guest.email, status: result.status }
  })
  return { status: result.status, to: row.guest.email, expiresAt }
})
