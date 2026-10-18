// Sends website content edited in the LOCAL dashboard up to staging.
//
//   TARGET_DATABASE_URL="postgresql://…" npm run db:push-content                    preview only
//   TARGET_DATABASE_URL="postgresql://…" npm run db:push-content -- --apply         copy it
//   … -- --apply --force                                                             also replace newer staging copies
//
// TARGET_DATABASE_URL is the address `railway connect Postgres --tunnel-only` prints.
// Rules (newer wins, backups, nothing deleted) are in content-sync.ts.
import { runSync } from './content-sync'

const targetUrl = process.env.TARGET_DATABASE_URL
const localUrl = process.env.DATABASE_URL
if (!targetUrl) {
  console.error('Set TARGET_DATABASE_URL to the staging database (the address `railway connect Postgres --tunnel-only` prints).')
  process.exit(1)
}
if (!localUrl) {
  console.error('DATABASE_URL (the local database) is not set. Is there a .env file?')
  process.exit(1)
}

runSync({ sourceUrl: localUrl, targetUrl, sourceName: 'local', targetName: 'staging' })
