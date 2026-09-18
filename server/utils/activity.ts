import { reservationActivity } from '../database/schema'
import type { useDb } from './db'

type Db = ReturnType<typeof useDb>
export type Change = { field: string, from: unknown, to: unknown }

// Fields worth showing in the activity log, with their display names.
const TRACKED: Record<string, string> = {
  status: 'Status',
  date: 'Date',
  time: 'Time',
  partySize: 'Party size',
  seatedGuests: 'Seated guests',
  durationMinutes: 'Duration',
  tableId: 'Table',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone',
  notes: 'Reservation notes',
  internalNotes: 'Internal notes',
  tags: 'Tags',
  notifyGuest: 'Guest notifications'
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

export function diffReservation(before: Record<string, unknown>, after: Record<string, unknown>): Change[] {
  return Object.keys(TRACKED)
    .filter(key => key in after && !same(before[key], after[key]))
    .map(key => ({ field: TRACKED[key]!, from: before[key] ?? null, to: after[key] ?? null }))
}

export async function logActivity(db: Db, reservationId: number, staffId: number | null, action: string, changes: Change[] = []) {
  await db.insert(reservationActivity).values({ reservationId, staffId, action, changes })
}
