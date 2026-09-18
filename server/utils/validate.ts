export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^\d{2}:\d{2}$/

export function badRequest(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

export function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) badRequest('Tags must be a list')
  return [...new Set(value.map(v => String(v).trim()).filter(Boolean))].slice(0, 20)
}

export function optionalText(value: unknown) {
  if (value === undefined) return undefined
  if (value === null) return null
  const text = String(value).trim()
  return text || null
}
