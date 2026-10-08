import { background, body, button, eyebrow, image, img, link, seoFields, title } from './fields'
import type { ContentPage } from './schema'

const defaults = {
  banner: {
    image: img('/images/yana-image-4-mrt9n45r-v3w7.webp'),
    eyebrow: 'About Yana',
    title: 'About us'
  },
  standard: {
    visible: true,
    eyebrow: 'About Yana',
    title: 'A New Standard of Dining in Saadiyat',
    body: [
      'YANA is a contemporary dining destination inspired by the vibrant fusion of **Asian and Latin flavors**, crafted for those who appreciate refined taste and warm hospitality. Located on Saadiyat Island, YANA blends modern elegance with a welcoming atmosphere, offering dishes that are bold in flavor, beautifully presented, and made to be remembered.',
      'From the kitchen to the table, every detail at YANA reflects our passion for creativity, quality, and exceptional service. Whether you\'re joining us for a casual meal or a special gathering, our goal is to make every visit feel unique, effortless, and unforgettable.'
    ].join('\n\n'),
    image: img('/images/yana-side-image-mrt8vz5a-90ny.webp', 'The YANA dining room')
  },
  founder: {
    visible: true,
    eyebrow: 'Our Founder',
    title: 'Message from the Founder',
    portraitA: img(''),
    portraitB: img(''),
    quote: 'Every plate that leaves our kitchen should feel like an occasion — that is the standard we hold ourselves to.',
    attribution: 'Founder, YANA Restaurant'
  },
  pillars: {
    visible: true,
    items: [
      { title: 'Mission', copy: 'At YANA, our mission is to create refined dining experiences that blend bold flavors, thoughtful craftsmanship, and warm hospitality—bringing together Pan-Asian precision with Peruvian.' },
      { title: 'Vision', copy: 'To become a leading destination for contemporary fusion dining in Abu Dhabi, where cuisine, atmosphere, and culture meet to create memorable moments beyond the table.' },
      { title: 'Core', copy: 'We believe in quality without compromise, creativity with purpose, and consistency in experience. Every dish, interaction, and space is guided by authenticity, and elegance.' }
    ]
  },
  experience: {
    visible: true,
    image: img(''),
    eyebrow: 'Experience',
    title: 'Refined Dining, Elevated Atmosphere',
    body: [
      'At YANA, we\'ve created a dining experience where flavor, design, and comfort come together seamlessly. From our curated menu to the ambiance and service, everything is designed to celebrate good food and good moments.',
      'Our chefs merge culinary craftsmanship with global inspiration, while our service team ensures every guest feels welcomed and valued. Whether it\'s a relaxed lunch or an elegant dinner, YANA offers the perfect setting for every occasion.'
    ].join('\n\n'),
    stats: [
      { number: '40+', label: 'Signature Dishes' },
      { number: '120+', label: 'Seating Capacity' }
    ]
  },
  cta: {
    visible: true,
    image: img('/images/yana-image-2-mrt9pbly-db2c.webp'),
    eyebrow: 'Reservations',
    title: 'Visit Yana Restaurant',
    button: link('Reserve Now', '/reservation')
  },
  seo: {
    title: 'About · YANA Restaurant',
    description: 'The story behind YANA, a Pan-Asian kitchen with Peruvian flair on Al Saadiyat Island, Abu Dhabi.'
  }
}

export type AboutContent = typeof defaults

export const ABOUT_PAGE: ContentPage = {
  key: 'about',
  label: 'About',
  description: 'The story, the founder\'s message, mission and vision.',
  path: '/about',
  sections: [
    {
      id: 'banner',
      label: 'Banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 60 }],
      defaults: defaults.banner
    },
    {
      id: 'standard',
      label: 'A New Standard',
      fields: [eyebrow(), title(), body(), image()],
      defaults: defaults.standard
    },
    {
      id: 'founder',
      label: 'Founder',
      description: 'Until portraits are added, grey placeholders are shown.',
      fields: [
        eyebrow(), title(),
        image('portraitA', 'Portrait (large)', false),
        image('portraitB', 'Portrait (small)', false),
        { key: 'quote', type: 'textarea', label: 'Quote', required: true, rows: 3, max: 400 },
        { key: 'attribution', type: 'text', label: 'Signed by', max: 80 }
      ],
      defaults: defaults.founder
    },
    {
      id: 'pillars',
      label: 'Mission, Vision & Core',
      fields: [{
        key: 'items',
        type: 'list',
        label: 'Columns',
        itemLabel: 'Column',
        titleKey: 'title',
        max: 4,
        required: true,
        fields: [
          { key: 'title', type: 'text', label: 'Heading', required: true, max: 40 },
          { key: 'copy', type: 'textarea', label: 'Text', required: true, rows: 4, max: 500 }
        ]
      }],
      defaults: defaults.pillars
    },
    {
      id: 'experience',
      label: 'Experience',
      fields: [
        { ...image('image', 'Photo', false), hint: 'Until a photo is added, a grey placeholder is shown.' },
        eyebrow(), title(), body(),
        {
          key: 'stats',
          type: 'list',
          label: 'Figures',
          itemLabel: 'Figure',
          titleKey: 'label',
          max: 4,
          fields: [
            { key: 'number', type: 'text', label: 'Number', required: true, max: 12, placeholder: '40+' },
            { key: 'label', type: 'text', label: 'Label', required: true, max: 40, placeholder: 'Signature Dishes' }
          ]
        }
      ],
      defaults: defaults.experience
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
