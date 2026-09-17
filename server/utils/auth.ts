import { createHmac, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { staff, type Staff } from '../database/schema'
import { useDb } from './db'
import { getSessionSecret } from './env'

export const SESSION_COOKIE = 'yana_admin_session'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

interface SessionPayload {
  staffId: number
  exp: number
}

function sign(body: string) {
  return createHmac('sha256', getSessionSecret()).update(body).digest('base64url')
}

function readSession(event: H3Event): SessionPayload | null {
  const cookie = getCookie(event, SESSION_COOKIE)
  if (!cookie) return null

  const [body, signature] = cookie.split('.')
  if (!body || !signature) return null

  const expected = sign(body)
  const given = Buffer.from(signature)
  const want = Buffer.from(expected)
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.staffId !== 'number' || typeof payload.exp !== 'number') return null
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, staffId: number) {
  const payload: SessionPayload = { staffId, exp: Date.now() + SESSION_TTL_MS }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

  setCookie(event, SESSION_COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

// The staff row is re-read on every request, so deactivating an account
// immediately invalidates any session it still holds.
export async function getCurrentStaff(event: H3Event): Promise<Staff | null> {
  const session = readSession(event)
  if (!session) return null

  const db = useDb()
  const [row] = await db.select().from(staff).where(eq(staff.id, session.staffId)).limit(1)
  if (!row || !row.active) return null

  return row
}

export async function requireAuth(event: H3Event) {
  const current = await getCurrentStaff(event)
  if (!current) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return current
}

export async function requireManager(event: H3Event) {
  const current = await requireAuth(event)
  if (current.role !== 'manager') {
    throw createError({ statusCode: 403, statusMessage: 'Manager access required' })
  }
  return current
}
