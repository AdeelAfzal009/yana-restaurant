// Copies the website content edited in the dashboard on a deployed site
// (Railway) into the local database, so local shows the same text and images.
//
//   LIVE_DATABASE_URL="postgresql://…" npm run db:pull-content
//
// Use Railway's *public* connection string (Postgres service › Variables ›
// DATABASE_PUBLIC_URL); the internal one only works inside Railway.
//
// What it copies: every edited website section, the chatbot, the email
// templates, and every uploaded image/PDF. It only reads from the live
// database. Locally those tables are replaced to match live, so uploads or
// edits made only on this machine are overwritten. Bookings, guests and users
// are left alone.
import { Pool } from 'pg'
import { resolvePgSsl } from '../server/utils/pg-ssl'

const liveUrl = process.env.LIVE_DATABASE_URL
const localUrl = process.env.DATABASE_URL

if (!liveUrl) {
  console.error('Set LIVE_DATABASE_URL to the live database\'s public connection string (Railway › Postgres › Variables › DATABASE_PUBLIC_URL).')
  process.exit(1)
}
if (!localUrl) {
  console.error('DATABASE_URL (the local database) is not set. Is there a .env file?')
  process.exit(1)
}
if (liveUrl === localUrl) {
  console.error('LIVE_DATABASE_URL and DATABASE_URL are the same database; nothing to do.')
  process.exit(1)
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return 'unknown host'
  }
}

// Railway's public proxy needs SSL even without ?sslmode in the URL.
const liveSsl = resolvePgSsl(liveUrl) || (/localhost|127\.0\.0\.1/.test(liveUrl) ? false : { rejectUnauthorized: false })
const live = new Pool({ connectionString: liveUrl, ssl: liveSsl, max: 2 })
const local = new Pool({ connectionString: localUrl, ssl: resolvePgSsl(localUrl), max: 2 })

const CONTENT_FILTER = `key like 'content/%' or key in ('concierge', 'email_templates')`

async function main() {
  console.log(`Reading from ${hostOf(liveUrl!)} (read-only)…`)
  const src = await live.connect()
  await src.query('begin read only')

  const { rows: content } = await src.query(`select key, value, updated_by, updated_at from site_content where ${CONTENT_FILTER} order by key`)
  const { rows: mediaIds } = await src.query('select id from media order by id')

  // Staff ids differ between databases; "saved by" is matched up by email.
  const { rows: liveStaff } = await src.query('select id, email from staff')
  const { rows: localStaff } = await local.query('select id, email from staff')
  const localIdByEmail = new Map(localStaff.map(s => [s.email, s.id]))
  const mapStaff = (liveId: number | null) => {
    if (liveId == null) return null
    const email = liveStaff.find(s => s.id === liveId)?.email
    return email ? localIdByEmail.get(email) ?? null : null
  }

  console.log(`Found ${content.length} saved content sections and ${mediaIds.length} uploaded files.`)
  console.log(`Writing to ${hostOf(localUrl!)}…`)

  const dst = await local.connect()
  try {
    await dst.query('begin')
    await dst.query(`delete from site_content where ${CONTENT_FILTER}`)
    for (const row of content) {
      await dst.query(
        'insert into site_content (key, value, updated_by, updated_at) values ($1, $2, $3, $4)',
        [row.key, JSON.stringify(row.value), mapStaff(row.updated_by), row.updated_at]
      )
    }

    // Files keep their id and hash so the /media/<id>-<hash> links in the
    // content keep working. Copied a few at a time to keep memory low.
    await dst.query('delete from media')
    let bytes = 0
    for (let i = 0; i < mediaIds.length; i += 10) {
      const ids = mediaIds.slice(i, i + 10).map(r => r.id)
      const { rows } = await src.query('select * from media where id = any($1) order by id', [ids])
      for (const m of rows) {
        await dst.query(
          `insert into media (id, kind, filename, mime, ext, hash, size, width, height, data, uploaded_by, created_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [m.id, m.kind, m.filename, m.mime, m.ext, m.hash, m.size, m.width, m.height, m.data, mapStaff(m.uploaded_by), m.created_at]
        )
        bytes += m.size
      }
      process.stdout.write(`\r  Files: ${Math.min(i + 10, mediaIds.length)} / ${mediaIds.length}`)
    }
    if (mediaIds.length) process.stdout.write('\n')
    // New local uploads continue after the copied ids.
    await dst.query(`select setval(pg_get_serial_sequence('media', 'id'), greatest((select max(id) from media), 1), (select count(*) > 0 from media))`)
    await dst.query('commit')

    console.log(`Done: ${content.length} sections and ${mediaIds.length} files (${(bytes / 1024 / 1024).toFixed(1)} MB) copied.`)
    for (const row of content) console.log(`  • ${row.key.replace(/^content\//, '')}`)
    console.log('Restart the local dev server (or wait a minute) to see the changes; content is cached for 60 seconds.')
  } catch (error) {
    await dst.query('rollback')
    throw error
  } finally {
    dst.release()
    await src.query('rollback')
    src.release()
  }
}

main()
  .catch((error) => {
    console.error('\nNothing was changed locally. Error:', error.message ?? error)
    process.exitCode = 1
  })
  .finally(() => Promise.all([live.end(), local.end()]))
