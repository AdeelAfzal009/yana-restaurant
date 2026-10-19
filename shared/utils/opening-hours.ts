// Turns the opening hours as written in the dashboard ("Sunday – Thursday",
// "12pm – 12am") into the form search engines read (schema.org
// OpeningHoursSpecification). Rows it can't read are left out rather than
// guessed.

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dayIndex(word: string) {
  const w = word.trim().toLowerCase().slice(0, 3)
  return DAYS.findIndex(d => d.toLowerCase().startsWith(w))
}

// "Sunday – Thursday" → Sun..Thu; "Friday & Saturday" → Fri, Sat; "Daily" → all.
export function parseDays(text: string): string[] | null {
  const t = text.trim().toLowerCase()
  if (/^(daily|every ?day|7 days)/.test(t)) return [...DAYS]
  const days = new Set<string>()
  for (const part of text.split(/\s*(?:&|,|\band\b)\s*/i)) {
    const range = part.split(/\s*(?:–|—|-|\bto\b)\s*/i).filter(Boolean)
    if (range.length === 1) {
      const i = dayIndex(range[0]!)
      if (i < 0) return null
      days.add(DAYS[i]!)
    } else if (range.length === 2) {
      const from = dayIndex(range[0]!)
      const to = dayIndex(range[1]!)
      if (from < 0 || to < 0) return null
      for (let i = from; ; i = (i + 1) % 7) {
        days.add(DAYS[i]!)
        if (i === to) break
      }
    } else return null
  }
  return days.size ? DAYS.filter(d => days.has(d)) : null
}

// "12pm" → "12:00", "1:30am" → "01:30", "midnight" → "00:00", "noon" → "12:00".
function parseTime(text: string): string | null {
  const t = text.trim().toLowerCase()
  if (t === 'midnight') return '00:00'
  if (t === 'noon' || t === 'midday') return '12:00'
  const m = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/.exec(t)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2] ?? 0)
  if (m[3] === 'pm' && h < 12) h += 12
  if (m[3] === 'am' && h === 12) h = 0
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// "12pm – 12am" → { opens: "12:00", closes: "00:00" }. A closing time earlier
// than the opening time means after midnight, which schema.org allows.
export function parseHours(text: string) {
  const parts = text.split(/\s*(?:–|—|-|\bto\b)\s*/i).filter(Boolean)
  if (parts.length !== 2) return null
  const opens = parseTime(parts[0]!)
  const closes = parseTime(parts[1]!)
  return opens && closes ? { opens, closes } : null
}

export function openingHoursSpecification(rows: { days: string, hours: string }[]) {
  return rows.flatMap((row) => {
    const days = parseDays(row.days)
    const hours = parseHours(row.hours)
    return days && hours ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, ...hours }] : []
  })
}
