import { requireAuth } from '../../../utils/auth'
import { getContent } from '../../../utils/site-content'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return getContent('email_templates')
})
