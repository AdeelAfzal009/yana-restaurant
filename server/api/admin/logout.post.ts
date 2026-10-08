import { audit } from '../../utils/audit'
import { clearSessionCookie, getCurrentStaff } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const current = await getCurrentStaff(event)
  clearSessionCookie(event)
  if (current) await audit(event, current, 'auth.sign_out')
  return { ok: true }
})
