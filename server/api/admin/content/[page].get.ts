import { getContentPage } from '#shared/content'
import { contentPermission } from '#shared/utils/permissions'
import { requirePermission } from '../../../utils/auth'
import { getAdminContent } from '../../../utils/page-content'

export default defineEventHandler(async (event) => {
  const page = getContentPage(getRouterParam(event, 'page') ?? '')
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Unknown page' })
  await requirePermission(event, contentPermission(page.key))
  return { sections: await getAdminContent(page) }
})
