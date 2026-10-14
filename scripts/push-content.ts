// Sends the website content edited in the LOCAL dashboard up to a deployed
// site (staging on Railway). The opposite of db:pull-content.
//
//   TARGET_DATABASE_URL="postgresql://…" npm run db:push-content            preview only
//   TARGET_DATABASE_URL="postgresql://…" npm run db:push-content -- --apply  write it
//
// Use the address `railway connect Postgres --tunnel-only` prints.
//
// What it sends: every website section saved locally, the chatbot, the email
// templates, and the uploaded images/PDFs that content uses. Sections that
// were only edited on the target are left alone. Bookings, guests and users are
// never touched. Before writing, the target's current content is saved to
// backups/ so a push can be undone.
import { mkdirSync, writeFileSync } from 'node:fs'
import { Pool } from 'pg'
import { resolvePgSsl } from '../server/utils/pg-ssl'

const targetUrl = process.env.TARGET_DATABASE_URL
const localUrl = process.env.DATABASE_URL
const apply = process.argv.includes('--apply')

if (!targetUrl) {
  console.error('Set TARGET_DATABASE_URL to the staging database (the address `railway connect Postgres --tunnel-only` prints).')
  process.exit(1)
}
if (!localUrl) {
  console.error('DATABASE_URL (the local database) is not set. Is there a .env file?')
  process.exit(1)
}
if (targetUrl === localUrl) {
  console.error('TARGET_DATABASE_URL and DATABASE_URL are the same database; nothing to do.')
  process.exit(1)
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return 'unknown host'
  }
}

const targetSsl = resolvePgSsl(targetUrl) || (/localhost|127\.0\.0\.1/.test(targetUrl) ? false : { rejectUnauthorized: false })
const target = new Pool({ connectionString: targetUrl, ssl: targetSsl, max: 2 })
const local = new Pool({ connectionString: localUrl, ssl: resolvePgSsl(localUrl), max: 2 })

const CONTENT_FILTER = `key like 'content/%' or key in ('concierge', 'email_templates')`
const MEDIA_LINK = /\/media\/(\d+)-([a-f0-9]{16})\.(webp|pdf)/g

interface Row { key: string, value: unknown, updated_by: number | null, updated_at: Date }

