import { siteOrigin } from '../utils/request'

// Search engines may read every public page, but not the dashboard or the API.
export default defineEventHandler((event) => {
  setResponseHeaders(event, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' })
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteOrigin(event)}/sitemap.xml`,
    ''
  ].join('\n')
})
