import { eq, sql } from 'drizzle-orm'
import { guests } from '../database/schema'
import type { useDb } from './db'

type Db = ReturnType<typeof useDb>

interface GuestContact {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

// Guests are matched on email (case-insensitive), then phone. A booking with
// neither — a walk-in who gave only a name — has no profile to attach to.
export async function findOrCreateGuest(db: Db, contact: GuestContact) {
  if (!contact.email && !contact.phone) return null

  if (contact.email) {
    const [byEmail] = await db.select({ id: guests.id }).from(guests)
      .where(sql`lower(${guests.email}) = lower(${contact.email})`).limit(1)
    if (byEmail) return byEmail.id
  } else if (contact.phone) {
    const [byPhone] = await db.select({ id: guests.id }).from(guests)
      .where(eq(guests.phone, contact.phone)).limit(1)
    if (byPhone) return byPhone.id
  }

  const [created] = await db.insert(guests).values(contact)
    .onConflictDoNothing()
    .returning({ id: guests.id })
  if (created) return created.id

  // Lost a race with a concurrent booking for the same email.
  const [existing] = await db.select({ id: guests.id }).from(guests)
    .where(sql`lower(${guests.email}) = lower(${contact.email})`).limit(1)
  return existing?.id ?? null
}
