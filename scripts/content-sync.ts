// Copies website content (dashboard sections, chatbot, email templates and
// the uploaded files they use) from one database to another. Used by
// db:push-content (local → staging) and db:pull-content (staging → local).
//
// Rules, the same in both directions:
//   - preview only unless `apply`; nothing is written in a preview
//   - a section is copied if it's missing on the other side, or the other
//     side's copy is OLDER; if the other side's copy is newer it's kept
//     (and reported) unless `force`
//   - sections that exist only on the other side are left alone
//   - before writing, the other side's content is saved to backups/
//   - bookings, guests and users are never touched
import { mkdirSync, writeFileSync } from 'node:fs'
import { Pool } from 'pg'
import { resolvePgSsl } from '../server/utils/pg-ssl'

const CONTENT_FILTER = `key like 'content/%' or key in ('concierge', 'email_templates')`
const MEDIA_LINK = /\/media\/(\d+)-([a-f0-9]{16})\.(webp|pdf)/g

interface Row { key: string, value: unknown, updated_by: number | null, updated_at: Date }

export interface SyncOptions {
  sourceUrl: string
  targetUrl: string
  sourceName: string // e.g. "local"
  targetName: string // e.g. "staging"
  apply: boolean
  force: boolean
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return 'unknown host'
  }
}

// Railway's tunnel and local Docker are plain connections; anything else gets SSL.
const sslFor = (url: string) => resolvePgSsl(url) || (/localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false })

