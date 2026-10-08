import { createHash } from 'node:crypto'
import { getContentPage } from '#shared/content'
import { desc, eq, like } from 'drizzle-orm'
import sharp from 'sharp'
import { media, siteContent } from '../database/schema'
import { useDb } from './db'
import { badRequest } from './validate'

export const MEDIA_LIMITS = {
  // Camera originals run to ~35 MB; they're shrunk to well under 1 MB on upload.
  imageBytes: 40 * 1024 * 1024,
  pdfBytes: 10 * 1024 * 1024,
  // Longest side after resizing; plenty for a full-width hero on a retina screen.
  imageMaxPx: 2400
}

// SVG is left out on purpose: it can carry scripts.
const IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'heif'])

export interface MediaItem {
  id: number
  kind: 'image' | 'pdf'
  filename: string
  url: string
  size: number
  width: number | null
  height: number | null
  createdAt: Date
}

export const mediaUrl = (row: { id: number, hash: string, ext: string }) => `/media/${row.id}-${row.hash}.${row.ext}`

const listColumns = {
  id: media.id,
  kind: media.kind,
  filename: media.filename,
  hash: media.hash,
  ext: media.ext,
  size: media.size,
  width: media.width,
  height: media.height,
  createdAt: media.createdAt
}

function toItem(row: { id: number, kind: 'image' | 'pdf', filename: string, hash: string, ext: string, size: number, width: number | null, height: number | null, createdAt: Date }): MediaItem {
  const { hash, ext, ...rest } = row
  return { ...rest, url: mediaUrl({ id: row.id, hash, ext }) }
}

// Never selects the file bytes, so the library stays quick to load.
export async function listMedia(kind?: 'image' | 'pdf') {
  const rows = await useDb().select(listColumns).from(media)
    .where(kind ? eq(media.kind, kind) : undefined)
    .orderBy(desc(media.createdAt))
  return rows.map(toItem)
}

function cleanFilename(name: string | undefined, ext: string) {
  const base = (name ?? 'file').replace(/\.[^.]+$/, '').replace(/[^\w\- ]+/g, '').trim().slice(0, 80) || 'file'
  return `${base}.${ext}`
}

// Photos are turned upright, shrunk to at most 2400px and re-encoded as webp
// (usually a tenth of the camera file). PDFs are stored as they are.
export async function storeUpload(file: { data: Buffer, filename?: string }, staffId: number) {
  let kind: 'image' | 'pdf'
  let data: Buffer
  let width: number | null = null
  let height: number | null = null

  if (file.data.subarray(0, 5).toString('latin1') === '%PDF-') {
    if (file.data.length > MEDIA_LIMITS.pdfBytes) badRequest('PDFs can be up to 10 MB. Try compressing it first.')
    kind = 'pdf'
    data = file.data
  } else {
    if (file.data.length > MEDIA_LIMITS.imageBytes) badRequest('Images can be up to 40 MB.')
    let format: string | undefined
    try {
      format = (await sharp(file.data).metadata()).format
    } catch {}
    if (!format || !IMAGE_FORMATS.has(format)) badRequest('Upload a JPG, PNG, WebP or PDF file.')
    kind = 'image'
    try {
      const out = await sharp(file.data)
        .rotate()
        .resize({ width: MEDIA_LIMITS.imageMaxPx, height: MEDIA_LIMITS.imageMaxPx, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true })
      data = out.data
      width = out.info.width
      height = out.info.height
    } catch {
      badRequest('That image could not be read. Try saving it as a JPG and uploading again.')
    }
  }

  const ext = kind === 'pdf' ? 'pdf' : 'webp'
  const [row] = await useDb().insert(media).values({
    kind,
    filename: cleanFilename(file.filename, ext),
    mime: kind === 'pdf' ? 'application/pdf' : 'image/webp',
    ext,
    hash: createHash('sha256').update(data).digest('hex').slice(0, 16),
    size: data.length,
    width,
    height,
    data,
    uploadedBy: staffId
  }).returning(listColumns)
  return toItem(row!)
}

// Recently served files kept in memory, so popular images don't hit the
// database on every request. Oldest entries are dropped past the byte budget.
const CACHE_BYTES = 64 * 1024 * 1024
const CACHE_MAX_FILE = 8 * 1024 * 1024
const fileCache = new Map<number, { hash: string, ext: string, mime: string, filename: string, data: Buffer }>()
let cachedBytes = 0

function remember(id: number, entry: { hash: string, ext: string, mime: string, filename: string, data: Buffer }) {
  if (entry.data.length > CACHE_MAX_FILE) return
  fileCache.set(id, entry)
  cachedBytes += entry.data.length
  for (const [key, old] of fileCache) {
    if (cachedBytes <= CACHE_BYTES) break
    fileCache.delete(key)
    cachedBytes -= old.data.length
  }
}

export async function getMediaFile(id: number) {
  const hit = fileCache.get(id)
  if (hit) {
    // Re-insert so it counts as recently used.
    fileCache.delete(id)
    fileCache.set(id, hit)
    return hit
  }
  const [row] = await useDb()
    .select({ hash: media.hash, ext: media.ext, mime: media.mime, filename: media.filename, data: media.data })
    .from(media).where(eq(media.id, id)).limit(1)
  if (row) remember(id, row)
  return row ?? null
}

// Content sections that still point at this file, so it isn't deleted while
// the website shows it.
export async function findMediaUsage(id: number) {
  const rows = await useDb().select({ key: siteContent.key, value: siteContent.value })
    .from(siteContent).where(like(siteContent.key, 'content/%'))
  const needle = `/media/${id}-`
  return rows.filter(r => JSON.stringify(r.value).includes(needle)).map((r) => {
    const [, pageKey, sectionId] = r.key.split('/')
    const page = getContentPage(pageKey ?? '')
    const section = page?.sections.find(s => s.id === sectionId)
    return page && section ? `${page.label} › ${section.label}` : `${pageKey}/${sectionId}`
  })
}

// Returns the deleted file's name, or null if there was no such file.
export async function deleteMedia(id: number) {
  const [row] = await useDb().delete(media).where(eq(media.id, id)).returning({ filename: media.filename })
  const cached = fileCache.get(id)
  if (cached) {
    fileCache.delete(id)
    cachedBytes -= cached.data.length
  }
  return row?.filename ?? null
}
