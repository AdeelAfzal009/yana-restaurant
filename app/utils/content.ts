// Turning text typed in the dashboard into the website's HTML. Everything is
// escaped first, so only the formatting below can ever come through:
// a new line becomes a line break and **words** become <strong> (which the
// site shows at the same light weight, so older text keeps no stray stars).

import { BRAND_COLOURS } from '#shared/content/fields'

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }

export function richText(text: string | null | undefined) {
  return (text ?? '')
    .trim()
    .replace(/[&<>"']/g, c => ESCAPES[c]!)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// Paragraphs are separated by an empty line.
export function paragraphs(text: string | null | undefined) {
  return (text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}

// Fills {placeholders} such as {name} or {year}.
export function fillTemplate(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => key in values ? String(values[key]) : match)
}

// Background colour chosen in the dashboard for a section or banner;
// "default" keeps the colours set in the page's CSS.
export function sectionBackground(colour?: string | null) {
  const brand = colour ? BRAND_COLOURS[colour] : undefined
  return brand ? { background: brand.hex } : undefined
}

// "tone-light" switches a dark section's text to dark colours (see main.css)
// when a light colour is chosen. Not when a photo covers the colour.
export function sectionTone(colour?: string | null, coveredByImage = false) {
  const brand = colour ? BRAND_COLOURS[colour] : undefined
  return { 'tone-light': !!brand?.light && !coveredByImage }
}

// A CSS background for an image address from the dashboard. Quotes, brackets
// and backslashes are encoded so an address can't break out of url(…).
export function bg(src: string | null | undefined) {
  if (!src) return undefined
  const safe = src.replace(/['"()\\\s]/g, c => `%${c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()}`)
  return { backgroundImage: `url('${safe}')` }
}
