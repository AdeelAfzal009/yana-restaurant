// Website concierge (chatbot) settings. Edited by managers in the admin
// dashboard, stored as one JSON document, and read by the public widget.
// The defaults below are what the widget shows until something is saved.

export const CONCIERGE_ACTION_TYPES = ['book', 'whatsapp', 'menu', 'maps', 'call', 'link'] as const
export type ConciergeActionType = (typeof CONCIERGE_ACTION_TYPES)[number]

export const CONCIERGE_ACTION_META: Record<ConciergeActionType, { name: string, defaultLabel: string }> = {
  book: { name: 'Book a table (reservation page)', defaultLabel: 'Book a table' },
  whatsapp: { name: 'Open WhatsApp chat', defaultLabel: 'Chat on WhatsApp' },
  menu: { name: 'Menu page', defaultLabel: 'View the menu' },
  maps: { name: 'Google Maps', defaultLabel: 'Open in Google Maps' },
  call: { name: 'Phone call', defaultLabel: 'Call us' },
  link: { name: 'Custom link', defaultLabel: 'Learn more' }
}

export interface ConciergeAction {
  type: ConciergeActionType
  label: string
  // Only used by "link": a site path like /about or a full https:// URL.
  url?: string
}

export interface ConciergeTopic {
  id: string
  enabled: boolean
  // The tap-able option the guest picks.
  label: string
  // The reply; each line becomes its own paragraph.
  reply: string
  actions: ConciergeAction[]
}

export interface ConciergeConfig {
  enabled: boolean
  name: string
  status: string
  greeting: string
  whatsappNumber: string
  whatsappMessage: string
  phone: string
  mapsUrl: string
  topics: ConciergeTopic[]
}

export const CONCIERGE_LIMITS = {
  topics: 10,
  actionsPerTopic: 3,
  label: 40,
  reply: 600,
  greeting: 300,
  short: 120,
  url: 500
}

export const DEFAULT_CONCIERGE: ConciergeConfig = {
  enabled: true,
  name: 'YANA Concierge',
  status: 'Here to help you book',
  greeting: 'Welcome to YANA ✨\nHow can we help you today?',
  whatsappNumber: '971501906122',
  whatsappMessage: 'Hi YANA, I\'d like to book a table.',
  phone: '+971 2 447 6998',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Yana+Restaurant+Al+Saadiyat+Island+Abu+Dhabi',
  topics: [
    {
      id: 'book',
      enabled: true,
      label: 'Book a table',
      reply: 'Wonderful. You can reserve online in under a minute, and we\'ll confirm by email.',
      actions: [{ type: 'book', label: 'Book a table' }, { type: 'whatsapp', label: 'Chat on WhatsApp' }]
    },
    {
      id: 'hours',
      enabled: true,
      label: 'Opening hours',
      reply: 'Sunday – Thursday: 9am – 10pm\nFriday & Saturday: 9am – midnight\nThe terrace and bar are open daily alongside the dining room.',
      actions: [{ type: 'book', label: 'Book a table' }]
    },
    {
      id: 'location',
      enabled: true,
      label: 'Location',
      reply: 'We\'re on Al Saadiyat Island, Abu Dhabi, minutes from the museums and the beach.',
      actions: [{ type: 'maps', label: 'Open in Google Maps' }, { type: 'book', label: 'Book a table' }]
    },
    {
      id: 'menu',
      enabled: true,
      label: 'See the menu',
      reply: 'A Pan-Asian kitchen with Peruvian flair: ceviches, tiraditos, sushi and the Josper grill, plus pisco and cold-pressed coolers at the bar.',
      actions: [{ type: 'menu', label: 'View the menu' }, { type: 'book', label: 'Book a table' }]
    },
    {
      id: 'events',
      enabled: true,
      label: 'Groups & events',
      reply: 'For larger groups or private occasions, message our team on WhatsApp and we\'ll take care of the details.',
      actions: [{ type: 'whatsapp', label: 'Chat on WhatsApp' }, { type: 'call', label: 'Call us' }]
    },
    {
      id: 'team',
      enabled: true,
      label: 'Talk to the team',
      reply: 'Of course. Our team replies on WhatsApp during opening hours.',
      actions: [{ type: 'whatsapp', label: 'Chat on WhatsApp' }]
    }
  ]
}

