import { effectivePermissions, homePathFor } from '#shared/utils/permissions'
import { eq } from 'drizzle-orm'
import { staff } from '../../database/schema'
import { audit } from '../../utils/audit'
import { setSessionCookie } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { verifyPassword } from '../../utils/password'

// Tuned so normal use can't lock a real person out: scrypt verification already
// costs ~100ms, which caps guessing far more effectively than a low counter.
const MAX_ATTEMPTS = 20
const WINDOW_MS = 5 * 60 * 1000

// In-memory and therefore per-instance; enough to blunt password guessing on a
// single container. Move to Redis if this ever runs more than one replica.
const attempts = new Map<string, { count: number, resetAt: number }>()

function hitRateLimit(key: string) {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  record.count += 1
  return record.count > MAX_ATTEMPTS
}

export default defineEventHandler(async (event) => {
  const key = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (hitRateLimit(key)) {
    // Logged once per lockout, not for every blocked attempt.
    if (attempts.get(key)?.count === MAX_ATTEMPTS + 1) await audit(event, null, 'auth.rate_limited')
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body?.email?.trim().toLowerCase()

  if (!email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = useDb()
  const [account] = await db.select().from(staff).where(eq(staff.email, email)).limit(1)

  // Same message for unknown email and wrong password, so the form can't be
  // used to discover which addresses have accounts.
  const invalid = () => createError({ statusCode: 401, statusMessage: 'Incorrect email or password' })

  // The log keeps the reason; the person signing in only ever sees "incorrect".
  const fail = async (reason: string) => {
    await audit(event, account ? { id: account.id, name: account.name } : null, 'auth.sign_in_failed', { target: email, details: { reason } })
    return invalid()
  }
  if (!account) throw await fail('No account with this email')
  if (!account.active) throw await fail('Account is deactivated')
  if (!(await verifyPassword(body.password, account.passwordHash))) throw await fail('Wrong password')

  attempts.delete(key)

  await db.update(staff).set({ lastLoginAt: new Date() }).where(eq(staff.id, account.id))
  setSessionCookie(event, account.id)
  await audit(event, account, 'auth.sign_in')

  return {
    ok: true,
    user: { id: account.id, name: account.name, email: account.email, role: account.role },
    mustChangePassword: account.mustChangePassword,
    // The first dashboard page this user can open.
    home: homePathFor(effectivePermissions(account))
  }
})
