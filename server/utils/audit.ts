import { lt } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { auditLog } from '../database/schema'
import { useDb } from './db'
import { clientIp } from './request'

// Records a dashboard action for the Logs page. Never throws: a failed log
// write must not undo or block the action it describes.
export async function audit(
  event: H3Event,
  actor: { id: number, name: string } | null,
  action: string,
  extra: { target?: string | null, details?: Record<string, unknown> } = {}
) {
  try {
    await useDb().insert(auditLog).values({
      staffId: actor?.id ?? null,
      staffName: actor?.name ?? null,
      action,
      target: extra.target ?? null,
      details: extra.details ?? {},
      ip: clientIp(event)
    })
  } catch (error) {
    console.error(`[audit] Could not record "${action}":`, error)
  }
}

// Entries are kept for a year.
export const AUDIT_RETENTION_DAYS = 365

export async function pruneAuditLog() {
  const cutoff = new Date(Date.now() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  await useDb().delete(auditLog).where(lt(auditLog.createdAt, cutoff))
}
