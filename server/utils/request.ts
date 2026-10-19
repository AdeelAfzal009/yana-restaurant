import type { H3Event } from 'h3'

// The visitor's IP address. Behind Railway's proxy the real address is the
// LAST entry of X-Forwarded-For (the one the proxy added); earlier entries are
// whatever the client sent and can be faked, so they're never trusted.
export function clientIp(event: H3Event) {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const last = forwarded?.split(',').map(s => s.trim()).filter(Boolean).pop()
  return last || getRequestIP(event) || 'unknown'
}

// A simple fixed-window limiter, kept in memory. Per instance, which is enough
// for one container; move to Redis if this ever runs more than one replica.
export function rateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number, resetAt: number }>()

  return {
    // Counts one attempt; true once the key is over the limit.
    hit(key: string) {
      const now = Date.now()
      // Keep the map from growing without bound.
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k)

      const record = hits.get(key)
      if (!record || record.resetAt < now) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return false
      }
      record.count += 1
      return record.count > max
    },
    count: (key: string) => hits.get(key)?.count ?? 0,
    reset: (key: string) => hits.delete(key)
  }
}

// The site's public address (https://…). NUXT_PUBLIC_SITE_URL wins when set
// (for a custom domain); otherwise it's the address this request came in on.
export function siteOrigin(event: H3Event) {
  const configured = useRuntimeConfig(event).public.siteUrl as string
  if (configured) return configured.replace(/\/+$/, '')
  return getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
}
