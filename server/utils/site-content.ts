import { DEFAULT_CONCIERGE, normalizeConcierge } from '#shared/utils/concierge'
import type { ConciergeConfig } from '#shared/utils/concierge'
import { eq } from 'drizzle-orm'
import { siteContent } from '../database/schema'
import { useDb } from './db'

const CONCIERGE_KEY = 'concierge'

// Saved chatbot settings, or the built-in defaults if nothing is saved yet.
export async function getConciergeConfig() {
  const db = useDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.key, CONCIERGE_KEY)).limit(1)
  return {
    config: row ? normalizeConcierge(row.value) : DEFAULT_CONCIERGE,
    updatedAt: row?.updatedAt ?? null,
    isDefault: !row
  }
}

export async function saveConciergeConfig(config: ConciergeConfig, staffId: number) {
  const db = useDb()
  const now = new Date()
  await db.insert(siteContent)
    .values({ key: CONCIERGE_KEY, value: config, updatedBy: staffId, updatedAt: now })
    .onConflictDoUpdate({ target: siteContent.key, set: { value: config, updatedBy: staffId, updatedAt: now } })
  return now
}

export async function resetConciergeConfig() {
  await useDb().delete(siteContent).where(eq(siteContent.key, CONCIERGE_KEY))
}
