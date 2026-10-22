// Runs before every request: security headers on every response, and two
// checks on requests that change something.

// What pages may load. Scripts and styles only from the site itself (Nuxt
// needs its small inline scripts and Vue its inline styles); fonts from Google
// Fonts; photos and videos from the site or any https address (the dashboard
// accepts https links); frames only for the Google map on the Reach Us page.
const CONTENT_SECURITY_POLICY = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `media-src 'self' blob: https:`,
  `connect-src 'self'`,
  `frame-src https://www.google.com https://maps.google.com`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`
].join('; ')

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Largest request body accepted: uploads and spreadsheet imports get room for
// camera photos; everything else is small JSON.
const UPLOAD_PATHS = ['/api/admin/media', '/api/admin/guests/import', '/api/admin/reservations/import']
const UPLOAD_MAX_BYTES = 45 * 1024 * 1024
const DEFAULT_MAX_BYTES = 1024 * 1024

export default defineEventHandler((event) => {
  const path = event.path

  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin'
  })

  // The dashboard and the API are never meant for search results, and
  // dashboard answers (guest details) must never be cached.
  if (path.startsWith('/admin') || path.startsWith('/api/')) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
  if (path.startsWith('/api/admin')) {
    setResponseHeader(event, 'Cache-Control', 'no-store')
  }

  // Development keeps Vite's hot reload working, which this policy would block.
  // The https-only parts apply only when the site is reached over https, so
  // a production build run locally (Docker on http://localhost) still works.
  if (!import.meta.dev) {
    const https = getRequestProtocol(event, { xForwardedProto: true }) === 'https'
    setResponseHeader(event, 'Content-Security-Policy', https ? `${CONTENT_SECURITY_POLICY}; upgrade-insecure-requests` : CONTENT_SECURITY_POLICY)
    if (https) setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000')
  }

  if (!path.startsWith('/api/') || !UNSAFE_METHODS.has(event.method)) return

  // Changes must come from this site's own pages. Browsers always send Origin
  // on these requests, so a form or script on another site is refused even
  // if the visitor is signed in to the dashboard.
  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    let originHost = ''
    try {
      originHost = new URL(origin).host
    } catch {}
    if (originHost !== getRequestHost(event, { xForwardedHost: true })) {
      throw createError({ statusCode: 403, statusMessage: 'Request refused' })
    }
  }

  const length = Number(getRequestHeader(event, 'content-length') || 0)
  const max = UPLOAD_PATHS.some(p => path.startsWith(p)) ? UPLOAD_MAX_BYTES : DEFAULT_MAX_BYTES
  if (length > max) {
    throw createError({ statusCode: 413, statusMessage: 'Request is too large' })
  }
})
