import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { Pool } from 'pg'
import { staff } from '../server/database/schema'
import { hashPassword } from '../server/utils/password'
import { resolvePgSsl } from '../server/utils/pg-ssl'

const databaseUrl = process.env.DATABASE_URL
const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.SEED_ADMIN_PASSWORD
const name = process.env.SEED_ADMIN_NAME?.trim() || 'Manager'

if (!databaseUrl) throw new Error('DATABASE_URL is required')
if (!email) throw new Error('SEED_ADMIN_EMAIL is required')
if (!password || password.length < 12) {
  throw new Error('SEED_ADMIN_PASSWORD is required and must be at least 12 characters')
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: resolvePgSsl(databaseUrl)
})
const db = drizzle(pool)

const passwordHash = await hashPassword(password)
const [existing] = await db.select().from(staff).where(eq(staff.email, email)).limit(1)

if (existing) {
  await db.update(staff).set({ passwordHash, name, role: 'manager', active: true }).where(eq(staff.id, existing.id))
  console.log(`Updated existing manager account: ${email}`)
} else {
  await db.insert(staff).values({ email, name, passwordHash, role: 'manager' })
  console.log(`Created manager account: ${email}`)
}

await pool.end()
