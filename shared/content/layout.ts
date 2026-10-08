import type { ContentPage } from './schema'

// Wording in the parts every page shares: the top bar, the slide-out menu,
// the footer and the scrolling words band.

const defaults = {
  header: {
    bookLabel: 'Book A Table',
    locationArea: 'Saadiyat Island',
    locationCity: 'Abu Dhabi'
  },
  menu: {
    reserveLabel: 'Reserve a Table'
  },
  footer: {
    tagline: 'Pan-Asian Fusion, Peruvian Flair — on Al Saadiyat Island.',
    copyright: 'Copyright © {year} Yana Restaurant',
    bottomLine: 'Al Saadiyat Island · Abu Dhabi'
  },
  marquee: {
    visible: true,
    words: ['Ceviche', 'Nikkei', 'Josper Grill', 'Anticuchos', 'Pisco Lounge', 'Tiradito', 'Wagyu'].map(word => ({ word }))
  }
}

export type LayoutContent = typeof defaults

export const LAYOUT_PAGE: ContentPage = {
  key: 'layout',
  label: 'Header & footer',
  description: 'The top bar, the slide-out menu, the footer and the scrolling words band. Shown on every page.',
  sections: [
    {
      id: 'header',
      label: 'Top bar',
      fields: [
        { key: 'bookLabel', type: 'text', label: 'Booking button', required: true, max: 24 },
        { key: 'locationArea', type: 'text', label: 'Location (area)', max: 40, hint: 'Hidden on phones to save space.' },
        { key: 'locationCity', type: 'text', label: 'Location (city)', max: 40 }
      ],
      defaults: defaults.header
    },
    {
      id: 'menu',
      label: 'Slide-out menu',
      fields: [{ key: 'reserveLabel', type: 'text', label: 'Booking button', required: true, max: 30 }],
      defaults: defaults.menu
    },
    {
      id: 'footer',
      label: 'Footer',
      description: 'Phone, email, address and social icons come from Site info.',
      fields: [
        { key: 'tagline', type: 'text', label: 'Tagline under the logo', max: 120 },
        { key: 'copyright', type: 'text', label: 'Copyright line', max: 80, hint: '{year} is replaced with the current year.' },
        { key: 'bottomLine', type: 'text', label: 'Bottom right line', max: 80 }
      ],
      defaults: defaults.footer
    },
    {
      id: 'marquee',
      label: 'Scrolling words',
      description: 'The large gold words that scroll across the Home and Menu pages.',
      fields: [{
        key: 'words',
        type: 'list',
        label: 'Words',
        itemLabel: 'Word',
        titleKey: 'word',
        max: 20,
        required: true,
        fields: [{ key: 'word', type: 'text', label: 'Word', required: true, max: 30 }]
      }],
      defaults: defaults.marquee
    }
  ]
}
