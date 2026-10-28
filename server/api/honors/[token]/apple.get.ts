import { buildApplePass, getAppleWalletConfig } from '../../../utils/apple-wallet'
import { findHonorsByToken, markHonorsLinkUsed } from '../../../utils/honors'

// "Add to Apple Wallet": the signed .pkpass, which Safari opens straight in
// Wallet. Problems go back to the add page, which explains them.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const token = getRouterParam(event, 'token') ?? ''
  const back = (problem: string) => sendRedirect(event, `/add/${encodeURIComponent(token)}?problem=${problem}`, 302)

  const row = await findHonorsByToken(token)
  if (!row) return back('expired')
  if (!getAppleWalletConfig().enabled) return back('apple')

  let pass: Buffer
  try {
    pass = await buildApplePass(row.member, row.guest)
  } catch (error) {
    console.error('[apple-wallet]', error)
    return back('apple')
  }
  await markHonorsLinkUsed(row.member.id)
  setResponseHeaders(event, {
    'Content-Type': 'application/vnd.apple.pkpass',
    'Content-Disposition': `attachment; filename="yana-honors-${row.member.memberNumber}.pkpass"`
  })
  return pass
})
