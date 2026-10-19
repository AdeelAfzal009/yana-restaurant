import { CONTENT_PAGES } from '#shared/content'
import { like, max } from 'drizzle-orm'
import { siteContent } from '../database/schema'
import { useDb } from '../utils/db'
import { siteOrigin } from '../utils/request'

// The public pages for search engines, each with the date it was last edited
// in the dashboard.
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
  const pages = CONTENT_PAGES.filter(p => p.path)

  const lastEdited = new Map<string, Date>()
  try {
    for (const page of pages) {
      const [row] = await useDb()
        .select({ at: max(siteContent.updatedAt) })
        .from(siteContent)
        .where(like(siteContent.key, `content/${page.key}/%`))
      if (row?.at) lastEdited.set(page.key, new Date(row.at))
    }
  } catch (error) {
    // Without the dates the sitemap is still useful.
    console.error('[sitemap] Could not read edit dates:', error)
  }

  const urls = pages.map((page) => {
    const at = lastEdited.get(page.key)
    return [
      '  <url>',
      `    <loc>${origin}${page.path}</loc>`,
      at ? `    <lastmod>${at.toISOString().slice(0, 10)}</lastmod>` : '',
      `    <priority>${page.path === '/' ? '1.0' : '0.8'}</priority>`,
      '  </url>'
    ].filter(Boolean).join('\n')
  })

  setResponseHeaders(event, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})
