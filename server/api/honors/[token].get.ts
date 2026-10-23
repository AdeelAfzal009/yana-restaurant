import { getAppleWalletConfig } from '../../utils/apple-wallet'
import { getGoogleWalletConfig } from '../../utils/google-wallet'
import { findHonorsByToken, memberName } from '../../utils/honors'

// The card behind an "add to wallet" link, for the public /add/<token> page.
// Only what the card itself shows; the discount is never sent to the guest.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const row = await findHonorsByToken(getRouterParam(event, 'token') ?? '')
  if (!row) throw createError({ statusCode: 404, statusMessage: 'This link has expired' })
  return {
    name: memberName(row.guest),
    tier: row.member.tier,
    memberNumber: row.member.memberNumber,
    wallets: { google: getGoogleWalletConfig().enabled, apple: getAppleWalletConfig().enabled }
  }
})
