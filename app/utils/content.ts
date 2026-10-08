// Turning text typed in the dashboard into the website's HTML. Everything is
// escaped first, so only the formatting below can ever come through:
// a new line becomes a line break and **words** become bold.

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
