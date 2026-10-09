import { background, body, button, eyebrow, ghostWord, image, img, link, seoFields, subtitle, title } from './fields'
import type { ContentPage } from './schema'

const defaults = {
  hero: {
    video: 'https://coyarestaurant.com/uploads/content/pages/1698918469_44fefc7e-15ae-4f40-b8a4-dac51b658d78.mp4',
    image: img('/images/yana-image-2-mruiybvd-26zk.webp'),
    zoom: true,
    eyebrow: 'Pan Asian Fusion Peruvian Flair',
    title: 'Fire & Sea',
    location: 'Saadiyat Island · Abu Dhabi',
    subtitle: 'Where the shores of Peru meet the fire of the East.',
    button: link('Reserve a Table', '/reservation')
  },
  intro: {
    visible: true,
    title: 'YANA Abu Dhabi: a Pan-Asian kitchen\nwith Peruvian flair on Saadiyat Island',
    body: [
      'Set on the beachfront of Saadiyat Island, YANA brings together the freshness and colour of coastal Peru with the precision of Pan-Asian cooking.',
      'The menu moves from ceviches and tiraditos to sushi and dishes from the Josper grill, made for long lunches, sunset drinks and evenings that unfold at an easy pace.',
      'Inside, deep blue and brass create a warm, intimate setting, while the terrace opens out to palms and views across the water. At the bar, pisco sits alongside matcha and cold-pressed coolers, bringing another layer to the experience.'
    ].join('\n\n'),
    button: link('Make a Reservation', '/reservation')
  },
  kitchen: {
    visible: true,
    roomImage: img('/images/yana-image-2-mruiybvd-26zk.webp', 'The YANA dining room'),
    dishImage: img('/images/web/menu-food.jpg', 'A spread of YANA dishes and a cocktail on marble'),
    eyebrow: '01 — Food',
    title: 'La Cocina de YANA',
    body: [
      'YANA is a Pan-Asian kitchen with Peruvian flair, built on fire, citrus and restraint. Plates are made to be shared, and the room is made to be lingered in.',
      'Signature dishes like Hotate Tiradito, Miso Black Cod and the Andean Striploin carry the Nikkei thread, while Chocolate & Lucuma Mochi and the Matcha Cheesecake close the evening.'
    ].join('\n\n'),
    button: link('Discover Our Menus', '/menu')
  },
  quote: {
    visible: true,
    text: '‘YANA brings together the vibrancy of Peruvian cuisine with the elegance of Pan-Asian cuisine.’'
  },
  bar: {
    visible: true,
    ghost: 'PISCO BAR',
    eyebrow: '02 — Pisco Bar',
    title: 'Unwind over pisco,\nlate into the night',
    body: [
      'A bar built around Peru\'s national spirit — pisco sours shaken to order, chilcanos over crushed ice and Nikkei-leaning cocktails poured against deep blue and brass.',
      'Matchas, coolers and cold-pressed juices run alongside, so every table finds its pour.'
    ].join('\n\n'),
    button: link('Discover the Drinks', '/menu?menu=drinks'),
    image: img('/images/DSC00730.jpeg', 'A cocktail splashing into a crystal glass at the YANA bar')
  },
  terrace: {
    visible: true,
    ghost: 'TERRACE',
    eyebrow: '03 — The Terrace',
    title: 'Sea breeze, palms\nand long lunches',
    body: [
      'Marble-topped tables under the palms, the Gulf a few steps away. The terrace is made for slow afternoons — ceviche, a cooler in hand and the island quiet around you.',
      'As the light drops, lanterns come on and lunch turns, unhurried, into dinner.'
    ].join('\n\n'),
    button: link('See the Gallery', '/gallery'),
    image: img('/images/web/gallery-seafront.jpg', 'Palms along the Saadiyat seafront at dusk')
  },
  evenings: {
    visible: true,
    image: img('/images/yana-image-4-mrt9n45r-v3w7.webp'),
    ghost: 'EVENINGS',
    eyebrow: '04 — Evenings',
    title: 'When the lights\ncome on',
    body: 'Brass glows, the grill settles into rhythm and the room fills. Evenings at YANA are long and warm — a dining room wrapped in deep blue, a bar that keeps pouring, and a table worth lingering at.',
    button: link('Plan Your Evening', '/reservation')
  },
  story: {
    visible: true,
    ghost: 'PERU',
    eyebrow: '05 — Our Story',
    title: 'Two coastlines,\none table.',
    body: [
      'YANA is a meeting of distant shores — the citrus-bright kitchens of coastal Peru and the quiet mastery of Pan-Asian cuisine. Set against the hush of Saadiyat Island, each plate is an invitation to linger over fire, sea and spice long into the Abu Dhabi night.',
      'We cook over open flame, pour with intention, and treat every evening as a slow, deliberate occasion.'
    ].join('\n\n'),
    signoff: '— The House of YANA',
    image: img('/images/yana-side-image-mrt8vz5a-90ny.webp', 'The YANA dining room')
  },
  moments: {
    visible: true,
    eyebrow: '06 — Moments',
    title: 'A glimpse of\nlife at YANA.',
    body: 'The dining room, the terrace and the plates in between, as our guests see them.',
    instagram: link('More moments on @yanarestaurants', 'https://www.instagram.com/yanarestaurants/', true),
    shots: [
      { image: img('/images/carousel/yana-01.jpg', 'The YANA dining room under its gold-lit ceiling'), label: 'The Dining Room' },
      { image: img('/images/carousel/web/signature-rolls.jpg', 'Signature rolls finished with micro herbs'), label: 'Signature Rolls' },
      { image: img('/images/carousel/web/live-violin.jpg', 'A violinist playing in the dining room'), label: 'Live Evenings' },
      { image: img('/images/carousel/web/prawn-croquettes.jpg', 'Prawn croquettes on a hand-glazed plate'), label: 'Small Plates' },
      { image: img('/images/carousel/web/bar-cocktail.jpg', 'A violet cocktail with a flower garnish'), label: 'The Bar' },
      { image: img('/images/carousel/web/shared-table.jpg', 'Friends sharing dishes at a YANA table'), label: 'Shared Tables' },
      { image: img('/images/carousel/web/sliders.jpg', 'Sliders and a blue cooler on deep blue velvet'), label: 'Bites & Pours' },
      { image: img('/images/carousel/web/terrace-saxophone.jpg', 'A saxophonist on the terrace at night'), label: 'Terrace Nights' },
      { image: img('/images/carousel/web/scallop.jpg', 'A single scallop plated on marble'), label: 'Plated with Care' },
      { image: img('/images/carousel/yana-03.jpg', 'Coolers and cocktails at the bar'), label: 'Coolers & Cocktails' },
      { image: img('/images/carousel/web/evening-music.jpg', 'Live music among the tables in the evening'), label: 'Evenings at YANA' },
      { image: img('/images/carousel/yana-04.jpg', 'The palm-lined terrace entrance'), label: 'The Terrace' }
    ]
  },
  reserve: {
    visible: true,
    image: img('/images/yana-image-2-mrt9pbly-db2c.webp'),
    eyebrow: 'Reservations',
    title: 'Reserve your evening\nat YANA',
    body: 'We recommend booking in advance to secure your table. Our team is happy to help with larger parties and special occasions.',
    button: link('Reserve a Table', '/reservation'),
    phoneLine: 'or call'
  },
  visit: {
    visible: true,
    mapImage: img('/images/yana-map.webp', 'Map showing YANA on Al Saadiyat Island, Abu Dhabi'),
    mapButton: 'View on Google Maps',
    title: 'YANA Abu Dhabi',
    body: 'On Al Saadiyat Island, minutes from the museums and the beach — a Pan-Asian kitchen with Peruvian flair, open from morning coffee to late dinner.',
    bookingLabel: 'Book a table online'
  },
  seo: {
    title: 'YANA Restaurant — Fire & Sea',
    description: 'YANA — Pan-Asian × Peruvian fusion restaurant on Al Saadiyat Island, Abu Dhabi.'
  }
}

