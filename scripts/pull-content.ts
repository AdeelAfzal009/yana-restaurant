// Brings website content edited in the STAGING dashboard down to local.
//
//   LIVE_DATABASE_URL="postgresql://…" npm run db:pull-content                      preview only
//   LIVE_DATABASE_URL="postgresql://…" npm run db:pull-content -- --apply           copy it
//   … -- --apply --force                                                             also replace newer local copies
//
// LIVE_DATABASE_URL is the address `railway connect Postgres --tunnel-only` prints.
// Local edits that are newer than staging's are kept. Rules are in content-sync.ts.
import { runSync } from './content-sync'

const liveUrl = process.env.LIVE_DATABASE_URL
const localUrl = process.env.DATABASE_URL
if (!liveUrl) {
  console.error('Set LIVE_DATABASE_URL to the staging database (the address `railway connect Postgres --tunnel-only` prints).')
  process.exit(1)
}
if (!localUrl) {
  console.error('DATABASE_URL (the local database) is not set. Is there a .env file?')
  process.exit(1)
}

runSync({ sourceUrl: liveUrl, targetUrl: localUrl, sourceName: 'staging', targetName: 'local' })
