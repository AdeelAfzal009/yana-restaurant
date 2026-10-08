import { CONTENT_PAGES } from '#shared/content'

// What each dashboard user may open. Managers can do everything; every other
// user gets only the areas a manager ticks for them on the Users page. The
// server checks these on every request, the dashboard uses them to hide what
// a user can't open.

export interface AccessOption {
  key: string
  label: string
  description: string
  group: 'Service' | 'Insights' | 'Setup' | 'Website content'
  path: string
}

export const AREA_ACCESS: AccessOption[] = [
  { key: 'reservations', label: 'Reservations', description: 'Bookings, the floor view and walk-ins', group: 'Service', path: '/admin/reservations' },
  { key: 'guests', label: 'Guests', description: 'Guest profiles and visit history', group: 'Service', path: '/admin/guests' },
  { key: 'reports', label: 'Reports', description: 'Covers, bookings and trends', group: 'Insights', path: '/admin/reports' },
  { key: 'floorplan', label: 'Floorplan editor', description: 'Change sections and tables', group: 'Setup', path: '/admin/floorplan' },
  { key: 'chatbot', label: 'Website chatbot', description: 'The concierge\'s greeting and replies', group: 'Setup', path: '/admin/chatbot' },
  { key: 'emails', label: 'Email templates', description: 'Booking emails sent to guests', group: 'Setup', path: '/admin/emails' }
]

export const contentPermission = (pageKey: string) => `content:${pageKey}`

export const CONTENT_ACCESS: AccessOption[] = CONTENT_PAGES.map(page => ({
  key: contentPermission(page.key),
  label: page.label,
  description: page.description,
  group: 'Website content',
  path: `/admin/content/${page.key}`
}))

// Everything a manager can tick for another user. "users" is deliberately not
// here: managing users is what makes someone a manager.
export const ASSIGNABLE_ACCESS = [...AREA_ACCESS, ...CONTENT_ACCESS]

// What hosts could do before access was configurable, and the starting point
// for a new user.
export const DEFAULT_HOST_ACCESS = ['reservations', 'guests', 'reports']

const ASSIGNABLE_KEYS = new Set(ASSIGNABLE_ACCESS.map(a => a.key))

// "Reservations", "Home page" — permission keys in words.
export function accessLabels(keys: string[]) {
  return ASSIGNABLE_ACCESS.filter(a => keys.includes(a.key))
    .map(a => a.group === 'Website content' ? `${a.label} page` : a.label)
}

export function cleanPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && ASSIGNABLE_KEYS.has(v)))]
}

export interface AccessHolder {
  role: 'manager' | 'host'
  permissions?: string[] | null
}

export function effectivePermissions(user: AccessHolder): string[] {
  // users and logs aren't assignable: only managers have them.
  if (user.role === 'manager') return [...ASSIGNABLE_KEYS, 'users', 'logs']
  return cleanPermissions(user.permissions)
}

export const hasAny = (permissions: string[], keys: string[]) => keys.some(k => permissions.includes(k))
export const hasContentAccess = (permissions: string[]) => permissions.some(p => p.startsWith('content:'))

// The permission(s) a dashboard page needs; any one of them is enough.
// null means every signed-in user may open it.
export function accessForPath(path: string): string[] | null {
  if (path === '/admin/users' || path.startsWith('/admin/users/')) return ['users']
  if (path === '/admin/logs' || path.startsWith('/admin/logs/')) return ['logs']
  if (path === '/admin/content' || path === '/admin/content/') return CONTENT_ACCESS.map(a => a.key)
  const page = /^\/admin\/content\/([^/]+)/.exec(path)?.[1]
  if (page) return [contentPermission(page)]
  const area = AREA_ACCESS.find(a => path === a.path || path.startsWith(`${a.path}/`))
  return area ? [area.key] : null
}

// Where to send someone after signing in, or when they open a page they
// can't use: the first area they have, in sidebar order. /admin itself tells
// a user with no access to ask a manager.
export function homePathFor(permissions: string[]) {
  const area = AREA_ACCESS.find(a => permissions.includes(a.key))
  if (area) return area.path
  if (hasContentAccess(permissions)) return '/admin/content'
  return '/admin'
}
