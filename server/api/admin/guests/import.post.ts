import { audit } from '../../../utils/audit'
import { requirePermission } from '../../../utils/auth'
import { applyImport, describePlan, planImport, readSpreadsheet } from '../../../utils/guest-import'
import { badRequest } from '../../../utils/validate'

// Imports a guest list (.xlsx or .csv) sent as multipart form data: "file",
// plus mode=preview (default, saves nothing) or mode=import.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'guests')
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file) badRequest('Choose a file to import')
  const mode = parts?.find(p => p.name === 'mode')?.data.toString() === 'import' ? 'import' : 'preview'

  const plan = await planImport(await readSpreadsheet(file))
  const summary = describePlan(plan)
  if (mode === 'preview') return { mode, ...summary }

  const result = await applyImport(plan)
  await audit(event, current, 'guests.imported', {
    target: file.filename ?? 'guest list',
    details: { created: result.created, updated: result.updated, skipped: plan.skipped.length, source: plan.source }
  })
  return { mode, ...summary, result }
})
