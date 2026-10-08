import { requirePermission } from '../../utils/auth'
import { getConciergeConfig } from '../../utils/site-content'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'chatbot')
  return getConciergeConfig()
})
