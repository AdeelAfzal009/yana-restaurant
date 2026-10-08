import { getContentPage } from '#shared/content'
import { normalizeSection, sectionDefaults, validateSection } from '#shared/content/schema'
import { contentPermission } from '#shared/utils/permissions'
import { requirePermission } from '../../../utils/auth'
import { resetSection, saveSection } from '../../../utils/page-content'
import { badRequest } from '../../../utils/validate'

// Saves one section of a page: { section, value }. { section, reset: true }
// puts that section back to the built-in default.
export default defineEventHandler(async (event) => {
  const page = getContentPage(getRouterParam(event, 'page') ?? '')
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Unknown page' })
  const current = await requirePermission(event, contentPermission(page.key))

  const body = await readBody<{ section?: string, value?: unknown, reset?: boolean }>(event)
  const section = page.sections.find(s => s.id === body?.section)
  if (!section) badRequest('Unknown section')

  if (body.reset) {
    await resetSection(page, section)
    return { value: sectionDefaults(section), isDefault: true, updatedAt: null, updatedByName: null }
  }

  if (!body.value || typeof body.value !== 'object') badRequest('Missing section content')
  const problem = validateSection(section, body.value)
  if (problem) badRequest(problem)

  const value = normalizeSection(section, body.value)
  await saveSection(page, section, value, current.id)
  return { value, isDefault: false, updatedAt: new Date(), updatedByName: current.name }
})
