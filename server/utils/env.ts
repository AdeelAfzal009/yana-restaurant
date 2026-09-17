export const INSECURE_SESSION_SECRET = 'dev-only-insecure-secret'

// Nuxt resolves runtimeConfig at build time and only overrides it at runtime from
// NUXT_-prefixed variables. Hosts like Railway inject plain DATABASE_URL, so
// process.env has to win here or the deployed app reads a baked-in empty string.
export function getDatabaseUrl() {
  return process.env.DATABASE_URL || useRuntimeConfig().databaseUrl || ''
}

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || useRuntimeConfig().adminSessionSecret || ''
}
