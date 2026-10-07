import { requireAuth } from '../../utils/auth'
import { getConciergeConfig } from '../../utils/site-content'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return getConciergeConfig()
})
