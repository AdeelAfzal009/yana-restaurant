import { getAppleWalletConfig } from '../../../utils/apple-wallet'
import { requirePermission } from '../../../utils/auth'
import { getGoogleWalletConfig } from '../../../utils/google-wallet'
import { getMailConfig } from '../../../utils/mail'

// Which wallets are set up, so the dashboard can say when one isn't yet.
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'reservations', 'guests')
  return {
    google: getGoogleWalletConfig().enabled,
    apple: getAppleWalletConfig().enabled,
    emailDryRun: getMailConfig().dryRun
  }
})