async function main() {
  console.log(`From: local (${hostOf(localUrl!)})`)
  console.log(`To:   ${hostOf(targetUrl!)}${apply ? '' : '   (preview only — add -- --apply to write)'}\n`)

  const { rows: localRows } = await local.query<Row>(`select key, value, updated_by, updated_at from site_content where ${CONTENT_FILTER} order by key`)
  const { rows: targetRows } = await target.query<Row>(`select key, value, updated_by, updated_at from site_content where ${CONTENT_FILTER} order by key`)
  const targetByKey = new Map(targetRows.map(r => [r.key, r]))

  // "Saved by" is matched up by email; staff ids differ between databases.
  const { rows: localStaff } = await local.query('select id, email, name from staff')
  const { rows: targetStaff } = await target.query('select id, email, name from staff')
  const targetIdByEmail = new Map(targetStaff.map(s => [s.email, s.id]))
  const mapStaff = (localId: number | null) => {
    const email = localStaff.find(s => s.id === localId)?.email
    return email ? targetIdByEmail.get(email) ?? null : null
  }
  const nameOf = (id: number | null) => targetStaff.find(s => s.id === id)?.name ?? 'someone'

  // ---- Uploaded files the local content points at ----
  const wanted = new Map<number, string>() // local media id → hash
  for (const r of localRows) for (const m of JSON.stringify(r.value).matchAll(MEDIA_LINK)) wanted.set(Number(m[1]), m[2]!)
  const { rows: targetMedia } = wanted.size
    ? await target.query('select id, hash from media where id = any($1) or hash = any($2)', [[...wanted.keys()], [...wanted.values()]])
    : { rows: [] as { id: number, hash: string }[] }
  const targetHash = new Map(targetMedia.map(m => [m.id, m.hash]))
  // Files to copy, and links to point elsewhere (local id → id on the target).
  const fileCopies: { id: number, hash: string, renumber: boolean }[] = []
  const relink = new Map<number, number>()
  for (const [id, hash] of wanted) {
    if (targetHash.get(id) === hash) continue // already there under the same number
    const sameFile = targetMedia.find(m => m.hash === hash)
    if (sameFile) relink.set(id, sameFile.id) // already there under another number: just point at it
    else fileCopies.push({ id, hash, renumber: targetHash.has(id) }) // number taken by a different file → new number
  }

  // A local section as it would read on the target, with links pointing at the
  // target's numbers for files it already has.
  const asSent = (value: unknown) => {
    let json = JSON.stringify(value)
    for (const [from, to] of relink) json = json.replaceAll(`/media/${from}-`, `/media/${to}-`)
    return json
  }

  // ---- What would change ----
  const changes: { key: string, kind: 'new' | 'update', note: string }[] = []
  let unchanged = 0
  for (const r of localRows) {
    const t = targetByKey.get(r.key)
    if (!t) changes.push({ key: r.key, kind: 'new', note: '' })
    else if (JSON.stringify(t.value) !== asSent(r.value)) {
      const newer = t.updated_at > r.updated_at
      changes.push({ key: r.key, kind: 'update', note: newer ? `  ⚠ staging's version is newer (saved ${t.updated_at.toISOString().slice(0, 16).replace('T', ' ')} by ${nameOf(t.updated_by)}) and will be replaced` : '' })
    } else if (fileCopies.some(f => f.renumber && JSON.stringify(r.value).includes(`/media/${f.id}-`))) {
      // Same text, but it uses a file that gets a new number on staging: send it so its link is updated.
      changes.push({ key: r.key, kind: 'update', note: '  (link to a re-numbered file updated)' })
    } else unchanged++
  }
  const onlyOnTarget = targetRows.filter(t => !localRows.some(r => r.key === t.key))

  const label = (key: string) => key.replace(/^content\//, '').replace('/', ' › ')
  for (const c of changes) console.log(`  ${c.kind === 'new' ? '+ new    ' : '~ update '} ${label(c.key)}${c.note}`)
  if (!changes.length) console.log('  Nothing to send: staging already has the same content.')
  console.log(`\n  ${changes.length} to send, ${unchanged} already the same, ${onlyOnTarget.length} only on staging (left as they are).`)
  if (fileCopies.length) console.log(`  ${fileCopies.length} uploaded file${fileCopies.length === 1 ? '' : 's'} to copy${fileCopies.some(f => f.renumber) ? ' (some get a new number on staging; their links are updated)' : ''}.`)

  if (!apply || (!changes.length && !fileCopies.length)) return

  // ---- Back up what's on the target first ----
  mkdirSync('backups', { recursive: true })
  const backupFile = `backups/staging-content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  writeFileSync(backupFile, JSON.stringify({ from: hostOf(targetUrl!), savedAt: new Date(), rows: targetRows }, null, 2))
  console.log(`\nBacked up staging's current content to ${backupFile}`)

  const client = await target.connect()
  try {
    await client.query('begin')
    // Files first, so the content never points at a missing file.
    const newId = new Map<number, number>(relink)
    for (const f of fileCopies) {
      const { rows: [m] } = await local.query('select * from media where id = $1', [f.id])
      if (!m) throw new Error(`Uploaded file ${f.id} is missing from the local database`)
      const values = [m.kind, m.filename, m.mime, m.ext, m.hash, m.size, m.width, m.height, m.data, mapStaff(m.uploaded_by), m.created_at]
      if (f.renumber) {
        const { rows: [created] } = await client.query(
          `insert into media (kind, filename, mime, ext, hash, size, width, height, data, uploaded_by, created_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`, values)
        newId.set(f.id, created.id)
      } else {
        await client.query(
          `insert into media (id, kind, filename, mime, ext, hash, size, width, height, data, uploaded_by, created_at)
           values ($12, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [...values, f.id])
      }
    }
    await client.query(`select setval(pg_get_serial_sequence('media', 'id'), greatest((select coalesce(max(id), 1) from media), 1))`)

    for (const c of changes) {
      const r = localRows.find(x => x.key === c.key)!
      let json = JSON.stringify(r.value)
      for (const [oldId, id] of newId) json = json.replaceAll(`/media/${oldId}-`, `/media/${id}-`)
      await client.query(
        `insert into site_content (key, value, updated_by, updated_at) values ($1, $2, $3, $4)
         on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
        [r.key, json, mapStaff(r.updated_by), r.updated_at])
    }
    await client.query('commit')
    console.log(`Done: ${changes.length} sections and ${fileCopies.length} files sent. Staging shows them within a minute (its content cache).`)
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

main()
  .catch((error) => {
    console.error('\nNothing was changed on staging. Error:', error.message ?? error)
    process.exitCode = 1
  })
  .finally(() => Promise.all([target.end(), local.end()]))
