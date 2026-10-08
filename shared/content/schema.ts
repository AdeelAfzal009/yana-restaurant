// Building blocks for the editable website content (the CMS). Each page lists
// its sections and each section its fields. The dashboard builds its forms from
// these descriptions, and the server uses the same ones to validate and clean
// whatever is saved, so the public site can never be broken by a bad save.

export interface ImageValue {
  src: string
  alt: string
}

export interface LinkValue {
  label: string
  url: string
  newTab: boolean
}

interface BaseField {
  key: string
  label: string
  hint?: string
  required?: boolean
}

export type ContentField =
  | BaseField & { type: 'text', max?: number, placeholder?: string }
  | BaseField & { type: 'textarea', max?: number, rows?: number, placeholder?: string }
  // pdf: also offer "Choose a PDF" from the media library.
  | BaseField & { type: 'url', placeholder?: string, pdf?: boolean, startsWith?: string }
  // decorative: a background with no meaning of its own, so no description is asked for.
  | BaseField & { type: 'image', decorative?: boolean }
  | BaseField & { type: 'link', pdf?: boolean }
  | BaseField & { type: 'toggle' }
  | BaseField & { type: 'select', options: { value: string, label: string }[] }
  // A repeating group, e.g. carousel photos or opening-hours rows. titleKey
  // names the item field shown as each row's heading in the dashboard.
  | BaseField & { type: 'list', itemLabel: string, titleKey?: string, max: number, fields: ContentField[] }

export interface ContentSection {
  id: string
  label: string
  description?: string
  fields: ContentField[]
  // The original content. A `visible: true` here gives the section a
  // "Shown on website" switch in the dashboard.
  defaults: Record<string, unknown>
}

export const isHideable = (section: ContentSection) => 'visible' in section.defaults

export interface ContentPage {
  key: string
  label: string
  description: string
  // Public page to open from the dashboard, if the content belongs to one.
  path?: string
  sections: ContentSection[]
}

export const TEXT_MAX = 200
export const TEXTAREA_MAX = 2000
const URL_MAX = 1000
const ALT_MAX = 200
const LINK_LABEL_MAX = 60

// Site paths, in-page anchors, web links, email and phone. Nothing else, so a
// saved link can never be a javascript: URL.
export function isSafeUrl(url: string) {
  return /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(url)
}

// Images may only come from the site itself or an https address.
function isSafeImage(src: string) {
  return /^(\/(?!\/)|https:\/\/)/i.test(src)
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

const clip = (v: unknown, max: number, fallback: string) => typeof v === 'string' ? v.trim().slice(0, max) : fallback

export function emptyValue(field: ContentField): unknown {
  switch (field.type) {
    case 'image': return { src: '', alt: '' }
    case 'link': return { label: '', url: '', newTab: false }
    case 'toggle': return false
    case 'select': return field.options[0]?.value ?? ''
    case 'list': return []
    default: return ''
  }
}

export function emptyItem(fields: ContentField[]) {
  return Object.fromEntries(fields.map(f => [f.key, emptyValue(f)]))
}

function normalizeField(field: ContentField, value: unknown, fallback: unknown): unknown {
  const d = fallback ?? emptyValue(field)
  switch (field.type) {
    case 'text': return clip(value, field.max ?? TEXT_MAX, d as string)
    case 'textarea': return clip(value, field.max ?? TEXTAREA_MAX, d as string)
    case 'url': {
      if (typeof value !== 'string') return d
      const url = value.trim().slice(0, URL_MAX)
      return !url || isSafeUrl(url) ? url : d
    }
    case 'image': {
      if (!isObject(value)) return d
      const src = clip(value.src, URL_MAX, '')
      return { src: !src || isSafeImage(src) ? src : '', alt: clip(value.alt, ALT_MAX, '') }
    }
    case 'link': {
      if (!isObject(value)) return d
      const url = clip(value.url, URL_MAX, '')
      return { label: clip(value.label, LINK_LABEL_MAX, ''), url: !url || isSafeUrl(url) ? url : '', newTab: value.newTab === true }
    }
    case 'toggle': return typeof value === 'boolean' ? value : d
    case 'select': return field.options.some(o => o.value === value) ? value : d
    case 'list': {
      if (!Array.isArray(value)) return d
      return value.slice(0, field.max).map(item => normalizeFields(field.fields, item, {}))
    }
  }
}

// Coerces anything (a saved row, a request body) into the shape the fields
// describe. Unknown keys are dropped; missing ones fall back to the defaults.
export function normalizeFields(fields: ContentField[], input: unknown, defaults: Record<string, unknown>) {
  const src = isObject(input) ? input : {}
  return Object.fromEntries(fields.map(f => [f.key, normalizeField(f, src[f.key], defaults[f.key])]))
}

export function sectionDefaults(section: ContentSection) {
  return structuredClone(section.defaults)
}

export function normalizeSection(section: ContentSection, input: unknown) {
  const value = normalizeFields(section.fields, input, section.defaults)
  if (isHideable(section)) value.visible = isObject(input) ? input.visible !== false : true
  return value
}

export function pageDefaults(page: ContentPage) {
  return Object.fromEntries(page.sections.map(s => [s.id, sectionDefaults(s)]))
}

function isEmpty(field: ContentField, value: unknown) {
  if (field.type === 'image') return !(value as ImageValue)?.src
  if (field.type === 'link') return !(value as LinkValue)?.label || !(value as LinkValue)?.url
  if (field.type === 'list') return !Array.isArray(value) || !value.length
  if (field.type === 'toggle' || field.type === 'select') return false
  return typeof value !== 'string' || !value.trim()
}

// The first problem with what was entered, worded for the person editing, or
// '' if it can be saved. Runs in the dashboard before saving and again on the server.
export function validateFields(fields: ContentField[], value: unknown, prefix = ''): string {
  const src = isObject(value) ? value : {}
  for (const field of fields) {
    const v = src[field.key]
    const name = `${prefix}${field.label}`
    if (field.required && isEmpty(field, v)) return `${name} can't be empty.`

    if (field.type === 'url' && typeof v === 'string' && v.trim()) {
      if (!isSafeUrl(v.trim())) return `${name} must start with /, https://, mailto: or tel:`
      if (field.startsWith && !v.trim().startsWith(field.startsWith)) return `${name} must start with ${field.startsWith}`
    }
    if (field.type === 'link' && isObject(v)) {
      const url = typeof v.url === 'string' ? v.url.trim() : ''
      if (url && !isSafeUrl(url)) return `${name}: the link must start with /, https://, mailto: or tel:`
    }
    if (field.type === 'image' && isObject(v)) {
      const src = typeof v.src === 'string' ? v.src.trim() : ''
      if (src && !isSafeImage(src)) return `${name}: choose an image from the library.`
      if (src && !field.decorative && !String(v.alt ?? '').trim()) return `${name} needs a short description (alt text) for screen readers and Google.`
    }
    if (field.type === 'list' && Array.isArray(v)) {
      if (v.length > field.max) return `${name}: up to ${field.max} ${field.itemLabel.toLowerCase()}s.`
      for (const [i, item] of v.entries()) {
        const problem = validateFields(field.fields, item, `${name} › ${field.itemLabel} ${i + 1} › `)
        if (problem) return problem
      }
    }
  }
  return ''
}

export function validateSection(section: ContentSection, value: unknown) {
  return validateFields(section.fields, value, `${section.label} › `)
}
