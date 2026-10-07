import { EMAIL_TEMPLATE_KEYS, normalizeEmailContent } from '#shared/utils/email-content'
import type { EmailTemplateKey } from '#shared/utils/email-content'
import { requireAuth } from '../../../utils/auth'
import { buildEmail, sampleEmailData } from '../../../utils/email-templates'
import { badRequest } from '../../../utils/validate'

// Renders the (possibly unsaved) wording with a sample booking, so the
// dashboard preview is exactly what guests will receive.
export default defineEventHandler(async (event) => {
  const current = await requireAuth(event)
  const body = await readBody<{ template?: string, content?: unknown }>(event)

  const template = body?.template as EmailTemplateKey
  if (!EMAIL_TEMPLATE_KEYS.includes(template)) badRequest('Unknown email template')

  const message = buildEmail(template, sampleEmailData(current.email), normalizeEmailContent(body?.content))
  return { subject: message.subject, html: message.html, text: message.text }
})
