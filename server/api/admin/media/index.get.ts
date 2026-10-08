import { requireContentAccess } from '../../../utils/auth'
import { listMedia } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  await requireContentAccess(event)
  const kind = getQuery(event).kind
  return { items: await listMedia(kind === 'image' || kind === 'pdf' ? kind : undefined) }
})
