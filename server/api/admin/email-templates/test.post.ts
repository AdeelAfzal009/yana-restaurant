import { EMAIL_TEMPLATE_KEYS, normalizeEmailContent } from '#shared/utils/email-content'
import type { EmailTemplateKey } from '#shared/utils/email-content'
import { requirePermission } from '../../../utils/auth'
import { buildEmail, sampleEmailData } from '../../../utils/email-templates'
import { sendMail } from '../../../utils/mail'
import { badRequest } from '../../../utils/validate'

// Sends the (possibly unsaved) template, filled with a sample booking, to the
// signed-in manager's own address only.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'emails')
  const body = await readBody<{ template?: string, content?: unknown }>(event)

  const template = body?.template as EmailTemplateKey
  if (!EMAIL_TEMPLATE_KEYS.includes(template)) badRequest('Unknown email template')

  const message = buildEmail(template, sampleEmailData(current.email), normalizeEmailContent(body?.content))
  const result = await sendMail({ ...message, to: current.email, subject: `[Test] ${message.subject}` })
  return { ...result, to: current.email }
})
