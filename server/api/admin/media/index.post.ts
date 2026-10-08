import { requireContentAccess } from '../../../utils/auth'
import { storeUpload } from '../../../utils/media'
import { badRequest } from '../../../utils/validate'

// Upload one image or PDF as multipart form data, in a field named "file".
export default defineEventHandler(async (event) => {
  const current = await requireContentAccess(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file) badRequest('Choose a file to upload')
  return { item: await storeUpload(file, current.id) }
})
