import { requireContentAccess } from '../../../utils/auth'
import { deleteMedia, findMediaUsage } from '../../../utils/media'
import { badRequest } from '../../../utils/validate'

export default defineEventHandler(async (event) => {
  await requireContentAccess(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) badRequest('Invalid file')

  const usedIn = await findMediaUsage(id)
  if (usedIn.length) {
    badRequest(`This file is still used on the website (${usedIn.join(', ')}). Replace it there first.`)
  }
  if (!await deleteMedia(id)) throw createError({ statusCode: 404, statusMessage: 'File not found' })
  return { ok: true }
})
