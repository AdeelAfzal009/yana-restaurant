import { sql } from 'drizzle-orm'
import { guests, reservations, restaurantTables } from '../database/schema'

// The columns every admin view of a reservation needs, including the joined
// table name and the guest's profile flags.
export const reservationColumns = {
  id: reservations.id,
  reference: reservations.reference,
  date: reservations.date,
  time: reservations.time,
  durationMinutes: reservations.durationMinutes,
  partySize: reservations.partySize,
  seatedGuests: reservations.seatedGuests,
  notifyGuest: reservations.notifyGuest,
  firstName: reservations.firstName,
  lastName: reservations.lastName,
  email: reservations.email,
  phone: reservations.phone,
  notes: reservations.notes,
  internalNotes: reservations.internalNotes,
  tags: reservations.tags,
  source: reservations.source,
  status: reservations.status,
  tableId: reservations.tableId,
  tableName: restaurantTables.name,
  sectionId: restaurantTables.sectionId,
  sectionName: sql<string | null>`(select name from floor_sections fs where fs.id = ${restaurantTables.sectionId})`,
  guestId: reservations.guestId,
  guestSalutation: guests.salutation,
  guestTags: guests.tags,
  guestVip: guests.vip,
  guestNotes: guests.notes,
  guestVisits: sql<number>`(
    select count(*)::int from ${reservations} r2
    where r2.guest_id = ${reservations.guestId} and r2.id <> ${reservations.id}
      and r2.status in ('seated', 'finished')
  )`,
  arrivedAt: reservations.arrivedAt,
  seatedAt: reservations.seatedAt,
  finishedAt: reservations.finishedAt,
  createdAt: reservations.createdAt,
  updatedAt: reservations.updatedAt,
  createdByName: sql<string | null>`(select name from staff s where s.id = ${reservations.createdBy})`,
  updatedByName: sql<string | null>`(select name from staff s where s.id = ${reservations.updatedBy})`
}

export function formatReservation<T extends { time: string, guestTags: string[] | null, guestVip: boolean | null }>(row: T) {
  return {
    ...row,
    time: row.time.slice(0, 5),
    guestTags: row.guestTags ?? [],
    guestVip: row.guestVip ?? false
  }
}
