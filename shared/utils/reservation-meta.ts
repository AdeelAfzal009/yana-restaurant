export const RESERVATION_STATUSES = [
  'pending', 'confirmed', 'waitlist', 'arrived', 'seated', 'finished', 'cancelled', 'no_show'
] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_SOURCES = ['online', 'phone', 'walk_in', 'staff'] as const
export type ReservationSource = (typeof RESERVATION_SOURCES)[number]

export const STATUS_META: Record<ReservationStatus, { label: string, color: string }> = {
  pending: { label: 'Pending', color: '#C08A2E' },
  confirmed: { label: 'Confirmed', color: '#2F6FB0' },
  waitlist: { label: 'Waitlist', color: '#6B6FA8' },
  arrived: { label: 'Arrived', color: '#8A5BB5' },
  seated: { label: 'Seated', color: '#1E8A5A' },
  finished: { label: 'Left', color: '#6B7684' },
  cancelled: { label: 'Cancelled', color: '#C2412D' },
  no_show: { label: 'No-show', color: '#8C2A1E' }
}

export const SOURCE_LABELS: Record<ReservationSource, string> = {
  online: 'Online',
  phone: 'Phone',
  walk_in: 'Walk-in',
  staff: 'Staff'
}

// ServMe-style split: one stored status, shown as two dropdowns. Pre-service
// covers the booking itself; in-service tracks the party once they're here.
export const PRE_SERVICE_STATUSES = ['pending', 'confirmed', 'waitlist', 'cancelled', 'no_show'] as const satisfies readonly ReservationStatus[]
export const IN_SERVICE_STATUSES = ['arrived', 'seated', 'finished'] as const satisfies readonly ReservationStatus[]
export type PreServiceStatus = (typeof PRE_SERVICE_STATUSES)[number]
export type InServiceStatus = (typeof IN_SERVICE_STATUSES)[number]

export function preServiceOf(status: ReservationStatus): PreServiceStatus {
  return (PRE_SERVICE_STATUSES as readonly string[]).includes(status) ? status as PreServiceStatus : 'confirmed'
}

export function inServiceOf(status: ReservationStatus): InServiceStatus | null {
  return (IN_SERVICE_STATUSES as readonly string[]).includes(status) ? status as InServiceStatus : null
}

export const SALUTATIONS = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Sheikh', 'Sheikha', 'HE']
export const GENDERS = ['Female', 'Male', 'Other']
export const LANGUAGES = ['English', 'Arabic', 'French', 'Russian', 'Spanish', 'Italian', 'German', 'Hindi', 'Urdu', 'Chinese']
export const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'X', 'Website']

// Status groups drive the tabs on the reservations screen.
export const STATUS_GROUPS = [
  { key: 'all', label: 'All Reservations', statuses: ['pending', 'confirmed', 'arrived', 'seated', 'finished'] },
  { key: 'upcoming', label: 'Upcoming', statuses: ['pending', 'confirmed'] },
  { key: 'in_service', label: 'Arrived / Seated', statuses: ['arrived', 'seated'] },
  { key: 'finished', label: 'Finished', statuses: ['finished'] },
  { key: 'cancelled', label: 'Cancelled / No-show', statuses: ['cancelled', 'no_show'] },
  { key: 'waitlist', label: 'Waitlist', statuses: ['waitlist'] }
] as const satisfies readonly { key: string, label: string, statuses: readonly ReservationStatus[] }[]

// Statuses that occupy a table (count toward capacity and block the timeline).
export const ACTIVE_STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'arrived', 'seated']

export const SHIFTS = [
  { key: 'all', label: 'All day', start: '09:00', end: '24:00' },
  { key: 'breakfast', label: 'Breakfast', start: '09:00', end: '12:00' },
  { key: 'lunch', label: 'Lunch', start: '12:00', end: '17:00' },
  { key: 'dinner', label: 'Dinner', start: '17:00', end: '24:00' }
] as const
export type ShiftKey = (typeof SHIFTS)[number]['key']

export const RESERVATION_TAG_PRESETS = [
  'Birthday', 'Anniversary', 'Allergy', 'Business', 'Date night', 'High chair', 'Window seat', 'Terrace request', 'Proposal'
]

export const GUEST_TAG_PRESETS = [
  'VIP', 'Regular', 'Press', 'Influencer', 'Owner friend', 'Allergy', 'Vegetarian', 'Vegan', 'Pescatarian'
]

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function fromMinutes(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function shiftForTime(hhmm: string): ShiftKey {
  const m = toMinutes(hhmm)
  const match = SHIFTS.find(s => s.key !== 'all' && m >= toMinutes(s.start) && m < toMinutes(s.end))
  return match?.key ?? 'all'
}
