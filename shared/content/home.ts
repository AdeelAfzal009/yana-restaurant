import { BRAND_COLOURS, background, body, button, eyebrow, ghostFields, image, navyColourField, img, link, seoFields, subtitle, title, backdropFields } from './fields'
import type { ContentPage } from './schema'

// The line pattern drawn behind the Food text. It is a dark pattern, so the site
// shows it lightened (inverted); any other image is shown as uploaded.
export const PANEL_PATTERN = '/images/yana-pattern-square.jpeg'

const PANEL_COLOURS = Object.entries(BRAND_COLOURS).map(([value, c]) => ({ value, label: c.label }))

const defaults = {
  hero: {
    video: 'https://coyarestaurant.com/uploads/content/pages/1698918469_44fefc7e-15ae-4f40-b8a4-dac51b658d78.mp4',
    image: img('/images/yana-image-2-mruiybvd-26zk.webp'),
    zoom: true,
    showEyebrow: true,
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
    panelBg: 'image',
    panelImage: img(PANEL_PATTERN),
    panelImageFit: 'tile',
    showEyebrow: true,
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
    showBgImage: true,
    bgColor: 'default',
    visible: true,
    showGhost: true,
    ghost: 'PISCO BAR',
    showEyebrow: true,
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
    showGhost: true,
    ghost: 'TERRACE',
    showEyebrow: true,
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
    showGhost: true,
    ghost: 'EVENINGS',
    showEyebrow: true,
    eyebrow: '04 — Evenings',
    title: 'When the lights\ncome on',
    body: 'Brass glows, the grill settles into rhythm and the room fills. Evenings at YANA are long and warm — a dining room wrapped in deep blue, a bar that keeps pouring, and a table worth lingering at.',
    button: link('Plan Your Evening', '/reservation')
  },
  story: {
    visible: true,
    showGhost: true,
    ghost: 'PERU',
    showEyebrow: true,
    eyebrow: '05 — Our Story',
    title: 'Two coastlines,\none table.',
    body: [
      'YANA is a meeting of distant shores — the citrus-bright kitchens of coastal Peru and the quiet mastery of Pan-Asian cuisine. Set against the hush of Saadiyat Island, each plate is an invitation to linger over fire, sea and spice long into the Abu Dhabi night.',
      'We cook over open flame, pour with intention, and treat every evening as a slow, deliberate occasion.'
    ].join('\n\n'),
    signoff: '— The House of YANA',
    image: img('/images/yana-side-image-mrt8vz5a-90ny.webp', 'The YANA dining room')
  },
  strip: {
    visible: true,
    bgColor: 'dark',
    speed: '90',
    showEyebrow: true,
    eyebrow: 'Saadiyat Island',
    title: 'A table by the water',
    body: 'Long lunches on the terrace, sunset drinks at the bar and dinners that run late — YANA brings the coastal kitchens of Peru and the precision of Pan-Asian cooking to the shore of Saadiyat Island.',
    photos: [
      { image: img('/images/carousel/web/signature-rolls.jpg', 'Signature rolls finished with micro herbs') },
      { image: img('/images/carousel/web/bar-cocktail.jpg', 'A violet cocktail with a flower garnish') },
      { image: img('/images/carousel/web/prawn-croquettes.jpg', 'Prawn croquettes on a hand-glazed plate') },
      { image: img('/images/carousel/web/shared-table.jpg', 'Friends sharing dishes at a YANA table') },
      { image: img('/images/carousel/web/scallop.jpg', 'A single scallop plated on marble') },
      { image: img('/images/carousel/web/sliders.jpg', 'Sliders and a blue cooler on deep blue velvet') },
      { image: img('/images/carousel/web/live-violin.jpg', 'A violinist playing in the dining room') },
      { image: img('/images/web/menu-food.jpg', 'A spread of YANA dishes and a cocktail on marble') }
    ]
  },
  // Placeholders until real guest reviews are added in the dashboard.
  testimonials: {
    visible: true,
    bgColor: 'dark',
    quotes: [
      { quote: 'Add a guest review here. Website content › Home › Guest reviews lets you add, reorder and remove quotes.', name: 'Guest name', detail: 'Where the review is from, e.g. Google review' },
      { quote: 'Use real words from real guests (with their permission), such as a Google or TripAdvisor review.', name: 'Guest name', detail: 'Google review' }
    ]
  },
  moments: {
    visible: true,
    // Just the carousel by default; the heading block can be switched back on.
    showIntro: false,
    showEyebrow: true,
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
    showEyebrow: true,
    eyebrow: 'Reservations',
    title: 'Reserve your evening\nat YANA',
    body: 'We recommend booking in advance to secure your table. Our team is happy to help with larger parties and special occasions.',
    button: link('Reserve a Table', '/reservation'),
    phoneLine: 'or call'
  },
  visit: {
    visible: true,
    mapImage: img('/images/yana-map-2026.webp', 'Map showing YANA on Al Saadiyat Island, Abu Dhabi'),
    // The map image has YANA's pin drawn in, so the extra marker is off.
    showPin: false,
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
        ...eyebrow(),
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
        { ...image('dishImage', 'Photo above the title'), hint: 'Shown across the full width of the text, at the photo\'s own shape, so nothing is cropped. Landscape photos work best.' },
        {
          key: 'panelBg',
          type: 'select',
          label: 'Background (right side)',
          options: [...PANEL_COLOURS, { value: 'image', label: 'Background image' }],
          hint: 'Only one is used at a time. YANA Light and YANA Light Gold keep the text dark; the other colours switch it to light.'
        },
        { ...background('panelImage', 'Background image (right side)'), hint: 'Used when the background is set to Background image. The text stays dark, so pick a light, calm photo or pattern.' },
        {
          key: 'panelImageFit',
          type: 'select',
          label: 'Background image fit',
          options: [
            { value: 'tile', label: 'Repeat as a pattern' },
            { value: 'cover', label: 'Fill the panel (photo)' }
          ],
          hint: 'Repeat keeps a pattern at its own size. Fill stretches one photo over the whole panel, so a pattern would look enlarged.'
        },
        ...eyebrow(), title(), body(), button()
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
      id: 'strip',
      label: 'Photo strip',
      description: 'The dark band with a heading and an endlessly scrolling row of photos. It pauses when a visitor hovers over it.',
      fields: [
        navyColourField(),
        {
          key: 'speed',
          type: 'text',
          label: 'Scroll speed (seconds)',
          max: 4,
          placeholder: '90',
          hint: 'Seconds for the photos to slide all the way round once. Smaller is faster: 40 is quick, 90 is the original pace, 150 is slow. Any number from 5 to 300.'
        },
        ...eyebrow(),
        { key: 'title', type: 'textarea', label: 'Title', rows: 2, max: 160, hint: 'Leave the title and text empty to show only the photos.' },
        body('Text', 3),
        {
          key: 'photos',
          type: 'list',
          label: 'Photos',
          itemLabel: 'Photo',
          max: 20,
          required: true,
          hint: 'Portrait photos (3:4) look best. At least 5 keeps the strip full on wide screens.',
          fields: [image()]
        }
      ],
      defaults: defaults.strip
    },
    {
      id: 'testimonials',
      label: 'Guest reviews',
      description: 'Quotes from guests that slide one at a time, with arrows and dots to move between them.',
      fields: [navyColourField(), {
        key: 'quotes',
        type: 'list',
        label: 'Quotes',
        itemLabel: 'Quote',
        titleKey: 'name',
        max: 12,
        required: true,
        fields: [
          { key: 'quote', type: 'textarea', label: 'Quote', required: true, rows: 4, max: 600 },
          { key: 'name', type: 'text', label: 'Name', required: true, max: 60 },
          { key: 'detail', type: 'text', label: 'Second line', max: 80, hint: 'e.g. their company, or "Google review".' }
        ]
      }],
      defaults: defaults.testimonials
    },
    {
      id: 'bar',
      label: 'Pisco Bar',
      fields: [...backdropFields(), ...eyebrow(), title(), body(), button(), image(), ...ghostFields()],
      defaults: defaults.bar
    },
    {
      id: 'terrace',
      label: 'The Terrace',
      fields: [...eyebrow(), title(), body(), button(), image(), ...ghostFields()],
      defaults: defaults.terrace
    },
    {
      id: 'evenings',
      label: 'Evenings',
      description: 'The full-width photo band.',
      fields: [background('image', 'Photo'), ...eyebrow(), title(), body(), button(), ...ghostFields()],
      defaults: defaults.evenings
    },
    {
      id: 'story',
      label: 'Our Story',
      fields: [...eyebrow(), title(), body(), { key: 'signoff', type: 'text', label: 'Sign-off', max: 80 }, image(), ...ghostFields()],
      defaults: defaults.story
    },
    {
      id: 'moments',
      label: 'Moments (photo carousel)',
      fields: [
        { key: 'showIntro', type: 'toggle', label: 'Show heading and text', hint: 'The small heading, title, text and Instagram link above the photos. Off shows the photos only.' },
        ...eyebrow(), title(), body('Text', 3),
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
        background('image', 'Background photo'), ...eyebrow(), title(), body('Text', 3), button(),
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
        { key: 'showPin', type: 'toggle', label: 'Show the YANA pin on the map', hint: 'Adds a YANA marker on top of the map. Leave it off when the map image already shows the restaurant (the current one does).' },
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
