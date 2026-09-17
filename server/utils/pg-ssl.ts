// Kept free of Nuxt imports so the seed script can reuse it.
//
// Only negotiate SSL when the connection string actually asks for it. Managed
// providers append ?sslmode=require; plain Postgres (Docker, Railway's internal
// network) rejects the handshake outright, so defaulting to SSL breaks boot.
export function resolvePgSsl(url: string) {
  const mode = url.match(/[?&]sslmode=([^&]+)/)?.[1]

  if (!mode || mode === 'disable' || mode === 'allow') return false

  // rejectUnauthorized:false because managed providers commonly present
  // self-signed certificates on their internal endpoints.
  return { rejectUnauthorized: false }
}
