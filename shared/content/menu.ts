import { background, body, button, eyebrow, image, img, link, seoFields, subtitle } from './fields'
import type { ContentPage } from './schema'

const DIGITAL_MENU = 'https://qr.mydigimenu.com/e4f76cdf-d1f1-404e-94b9-7c105e902fa4/menu-page?menuID='

// The drawn marks a menu tile can use (the drawings live in the page).
export const MENU_TILE_ICONS = [
  { value: 'plate', label: 'Plate' },
  { value: 'sunrise', label: 'Sunrise (breakfast)' },
  { value: 'coupe', label: 'Cocktail glass' },
  { value: 'cup', label: 'Coffee cup' },
  { value: 'highball', label: 'Tall glass' },
  { value: 'dessert', label: 'Dessert' }
]

const defaults = {
  banner: {
    image: img('/images/yana-pattern-wide.jpeg'),
    eyebrow: 'Al Saadiyat Island · Abu Dhabi',
    title: 'Menu',
    subtitle: 'Pan-Asian Fusion, Peruvian Flair'
  },
  tiles: {
    visible: true,
    heading: 'Our Menus',
    items: [
      { icon: 'plate', label: 'À la Carte', desc: 'Ceviches, tiraditos and the Josper grill', url: `${DIGITAL_MENU}62881` },
      { icon: 'sunrise', label: 'Breakfast', desc: 'From 9am, every morning', url: `${DIGITAL_MENU}60876` },
      { icon: 'coupe', label: 'Drinks', desc: 'Pisco, signatures and the full bar', url: `${DIGITAL_MENU}56458` },
      { icon: 'cup', label: 'Coffee & Tea', desc: 'Espresso, matcha and loose leaf', url: `${DIGITAL_MENU}56501` },
      { icon: 'highball', label: 'Mocktails & Coolers', desc: 'Juices, mojitos and coolers', url: `${DIGITAL_MENU}61626` },
      { icon: 'dessert', label: 'Desserts', desc: 'Mochi, cheesecake and quinoa textures', url: `${DIGITAL_MENU}62881` }
    ]
  },
  food: {
    visible: true,
    title: 'Food',
    body: [
      'YANA welcomes guests with a menu built on fire, citrus and restraint — the citrus-bright kitchens of coastal Peru meeting the quiet precision of Pan-Asian cooking.',
      'Ceviches and tiraditos open the evening, the Josper grill carries it, and plates are made to be shared across the table. Signature dishes include the Hotate Tiradito, Miso Black Cod and the Andean Striploin.'
    ].join('\n\n'),
    button: link('View the Food Menu', `${DIGITAL_MENU}62881`, true),
    image: img('/images/web/menu-food.jpg', 'A spread of YANA dishes and a cocktail on marble')
  },
  drinks: {
    visible: true,
    title: 'Signature Drinks',
    body: [
      'A bar built around Peru’s national spirit — pisco sours shaken to order, chilcanos over crushed ice and Nikkei-leaning cocktails poured against deep blue and brass.',
      'Alongside them run matchas, mojitos, cold-pressed juices, coolers and a full coffee and tea list, so every table finds its pour.'
    ].join('\n\n'),
    button: link('View the Drinks Menu', `${DIGITAL_MENU}62881`, true),
    image: img('/images/DSC00730.jpeg', 'A cocktail splashing into a crystal glass at the YANA bar')
  },
  cta: {
    visible: true,
    image: img('/images/yana-image-3-mrt9rmoi-9m3z.webp'),
    eyebrow: 'The Full List',
    title: 'Browse our digital menu',
    body: 'Every dish, every pour — kept current by the kitchen.',
    button: link('Open Digital Menu', `${DIGITAL_MENU}62881`, true),
    button2: link('Reserve a Table', '/reservation')
  },
  seo: {
    title: 'Menu · YANA Restaurant',
    description: 'Ceviches, tiraditos, sushi and the Josper grill, plus pisco cocktails and coolers at YANA, Al Saadiyat Island.'
  }
}

export type MenuContent = typeof defaults

export const MENU_PAGE: ContentPage = {
  key: 'menu',
  label: 'Menu',
  description: 'The menu tiles (PDFs or online menus) and the Food and Drinks sections.',
  path: '/menu',
  sections: [
    {
      id: 'banner',
      label: 'Banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 60 }, subtitle()],
      defaults: defaults.banner
    },
    {
      id: 'tiles',
      label: 'Menu tiles',
      description: 'One tile per menu. Each opens a PDF you upload, or an online menu.',
      fields: [
        { key: 'heading', type: 'text', label: 'Heading', max: 40 },
        {
          key: 'items',
          type: 'list',
          label: 'Menus',
          itemLabel: 'Menu',
          titleKey: 'label',
          max: 12,
          required: true,
          fields: [
            { key: 'label', type: 'text', label: 'Name', required: true, max: 40 },
            { key: 'desc', type: 'text', label: 'Short description', max: 80 },
            { key: 'icon', type: 'select', label: 'Drawing', options: MENU_TILE_ICONS },
            { key: 'url', type: 'url', label: 'Opens', required: true, pdf: true, placeholder: 'Choose a PDF or paste a link', hint: 'Choose an uploaded PDF, or paste the link to an online menu.' }
          ]
        }
      ],
      defaults: defaults.tiles
    },
    {
      id: 'food',
      label: 'Food',
      fields: [{ key: 'title', type: 'text', label: 'Title', required: true, max: 60 }, body(), button('button', 'Button', true), image()],
      defaults: defaults.food
    },
    {
      id: 'drinks',
      label: 'Signature Drinks',
      fields: [{ key: 'title', type: 'text', label: 'Title', required: true, max: 60 }, body(), button('button', 'Button', true), image()],
      defaults: defaults.drinks
    },
    {
      id: 'cta',
      label: 'Digital menu banner',
      fields: [
        background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 80 }, body('Text', 2),
        button('button', 'Main button', true), button('button2', 'Second button')
      ],
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
