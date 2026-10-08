import { DEFAULT_EMAIL_CONTENT, normalizeEmailContent } from '#shared/utils/email-content'
import { requirePermission } from '../../../utils/auth'
import { resetContent, saveContent } from '../../../utils/site-content'
import { badRequest } from '../../../utils/validate'

// Saves the email wording. { reset: true } goes back to the built-in defaults.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'emails')
  const body = await readBody<{ content?: unknown, reset?: boolean }>(event)

  if (body?.reset) {
    await resetContent('email_templates')
    return { config: DEFAULT_EMAIL_CONTENT, updatedAt: null, isDefault: true }
  }
  if (!body?.content || typeof body.content !== 'object') badRequest('Missing email content')

  const content = normalizeEmailContent(body.content)
  const updatedAt = await saveContent('email_templates', content, current.id)
  return { config: content, updatedAt, isDefault: false }
})
