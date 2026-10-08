import type { ContentField } from './schema'

// The fields most sections share, so every page words them the same way in
// the dashboard.

export const TEXT_HINT = 'Leave an empty line between paragraphs. Put **double stars** around words to make them bold.'

export const eyebrow = (label = 'Small heading'): ContentField =>
  ({ key: 'eyebrow', type: 'text', label, max: 80, hint: 'The short line above the title. Leave empty to hide it.' })

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

export const ghostWord = (): ContentField =>
  ({ key: 'ghost', type: 'text', label: 'Large background word', max: 20, hint: 'The faint oversized word behind the section. Leave empty to hide it.' })

export const seoFields = (): ContentField[] => [
  { key: 'title', type: 'text', label: 'Page title', required: true, max: 70, hint: 'Shown in the browser tab and as the headline in Google results. Around 50–60 characters works best.' },
  { key: 'description', type: 'textarea', label: 'Description', rows: 3, max: 300, hint: 'The short summary under the title in Google and when the link is shared. Around 150 characters works best.' }
]

export const link = (label: string, url: string, newTab = false) => ({ label, url, newTab })
export const img = (src: string, alt = '') => ({ src, alt })
