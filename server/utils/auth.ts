import { createHmac, timingSafeEqual } from 'node:crypto'
import { effectivePermissions, hasAny, hasContentAccess } from '#shared/utils/permissions'
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

// While an account still has a temporary password, only these endpoints work,
// so the dashboard can't be used until the user has set their own.
const ALLOWED_BEFORE_PASSWORD_CHANGE = ['/api/admin/password']

export async function requireAuth(event: H3Event) {
  const current = await getCurrentStaff(event)
  if (!current) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (current.mustChangePassword && !ALLOWED_BEFORE_PASSWORD_CHANGE.some(p => event.path.startsWith(p))) {
    throw createError({ statusCode: 403, statusMessage: 'Please set a new password to continue' })
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

// Passes if the user has any one of the given permissions (managers always do).
export async function requirePermission(event: H3Event, ...keys: string[]) {
  const current = await requireAuth(event)
  if (!hasAny(effectivePermissions(current), keys)) {
    throw createError({ statusCode: 403, statusMessage: 'You don\'t have access to this. Ask a manager to give you access.' })
  }
  return current
}

// For things every website-content editor needs, like the media library.
export async function requireContentAccess(event: H3Event) {
  const current = await requireAuth(event)
  if (!hasContentAccess(effectivePermissions(current))) {
    throw createError({ statusCode: 403, statusMessage: 'You don\'t have access to website content.' })
  }
  return current
}
