import { CONTENT_PAGES } from '#shared/content'
import { contentPermission, effectivePermissions } from '#shared/utils/permissions'
import { requireContentAccess } from '../../../utils/auth'
import { getContentUpdates } from '../../../utils/page-content'

// The dashboard's list of pages this user may edit.
export default defineEventHandler(async (event) => {
  const current = await requireContentAccess(event)
  const allowed = effectivePermissions(current)
  const updates = await getContentUpdates()
  return {
    pages: CONTENT_PAGES.filter(p => allowed.includes(contentPermission(p.key))).map(p => ({
      key: p.key,
      label: p.label,
      description: p.description,
      path: p.path ?? null,
      sectionCount: p.sections.length,
      editedSections: updates[p.key]?.editedSections ?? 0,
      updatedAt: updates[p.key]?.updatedAt ?? null
    }))
  }
})
