import { audit } from '../../../utils/audit'
import { requirePermission } from '../../../utils/auth'
import { applyBookingImport, describeBookingPlan, findBookingTable, planBookingImport } from '../../../utils/booking-import'
import { readSpreadsheet } from '../../../utils/guest-import'
import { badRequest } from '../../../utils/validate'

// Imports bookings from ServMe reservation reports (.xlsx), one or more files
// as multipart "file" fields, plus mode=preview (default, saves nothing) or
// mode=import.
export default defineEventHandler(async (event) => {
  const current = await requirePermission(event, 'reservations')
  const parts = await readMultipartFormData(event)
  const uploads = parts?.filter(p => p.name === 'file' && p.data?.length) ?? []
  if (!uploads.length) badRequest('Choose a file to import')
  if (uploads.length > 10) badRequest('Up to 10 files at once')
  const mode = parts?.find(p => p.name === 'mode')?.data.toString() === 'import' ? 'import' : 'preview'

  const tables = []
  for (const file of uploads) {
    tables.push(findBookingTable(file.filename ?? 'file', await readSpreadsheet(file)))
  }
  const plan = await planBookingImport(tables)
  const summary = describeBookingPlan(plan)
  if (mode === 'preview') return { mode, ...summary }

  const result = await applyBookingImport(plan)
  await audit(event, current, 'reservations.imported', {
    target: uploads.map(f => f.filename).join(', '),
    details: { created: result.created, newGuests: result.newGuests, skipped: plan.skipped.length, source: 'ServMe' }
  })
  return { mode, ...summary, result }
})
