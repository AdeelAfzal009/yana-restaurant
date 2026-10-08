import { background, body, button, eyebrow, img, link, seoFields } from './fields'
import type { ContentPage } from './schema'

export const MAP_EMBED_PREFIX = 'https://www.google.com/maps/embed'

const defaults = {
  banner: {
    image: img('/images/yana-pattern-tall.png'),
    eyebrow: 'Al Saadiyat Island · Abu Dhabi',
    title: 'Reach Us'
  },
  form: {
    eyebrow: 'Get in touch',
    title: 'Let\'s Talk',
    body: 'If you have questions Please write us a message',
    submit: 'Send Message',
    thanks: 'Thank you — we will be in touch shortly.',
    infoLabel: 'Contact info',
    hoursLabel: 'Opening Hours'
  },
  map: {
    visible: true,
    embedUrl: 'https://www.google.com/maps/embed?origin=mfe&pb=!1m4!2m1!1s24.56190282214312,+54.45993442883627!5e0!6i18'
  },
  cta: {
    visible: true,
    image: img('/images/yana-image-4-mrt9r8ad-uvfn.webp'),
    eyebrow: 'Reservations',
    title: 'Visit Yana Restaurant',
    button: link('Reserve Now', '/reservation')
  },
  seo: {
    title: 'Reach Us · YANA Restaurant',
    description: 'Address, phone, WhatsApp and opening hours for YANA on Al Saadiyat Island, Abu Dhabi.'
  }
}

export type ContactContent = typeof defaults

export const CONTACT_PAGE: ContentPage = {
  key: 'contact',
  label: 'Reach Us',
  description: 'The contact page. Phone numbers, email, address and hours come from Site info.',
  path: '/contact',
  sections: [
    {
      id: 'banner',
      label: 'Banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 60 }],
      defaults: defaults.banner
    },
    {
      id: 'form',
      label: 'Message form',
      fields: [
        eyebrow(),
        { key: 'title', type: 'text', label: 'Title', required: true, max: 60 },
        body('Text', 2),
        { key: 'submit', type: 'text', label: 'Send button text', required: true, max: 30 },
        { key: 'thanks', type: 'text', label: 'Message after sending', required: true, max: 160 },
        { key: 'infoLabel', type: 'text', label: 'Contact details heading', max: 40 },
        { key: 'hoursLabel', type: 'text', label: 'Opening hours heading', max: 40 }
      ],
      defaults: defaults.form
    },
    {
      id: 'map',
      label: 'Map',
      fields: [{
        key: 'embedUrl',
        type: 'url',
        label: 'Google Maps embed link',
        required: true,
        startsWith: MAP_EMBED_PREFIX,
        hint: 'In Google Maps: Share › Embed a map › copy only the link inside src="…". It starts with https://www.google.com/maps/embed'
      }],
      defaults: defaults.map
    },
    {
      id: 'cta',
      label: 'Reservation banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 80 }, button()],
      defaults: defaults.cta
    },
    {
      id: 'seo',
      label: 'Search & sharing',
      description: 'How the page appears in Google and when the link is shared.',
      fields: seoFields(),
      defaults: defaults.seo
    }
  ]
}
