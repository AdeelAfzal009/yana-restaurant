import { requirePermission } from '../../../utils/auth'
import { getContent } from '../../../utils/site-content'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'emails')
  return getContent('email_templates')
})
