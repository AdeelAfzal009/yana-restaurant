import { getGoogleWalletConfig, googleSaveUrl } from '../../../utils/google-wallet'
import { findHonorsByToken, markHonorsLinkUsed } from '../../../utils/honors'
import { siteOrigin } from '../../../utils/request'

// "Add to Google Wallet": sends the phone on to Google's save page. Problems
// go back to the add page, which explains them.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const token = getRouterParam(event, 'token') ?? ''
  const back = (problem: string) => sendRedirect(event, `/add/${encodeURIComponent(token)}?problem=${problem}`, 302)

  const row = await findHonorsByToken(token)
  if (!row) return back('expired')
  if (!getGoogleWalletConfig().enabled) return back('google')

  try {
    const url = await googleSaveUrl(row.member, row.guest, siteOrigin(event))
    await markHonorsLinkUsed(row.member.id)
    return sendRedirect(event, url, 302)
  } catch (error) {
    console.error('[google-wallet]', error)
    return back('google')
  }
})
