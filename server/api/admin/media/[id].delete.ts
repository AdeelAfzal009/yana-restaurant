import { audit } from '../../../utils/audit'
import { requireContentAccess } from '../../../utils/auth'
import { deleteMedia, findMediaUsage } from '../../../utils/media'
import { badRequest } from '../../../utils/validate'

export default defineEventHandler(async (event) => {
  const current = await requireContentAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid file')

  const usedIn = await findMediaUsage(id)
  if (usedIn.length) {
    badRequest(`This file is still used on the website (${usedIn.join(', ')}). Replace it there first.`)
  }
  const filename = await deleteMedia(id)
  if (filename === null) throw createError({ statusCode: 404, statusMessage: 'File not found' })
  await audit(event, current, 'media.deleted', { target: filename })
  return { ok: true }
})
