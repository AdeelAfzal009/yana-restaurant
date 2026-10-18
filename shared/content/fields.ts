import type { ContentField } from './schema'

// The fields most sections share, so every page words them the same way in
// the dashboard.

export const TEXT_HINT = 'Leave an empty line between paragraphs.'

// The short line above a title ("02 — Pisco Bar"): a switch to show or hide
// it, and its text.
export const eyebrow = (label = 'Small heading'): ContentField[] => [
  { key: 'showEyebrow', type: 'toggle', label: `Show ${label.toLowerCase()}`, hint: 'The short line above the title.' },
  { key: 'eyebrow', type: 'text', label, max: 80 }
]

export const title = (label = 'Title'): ContentField =>
  ({ key: 'title', type: 'textarea', label, required: true, rows: 2, max: 160, hint: 'Press Enter to start a new line.' })

export const subtitle = (label = 'Subtitle'): ContentField =>
  ({ key: 'subtitle', type: 'text', label, max: 160 })

export const body = (label = 'Text', rows = 6): ContentField =>
  ({ key: 'body', type: 'textarea', label, rows, max: 2000, hint: TEXT_HINT })

export const button = (key = 'button', label = 'Button', pdf = false): ContentField =>
  ({ key, type: 'link', label, pdf, hint: 'Leave the button text empty to hide it. Start the link with / for a page on this site (e.g. /reservation), or https:// for another website.' })

export const image = (key = 'image', label = 'Photo', required = true): ContentField =>
  ({ key, type: 'image', label, required })

export const background = (key = 'image', label = 'Background image'): ContentField =>
  ({ key, type: 'image', label, decorative: true, required: true, hint: 'Sits behind the text, so pick a calm photo or pattern.' })

// The faint oversized word behind a section ("PISCO BAR"): a switch to show
// or hide it, and its text.
export const ghostFields = (): ContentField[] => [
  { key: 'showGhost', type: 'toggle', label: 'Show large background word', hint: 'The faint oversized word behind the section.' },
  { key: 'ghost', type: 'text', label: 'Large background word', max: 20 }
]

// Background colours offered wherever a section's colour can be changed.
// Light ones switch the section's text to dark colours; dark ones keep it light.
export const BRAND_COLOURS: Record<string, { label: string, hex: string, light: boolean }> = {
  dark: { label: 'YANA Dark', hex: '#0F1E2E', light: false },
  blue: { label: 'YANA Blue', hex: '#12426D', light: false },
  darkGold: { label: 'YANA Dark Gold', hex: '#8A6B45', light: false },
  light: { label: 'YANA Light', hex: '#F3ECE1', light: true },
  lightGold: { label: 'YANA Light Gold', hex: '#D9B690', light: true }
}

const brandOptions = () => Object.entries(BRAND_COLOURS).map(([value, c]) => ({ value, label: c.label }))

// Background of dark sections and page banners: the pattern/photo on or off,
// and the colour behind it.
export const BACKGROUND_COLOURS = [
  { value: 'default', label: 'Original (blue to navy)' },
  ...brandOptions()
]

const COLOUR_HINT = 'YANA Light and YANA Light Gold switch the text to dark; the others keep it light.'

// For navy sections without a pattern: just the colour.
export const navyColourField = (): ContentField => ({
  key: 'bgColor',
  type: 'select',
  label: 'Background colour',
  options: brandOptions(),
  hint: COLOUR_HINT
})

export const backdropFields = (what = 'background pattern'): ContentField[] => [
  { key: 'showBgImage', type: 'toggle', label: `Show ${what}` },
  {
    key: 'bgColor',
    type: 'select',
    label: 'Background colour',
    options: BACKGROUND_COLOURS,
    hint: what === 'background image'
      ? `Shown when the background image is off. ${COLOUR_HINT}`
      : `The colour behind the section. Original keeps the designed blend. ${COLOUR_HINT}`
  }
]

export const seoFields = (): ContentField[] => [
  { key: 'title', type: 'text', label: 'Page title', required: true, max: 70, hint: 'Shown in the browser tab and as the headline in Google results. Around 50–60 characters works best.' },
  { key: 'description', type: 'textarea', label: 'Description', rows: 3, max: 300, hint: 'The short summary under the title in Google and when the link is shared. Around 150 characters works best.' }
]

export const link = (label: string, url: string, newTab = false) => ({ label, url, newTab })
export const img = (src: string, alt = '') => ({ src, alt })