export type HomeContent = typeof defaults

export const HOME_PAGE: ContentPage = {
  key: 'home',
  label: 'Home',
  description: 'The front page, from the opening video down to the map.',
  path: '/',
  sections: [
    {
      id: 'hero',
      label: 'Hero',
      description: 'The full-screen opening with the video.',
      fields: [
        { key: 'video', type: 'url', label: 'Video link (MP4)', placeholder: 'https://… .mp4 or /videos/hero.mp4', hint: 'Plays silently on a loop. Leave empty to show the photo instead. Keep it short and under ~15 MB so it starts quickly.' },
        { ...background('image', 'Photo'), hint: 'Shown while the video loads, on phones set to reduce motion, and whenever there is no video.' },
        { key: 'zoom', type: 'toggle', label: 'Slow zoom on the photo' },
        eyebrow(),
        { key: 'title', type: 'text', label: 'Title', required: true, max: 60 },
        { key: 'location', type: 'text', label: 'Location line', max: 80 },
        subtitle(),
        button()
      ],
      defaults: defaults.hero
    },
    {
      id: 'intro',
      label: 'Introduction',
      description: 'The welcome text under the hero.',
      fields: [title(), body(), button()],
      defaults: defaults.intro
    },
    {
      id: 'kitchen',
      label: 'Food (La Cocina de YANA)',
      fields: [
        image('roomImage', 'Large photo (left)'),
        image('dishImage', 'Small photo (above the title)'),
        eyebrow(), title(), body(), button()
      ],
      defaults: defaults.kitchen
    },
    {
      id: 'quote',
      label: 'Quote',
      fields: [{ key: 'text', type: 'textarea', label: 'Quote', required: true, rows: 2, max: 300 }],
      defaults: defaults.quote
    },
    {
      id: 'bar',
      label: 'Pisco Bar',
      fields: [eyebrow(), title(), body(), button(), image(), ghostWord()],
      defaults: defaults.bar
    },
    {
      id: 'terrace',
      label: 'The Terrace',
      fields: [eyebrow(), title(), body(), button(), image(), ghostWord()],
      defaults: defaults.terrace
    },
    {
      id: 'evenings',
      label: 'Evenings',
      description: 'The full-width photo band.',
      fields: [background('image', 'Photo'), eyebrow(), title(), body(), button(), ghostWord()],
      defaults: defaults.evenings
    },
    {
      id: 'story',
      label: 'Our Story',
      fields: [eyebrow(), title(), body(), { key: 'signoff', type: 'text', label: 'Sign-off', max: 80 }, image(), ghostWord()],
      defaults: defaults.story
    },
    {
      id: 'moments',
      label: 'Moments (photo carousel)',
      fields: [
        eyebrow(), title(), body('Text', 3),
        button('instagram', 'Instagram link'),
        {
          key: 'shots',
          type: 'list',
          label: 'Photos',
          itemLabel: 'Photo',
          titleKey: 'label',
          max: 30,
          required: true,
          hint: 'Portrait photos (3:4) look best.',
          fields: [image(), { key: 'label', type: 'text', label: 'Caption', max: 40 }]
        }
      ],
      defaults: defaults.moments
    },
    {
      id: 'reserve',
      label: 'Reservation banner',
      fields: [
        background('image', 'Background photo'), eyebrow(), title(), body('Text', 3), button(),
        { key: 'phoneLine', type: 'text', label: 'Phone line', max: 40, hint: 'Shown before the phone number from Site info, e.g. "or call". Leave empty to hide the number.' }
      ],
      defaults: defaults.reserve
    },
    {
      id: 'visit',
      label: 'Visit (map and details)',
      description: 'The address, phone, email, WhatsApp, Instagram and hours here come from Site info.',
      fields: [
        image('mapImage', 'Map image'),
        { key: 'mapButton', type: 'text', label: 'Text on the map', max: 40 },
        { key: 'title', type: 'text', label: 'Title', required: true, max: 60 },
        body('Text', 3),
        { key: 'bookingLabel', type: 'text', label: 'Reservations link text', max: 40 }
      ],
      defaults: defaults.visit
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
