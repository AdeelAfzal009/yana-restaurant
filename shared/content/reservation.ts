import { background, eyebrow, img, seoFields } from './fields'
import type { ContentPage } from './schema'

const defaults = {
  banner: {
    image: img('/images/yana-pattern-tall.png'),
    eyebrow: 'Al Saadiyat Island · Abu Dhabi',
    title: 'Reserve a Table'
  },
  booking: {
    cardTitle: 'YANA Restaurant',
    detailsPrompt: 'Please confirm your details so we can contact you regarding your booking',
    terms: 'By placing your reservation, you agree that your information will be subject to our Terms & Conditions and Privacy Policy.',
    confirmation: 'Dear {name}, your reservation is confirmed. Thank you for booking with us.'
  },
  seo: {
    title: 'Reserve a Table · YANA Restaurant',
    description: 'Book a table at YANA on Al Saadiyat Island, Abu Dhabi. Instant online reservations.'
  }
}

export type ReservationContent = typeof defaults

export const RESERVATION_PAGE: ContentPage = {
  key: 'reservation',
  label: 'Reservation',
  description: 'The wording around the booking form. Dates, times and party sizes are set by the booking rules, not here.',
  path: '/reservation',
  sections: [
    {
      id: 'banner',
      label: 'Banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 60 }],
      defaults: defaults.banner
    },
    {
      id: 'booking',
      label: 'Booking form wording',
      fields: [
        { key: 'cardTitle', type: 'text', label: 'Heading on the booking card', required: true, max: 60 },
        { key: 'detailsPrompt', type: 'text', label: 'Above the guest details', max: 200 },
        { key: 'terms', type: 'textarea', label: 'Terms checkbox text', required: true, rows: 2, max: 400 },
        { key: 'confirmation', type: 'textarea', label: 'Confirmation message', required: true, rows: 2, max: 400, hint: '{name} is replaced with the guest\'s first name.' }
      ],
      defaults: defaults.booking
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
