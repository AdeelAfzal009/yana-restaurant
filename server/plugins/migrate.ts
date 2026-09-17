import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { useDb } from '../utils/db'
import { getDatabaseUrl, getSessionSecret, INSECURE_SESSION_SECRET } from '../utils/env'

// Nitro swallows a rejected plugin and keeps serving, which would let a
// misconfigured deploy look healthy while running on a publicly-known session
// secret. In production we exit so the platform reports a failed deploy.
function fatal(message: string): never {
  console.error(`[startup] ${message}`)
  if (import.meta.dev) throw new Error(message)
  process.exit(1)
}

export default defineNitroPlugin(async () => {
  if (!import.meta.dev && getSessionSecret() === INSECURE_SESSION_SECRET) {
    fatal('ADMIN_SESSION_SECRET is still the insecure default. Set a real secret before deploying.')
  }

  if (!getDatabaseUrl()) {
    fatal('DATABASE_URL is not set. The server cannot start without a database.')
  }

  // Applied at boot so a deploy never serves a schema older than the code.
  try {
    await migrate(useDb(), { migrationsFolder: './server/database/migrations' })
  } catch (error) {
    console.error('[startup] Database migration failed:', error)
    if (import.meta.dev) throw error
    process.exit(1)
  }
})
