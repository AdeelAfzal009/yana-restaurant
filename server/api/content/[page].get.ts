import { getContentPage } from '#shared/content'
import { getPublicContent } from '../../utils/page-content'

// Public: a page's website content, saved edits merged over the defaults.
export default defineEventHandler(async (event) => {
  const page = getContentPage(getRouterParam(event, 'page') ?? '')
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Unknown page' })
  return getPublicContent(page)
})
