import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number, r: number, p: number, maxmem: number }
) => Promise<Buffer>

const N = 65536
const R = 8
const P = 1
const KEY_LENGTH = 64
const MAX_MEM = 256 * 1024 * 1024

// Stored as scrypt$N$r$p$salt$hash so the cost parameters can be raised later
// without invalidating existing passwords.
export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEM })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${derived.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, n, r, p, saltB64, hashB64] = parts
  const salt = Buffer.from(saltB64!, 'base64')
  const expected = Buffer.from(hashB64!, 'base64')

  const derived = await scrypt(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEM
  })

  return derived.length === expected.length && timingSafeEqual(derived, expected)
}
