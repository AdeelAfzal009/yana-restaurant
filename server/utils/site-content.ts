import { DEFAULT_CONCIERGE, normalizeConcierge } from '#shared/utils/concierge'
import type { ConciergeConfig } from '#shared/utils/concierge'
import { DEFAULT_EMAIL_CONTENT, normalizeEmailContent } from '#shared/utils/email-content'
import type { EmailContent } from '#shared/utils/email-content'
import { eq } from 'drizzle-orm'
import { siteContent } from '../database/schema'
import { useDb } from './db'

// Each editable document: its storage key, defaults, and the function that
// cleans whatever is stored (or sent) into a valid value.
const DOCUMENTS = {
  concierge: { defaults: DEFAULT_CONCIERGE, normalize: normalizeConcierge },
  email_templates: { defaults: DEFAULT_EMAIL_CONTENT, normalize: normalizeEmailContent }
} as const

type DocKey = keyof typeof DOCUMENTS
type DocValue<K extends DocKey> = K extends 'concierge' ? ConciergeConfig : EmailContent

// Saved value merged over the defaults, or the defaults if nothing is saved yet.
export async function getContent<K extends DocKey>(key: K) {
  const doc = DOCUMENTS[key]
  const [row] = await useDb().select().from(siteContent).where(eq(siteContent.key, key)).limit(1)
  return {
    config: (row ? doc.normalize(row.value) : doc.defaults) as DocValue<K>,
    updatedAt: row?.updatedAt ?? null,
    isDefault: !row
  }
}

export async function saveContent<K extends DocKey>(key: K, value: DocValue<K>, staffId: number) {
  const now = new Date()
  await useDb().insert(siteContent)
    .values({ key, value, updatedBy: staffId, updatedAt: now })
    .onConflictDoUpdate({ target: siteContent.key, set: { value, updatedBy: staffId, updatedAt: now } })
  return now
}

export async function resetContent(key: DocKey) {
  await useDb().delete(siteContent).where(eq(siteContent.key, key))
}

// Emails must still go out if the database read fails, so this never throws.
export async function getEmailContent(): Promise<EmailContent> {
  try {
    return (await getContent('email_templates')).config
  } catch (error) {
    console.error('[mail] Could not load email templates, using defaults:', error)
    return DEFAULT_EMAIL_CONTENT
  }
}

// Kept for the chatbot endpoints.
export const getConciergeConfig = () => getContent('concierge')
export const saveConciergeConfig = (config: ConciergeConfig, staffId: number) => saveContent('concierge', config, staffId)
export const resetConciergeConfig = () => resetContent('concierge')
