import { DEFAULT_CONCIERGE } from '#shared/utils/concierge'
import { getConciergeConfig } from '../utils/site-content'

// Public: the website chatbot reads its replies from here.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')
  try {
    return (await getConciergeConfig()).config
  } catch (error) {
    // The widget must keep working even if the database is unreachable.
    console.error('[concierge] Falling back to defaults:', error)
    return DEFAULT_CONCIERGE
  }
})
