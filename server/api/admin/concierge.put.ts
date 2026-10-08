import { DEFAULT_CONCIERGE, normalizeConcierge, CONCIERGE_LIMITS } from '#shared/utils/concierge'
import { audit } from '../../utils/audit'
import { requirePermission } from '../../utils/auth'
import { resetConciergeConfig, saveConciergeConfig } from '../../utils/site-content'
import { badRequest } from '../../utils/validate'

// Saves the website chatbot. { reset: true } goes back to the built-in defaults.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'chatbot')
  const body = await readBody<{ config?: unknown, reset?: boolean }>(event)

  if (body?.reset) {
    await resetConciergeConfig()
    await audit(event, current, 'chatbot.reset')
    return { config: DEFAULT_CONCIERGE, updatedAt: null, isDefault: true }
  }

  if (!body?.config || typeof body.config !== 'object') badRequest('Missing chatbot settings')
  const rawTopics = (body.config as { topics?: unknown }).topics
  if (!Array.isArray(rawTopics)) badRequest('Topics must be a list')
  if (rawTopics.length > CONCIERGE_LIMITS.topics) badRequest(`Up to ${CONCIERGE_LIMITS.topics} options`)

  const config = normalizeConcierge(body.config)
  if (rawTopics.length !== config.topics.length) {
    badRequest('Every option needs a button label and a reply')
  }
  if (!config.topics.some(t => t.enabled)) badRequest('Keep at least one option switched on')

  const updatedAt = await saveConciergeConfig(config, current.id)
  await audit(event, current, 'chatbot.saved')
  return { config, updatedAt, isDefault: false }
})
