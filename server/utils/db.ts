import { drizzle } from 'drizzle-orm/node-postgres'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../database/schema'
import { getDatabaseUrl } from './env'
import { resolvePgSsl } from './pg-ssl'

let instance: NodePgDatabase<typeof schema> | null = null

export function useDb() {
  if (instance) return instance

  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'DATABASE_URL is not configured' })
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    ssl: resolvePgSsl(databaseUrl)
  })

  instance = drizzle(pool, { schema })
  return instance
}

const REFERENCE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

// Ambiguous characters (0/O, 1/I) are excluded so staff can read a reference over the phone.
export function generateReference() {
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)]
  }
  return out
}
