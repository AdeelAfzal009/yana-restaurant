import type { ContentPage } from './schema'

// Details shown in several places at once (header, footer, Reach Us page and
// the home page's Visit block), so they're edited once here.

export interface SiteInfo {
  contact: {
    phone: string
    mobile: string
    whatsapp: string
    email: string
    address: string
    mapsUrl: string
  }
  hours: {
    rows: { days: string, hours: string }[]
  }
  social: {
    instagramUrl: string
    instagramHandle: string
    linkedinUrl: string
  }
}

const defaults: SiteInfo = {
  contact: {
    phone: '+971 2 447 6998',
    mobile: '+971 50 190 6122',
    whatsapp: '+971 50 190 6122',
    email: 'info@yanarestaurants.com',
    address: 'Al Saadiyat Island,\nAbu Dhabi, UAE',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Yana+Restaurant+Al+Saadiyat+Island+Abu+Dhabi'
  },
  hours: {
    rows: [
      { days: 'Sunday – Thursday', hours: '9am – 10pm' },
      { days: 'Friday & Saturday', hours: '9am – midnight' }
    ]
  },
  social: {
    instagramUrl: 'https://www.instagram.com/yanarestaurants/',
    instagramHandle: '@yanarestaurants',
    linkedinUrl: 'https://www.linkedin.com/company/yana-restaurants'
  }
}

export const SITE_PAGE: ContentPage = {
  key: 'site',
  label: 'Site info',
  description: 'Phone numbers, email, address, opening hours and social links. Used in the header, footer, Reach Us page and home page.',
  sections: [
    {
      id: 'contact',
      label: 'Contact details',
      fields: [
        { key: 'phone', type: 'text', label: 'Phone', required: true, max: 30, placeholder: '+971 2 447 6998' },
        { key: 'mobile', type: 'text', label: 'Mobile', max: 30, hint: 'Leave empty to hide it.' },
        { key: 'whatsapp', type: 'text', label: 'WhatsApp number', required: true, max: 30, hint: 'With country code, e.g. +971 50 190 6122. The WhatsApp buttons open a chat with this number.' },
        { key: 'email', type: 'text', label: 'Email', required: true, max: 120 },
        { key: 'address', type: 'textarea', label: 'Address', required: true, max: 200, rows: 2, hint: 'Each line shows on its own line in the footer.' },
        { key: 'mapsUrl', type: 'url', label: 'Google Maps link', required: true, hint: 'Where the address and map buttons go.' }
      ],
      defaults: defaults.contact
    },
    {
      id: 'hours',
      label: 'Opening hours',
      fields: [
        {
          key: 'rows',
          type: 'list',
          label: 'Days and times',
          itemLabel: 'Row',
          titleKey: 'days',
          max: 7,
          required: true,
          fields: [
            { key: 'days', type: 'text', label: 'Days', required: true, max: 40, placeholder: 'Sunday – Thursday' },
            { key: 'hours', type: 'text', label: 'Hours', required: true, max: 40, placeholder: '9am – 10pm' }
          ]
        }
      ],
      defaults: defaults.hours
    },
    {
      id: 'social',
      label: 'Social media',
      description: 'Leave a link empty to hide that icon.',
      fields: [
        { key: 'instagramUrl', type: 'url', label: 'Instagram link' },
        { key: 'instagramHandle', type: 'text', label: 'Instagram name', max: 40, placeholder: '@yanarestaurants' },
        { key: 'linkedinUrl', type: 'url', label: 'LinkedIn link' }
      ],
      defaults: defaults.social
    }
  ]
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}`
}

export function addressLines(address: string) {
  return address.split('\n').map(l => l.trim()).filter(Boolean)
}