const when = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ')
const label = (key: string) => key.replace(/^content\//, '').replace('/', ' › ')

export async function syncContent(o: SyncOptions) {
  if (o.sourceUrl === o.targetUrl) throw new Error('Both addresses point at the same database; nothing to do.')
  const source = new Pool({ connectionString: o.sourceUrl, ssl: sslFor(o.sourceUrl), max: 2 })
  const target = new Pool({ connectionString: o.targetUrl, ssl: sslFor(o.targetUrl), max: 2 })
  const To = o.targetName.charAt(0).toUpperCase() + o.targetName.slice(1)

  try {
    console.log(`From: ${o.sourceName} (${hostOf(o.sourceUrl)})`)
    console.log(`To:   ${o.targetName} (${hostOf(o.targetUrl)})${o.apply ? '' : '   — preview only, add -- --apply to write'}\n`)

    const { rows: sourceRows } = await source.query<Row>(`select key, value, updated_by, updated_at from site_content where ${CONTENT_FILTER} order by key`)
    const { rows: targetRows } = await target.query<Row>(`select key, value, updated_by, updated_at from site_content where ${CONTENT_FILTER} order by key`)
    const targetByKey = new Map(targetRows.map(r => [r.key, r]))

    // "Saved by" is matched up by email; staff ids differ between databases.
    const { rows: sourceStaff } = await source.query('select id, email, name from staff')
    const { rows: targetStaff } = await target.query('select id, email, name from staff')
    const targetIdByEmail = new Map(targetStaff.map(s => [s.email, s.id]))
    const mapStaff = (id: number | null) => {
      const email = sourceStaff.find(s => s.id === id)?.email
      return email ? targetIdByEmail.get(email) ?? null : null
    }
    const nameOn = (staff: { id: number, name: string }[], id: number | null) => staff.find(s => s.id === id)?.name ?? 'someone'

    // ---- Uploaded files the source content points at ----
    const wanted = new Map<number, string>() // source media id → hash
    for (const r of sourceRows) for (const m of JSON.stringify(r.value).matchAll(MEDIA_LINK)) wanted.set(Number(m[1]), m[2]!)
    const { rows: targetMedia } = wanted.size
      ? await target.query('select id, hash from media where id = any($1) or hash = any($2)', [[...wanted.keys()], [...wanted.values()]])
      : { rows: [] as { id: number, hash: string }[] }
    const targetHash = new Map(targetMedia.map(m => [m.id, m.hash]))
    let fileCopies: { id: number, hash: string, renumber: boolean }[] = []
    const relink = new Map<number, number>() // source id → existing target id of the same file
    for (const [id, hash] of wanted) {
      if (targetHash.get(id) === hash) continue // already there under the same number
      const sameFile = targetMedia.find(m => m.hash === hash)
      if (sameFile) relink.set(id, sameFile.id) // already there under another number
      else fileCopies.push({ id, hash, renumber: targetHash.has(id) }) // copy; new number if taken
    }
    // A source section as it would read on the target.
    const asSent = (value: unknown) => {
      let json = JSON.stringify(value)
      for (const [from, to] of relink) json = json.replaceAll(`/media/${from}-`, `/media/${to}-`)
      return json
    }

    // ---- Decide, section by section ----
    const send: { row: Row, line: string }[] = []
    const kept: string[] = []
    let same = 0
    for (const r of sourceRows) {
      const t = targetByKey.get(r.key)
      if (!t) {
        send.push({ row: r, line: `  + new      ${label(r.key)}` })
      } else if (JSON.stringify(t.value) !== asSent(r.value)) {
        if (t.updated_at > r.updated_at && !o.force) {
          kept.push(`  = kept     ${label(r.key)}  (${o.targetName}'s copy is newer: saved ${when(t.updated_at)} by ${nameOn(targetStaff, t.updated_by)}; add -- --force to replace it)`)
        } else {
          const note = t.updated_at > r.updated_at ? `  ⚠ replaces ${o.targetName}'s newer copy (--force)` : `  (${o.sourceName} saved ${when(r.updated_at)} by ${nameOn(sourceStaff, r.updated_by)})`
          send.push({ row: r, line: `  ~ update   ${label(r.key)}${note}` })
        }
      } else if (fileCopies.some(f => f.renumber && JSON.stringify(r.value).includes(`/media/${f.id}-`))) {
        send.push({ row: r, line: `  ~ update   ${label(r.key)}  (link to a re-numbered file)` })
      } else same++
    }
    // Only copy files that a section being sent actually uses.
    fileCopies = fileCopies.filter(f => send.some(s => JSON.stringify(s.row.value).includes(`/media/${f.id}-`)))
    const onlyOnTarget = targetRows.filter(t => !sourceRows.some(r => r.key === t.key))

    for (const s of send) console.log(s.line)
    for (const k of kept) console.log(k)
    if (!send.length && !kept.length) console.log(`  Nothing to copy: ${o.targetName} already has the same content.`)
    console.log(`\n  ${send.length} to copy, ${kept.length} kept (newer on ${o.targetName}), ${same} already the same, ${onlyOnTarget.length} only on ${o.targetName} (left as they are).`)
    if (fileCopies.length) console.log(`  ${fileCopies.length} uploaded file${fileCopies.length === 1 ? '' : 's'} to copy${fileCopies.some(f => f.renumber) ? ' (some get a new number; their links are updated)' : ''}.`)

    if (!o.apply || !send.length) return

    // ---- Back up the target first ----
    mkdirSync('backups', { recursive: true })
    const backupFile = `backups/${o.targetName}-content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    writeFileSync(backupFile, JSON.stringify({ database: o.targetName, host: hostOf(o.targetUrl), savedAt: new Date(), rows: targetRows }, null, 2))
    console.log(`\nBacked up ${o.targetName}'s current content to ${backupFile}`)

    const client = await target.connect()
    try {
      await client.query('begin')
      // Files first, so content never points at a missing file.
      const newId = new Map<number, number>(relink)
      for (const f of fileCopies) {
        const { rows: [m] } = await source.query('select * from media where id = $1', [f.id])
        if (!m) throw new Error(`Uploaded file ${f.id} is missing from ${o.sourceName}`)
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

      for (const { row } of send) {
        let json = JSON.stringify(row.value)
        for (const [oldId, id] of newId) json = json.replaceAll(`/media/${oldId}-`, `/media/${id}-`)
        await client.query(
          `insert into site_content (key, value, updated_by, updated_at) values ($1, $2, $3, $4)
           on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
          [row.key, json, mapStaff(row.updated_by), row.updated_at])
      }
      await client.query('commit')
      console.log(`Done: ${send.length} sections and ${fileCopies.length} files copied to ${o.targetName}. ${To} shows them within a minute (content is cached for 60 seconds).`)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  } finally {
    await Promise.all([source.end(), target.end()])
  }
}

// Shared command-line wrapper for the two scripts.
export function runSync(o: Omit<SyncOptions, 'apply' | 'force'>) {
  syncContent({ ...o, apply: process.argv.includes('--apply'), force: process.argv.includes('--force') })
    .catch((error) => {
      console.error(`\nNothing was changed on ${o.targetName}. Error:`, error.message ?? error)
      process.exitCode = 1
    })
}
