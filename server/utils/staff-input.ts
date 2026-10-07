import { and, eq, ne } from 'drizzle-orm'
import { staff, staffRoleEnum } from '../database/schema'
import { useDb } from './db'
import { badRequest, EMAIL_RE } from './validate'

export const MIN_PASSWORD_LENGTH = 12

// Fields safe to send to the browser (never the password hash).
export const staffPublicColumns = {
  id: staff.id,
  name: staff.name,
  email: staff.email,
  role: staff.role,
  active: staff.active,
  mustChangePassword: staff.mustChangePassword,
  createdAt: staff.createdAt,
  lastLoginAt: staff.lastLoginAt
}

export function cleanName(value: unknown) {
  const name = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  if (!name) badRequest('Name is required')
  if (name.length > 80) badRequest('Name is too long')
  return name
}

export function cleanEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) badRequest('Enter a valid email address')
  return email
}

export function cleanRole(value: unknown) {
  if (!staffRoleEnum.enumValues.includes(value as never)) badRequest('Role must be manager or host')
  return value as (typeof staffRoleEnum.enumValues)[number]
}

export function checkPassword(value: unknown) {
  if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
    badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }
  if (value.length > 200) badRequest('Password is too long')
  return value
}

export async function assertEmailFree(email: string, exceptId?: number) {
  const where = exceptId ? and(eq(staff.email, email), ne(staff.id, exceptId)) : eq(staff.email, email)
  const [taken] = await useDb().select({ id: staff.id }).from(staff).where(where).limit(1)
  if (taken) badRequest('Another user already has this email address')
}