const clip = (value: unknown, max: number, fallback = '') => {
  const text = typeof value === 'string' ? value.trim() : fallback
  return text.slice(0, max)
}

// Coerces anything (a saved row, a request body) into a valid config. Unknown
// fields are dropped and missing ones fall back to the defaults, so the public
// widget can never be broken by a bad save.
export function normalizeConcierge(input: unknown): ConciergeConfig {
  const src = (input && typeof input === 'object' ? input : {}) as Partial<Record<keyof ConciergeConfig, unknown>>
  const d = DEFAULT_CONCIERGE
  const L = CONCIERGE_LIMITS

  const rawTopics = Array.isArray(src.topics) ? src.topics : d.topics
  const seen = new Set<string>()
  const topics: ConciergeTopic[] = []
  for (const raw of rawTopics.slice(0, L.topics)) {
    const t = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof ConciergeTopic, unknown>>
    const label = clip(t.label, L.label)
    const reply = clip(t.reply, L.reply)
    if (!label || !reply) continue

    let id = clip(t.id, 40).replace(/[^a-z0-9-]/gi, '').toLowerCase() || label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    while (seen.has(id)) id += '-x'
    seen.add(id)

    const actions: ConciergeAction[] = []
    for (const rawAction of (Array.isArray(t.actions) ? t.actions : []).slice(0, L.actionsPerTopic)) {
      const a = (rawAction && typeof rawAction === 'object' ? rawAction : {}) as Partial<Record<keyof ConciergeAction, unknown>>
      const type = CONCIERGE_ACTION_TYPES.includes(a.type as ConciergeActionType) ? a.type as ConciergeActionType : null
      if (!type) continue
      const actionLabel = clip(a.label, L.label) || CONCIERGE_ACTION_META[type].defaultLabel
      if (type === 'link') {
        const url = clip(a.url, L.url)
        // Only site paths and http(s) links; no javascript: or other schemes.
        if (!/^\/(?!\/)|^https?:\/\//i.test(url)) continue
        actions.push({ type, label: actionLabel, url })
      } else {
        actions.push({ type, label: actionLabel })
      }
    }

    topics.push({ id, enabled: t.enabled !== false, label, reply, actions })
  }

  const mapsUrl = clip(src.mapsUrl, L.url)
  return {
    enabled: src.enabled !== false,
    name: clip(src.name, L.label) || d.name,
    status: typeof src.status === 'string' ? clip(src.status, L.short) : d.status,
    greeting: clip(src.greeting, L.greeting) || d.greeting,
    whatsappNumber: clip(src.whatsappNumber, 20).replace(/\D/g, '') || d.whatsappNumber,
    whatsappMessage: typeof src.whatsappMessage === 'string' ? clip(src.whatsappMessage, L.short) : d.whatsappMessage,
    phone: clip(src.phone, 30) || d.phone,
    mapsUrl: /^https?:\/\//i.test(mapsUrl) ? mapsUrl : d.mapsUrl,
    topics
  }
}

export function conciergeWhatsappUrl(config: Pick<ConciergeConfig, 'whatsappNumber' | 'whatsappMessage'>) {
  const text = config.whatsappMessage ? `?text=${encodeURIComponent(config.whatsappMessage)}` : ''
  return `https://wa.me/${config.whatsappNumber}${text}`
}

export interface ResolvedConciergeAction {
  label: string
  primary: boolean
  whatsapp: boolean
  to?: string
  href?: string
}

// What a button does on the website: an in-site route (to) or an outside link (href).
export function resolveConciergeAction(action: ConciergeAction, config: ConciergeConfig): ResolvedConciergeAction {
  const base = { label: action.label, primary: action.type === 'book', whatsapp: action.type === 'whatsapp' }
  switch (action.type) {
    case 'book': return { ...base, to: '/reservation' }
    case 'menu': return { ...base, to: '/menu' }
    case 'whatsapp': return { ...base, href: conciergeWhatsappUrl(config) }
    case 'maps': return { ...base, href: config.mapsUrl }
    case 'call': return { ...base, href: `tel:${config.phone.replace(/[^\d+]/g, '')}` }
    case 'link': return action.url?.startsWith('/') ? { ...base, to: action.url } : { ...base, href: action.url }
  }
}
