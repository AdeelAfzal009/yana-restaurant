import { getMediaFile } from '../../utils/media'

// Serves uploaded files. The hash in the name changes whenever the file does,
// so browsers can keep each URL for a year without ever showing a stale copy.
export default defineEventHandler(async (event) => {
  const match = /^(\d+)-([a-f0-9]{16})\.(webp|pdf)$/.exec(getRouterParam(event, 'file') ?? '')
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const etag = `"${match[2]}"`
  if (getRequestHeader(event, 'if-none-match') === etag) {
    setResponseStatus(event, 304)
    return null
  }

  const file = await getMediaFile(Number(match[1]))
  if (!file || file.hash !== match[2] || file.ext !== match[3]) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setResponseHeaders(event, {
    'Content-Type': file.mime,
    'Content-Length': String(file.data.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'ETag': etag,
    'X-Content-Type-Options': 'nosniff',
    ...(file.ext === 'pdf' ? { 'Content-Disposition': `inline; filename="${file.filename}"` } : {})
  })
  return file.data
})
