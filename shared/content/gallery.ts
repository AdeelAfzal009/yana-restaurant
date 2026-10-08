import { background, body, button, eyebrow, image, img, link, seoFields, subtitle } from './fields'
import type { ContentPage } from './schema'

const photo = (src: string, alt: string, shape: 'portrait' | 'landscape' = 'portrait') => ({ image: img(src, alt), shape })

const defaults = {
  banner: {
    image: img('/images/yana-pattern-wide.jpeg'),
    eyebrow: 'Inside Yana',
    title: 'Gallery',
    subtitle: 'The room, the plates, the evenings.'
  },
  photos: {
    visible: true,
    items: [
      photo('/images/web/gallery-seafront.jpg', 'Palms along the Saadiyat seafront at dusk', 'landscape'),
      photo('/images/yana-side-image-mrt8vz5a-90ny.webp', 'The YANA dining room'),
      photo('/images/yana-image-3-mrt9rmoi-9m3z.webp', 'The terrace by the water'),
      photo('/images/yana-image-4-mrt9n45r-v3w7.webp', 'The entrance to YANA'),
      photo('/images/yana-image-2-mruiybvd-26zk.webp', 'Deep blue banquettes and brass lights'),
      photo('/images/web/gallery-banquette.jpg', 'Blue velvet banquettes'),
      photo('/images/web/gallery-dining-room.jpg', 'The dining room and its blue carpet'),
      photo('/images/web/gallery-evening.jpg', 'An evening of live music'),
      photo('/images/web/gallery-marina.jpg', 'The marina view from the terrace')
    ]
  },
  room: {
    visible: true,
    eyebrow: 'The Room',
    title: 'Blue, brass and candlelight',
    body: 'A dining room wrapped in deep blue and brass, and a bar where the evening runs late.',
    tiles: [
      { image: img(''), label: 'Dining room, wide' },
      { image: img(''), label: 'The bar' },
      { image: img(''), label: 'Terrace at dusk' },
      { image: img(''), label: 'Private dining' }
    ]
  },
  social: {
    visible: true,
    handle: '@yanarestaurants',
    title: 'More on Instagram',
    body: 'New plates, new evenings — posted as they happen.',
    button: link('Follow Yana', 'https://www.instagram.com/yanarestaurants/', true)
  },
  seo: {
    title: 'Gallery · YANA Restaurant',
    description: 'Inside YANA on Al Saadiyat Island: the dining room, the terrace, the plates and the evenings.'
  }
}

export type GalleryContent = typeof defaults

export const GALLERY_PAGE: ContentPage = {
  key: 'gallery',
  label: 'Gallery',
  description: 'The photo grid, The Room and the Instagram block.',
  path: '/gallery',
  sections: [
    {
      id: 'banner',
      label: 'Banner',
      fields: [background(), eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 60 }, subtitle()],
      defaults: defaults.banner
    },
    {
      id: 'photos',
      label: 'Photo grid',
      description: 'Visitors can open each photo full screen.',
      fields: [{
        key: 'items',
        type: 'list',
        label: 'Photos',
        itemLabel: 'Photo',
        max: 60,
        required: true,
        fields: [
          image(),
          { key: 'shape', type: 'select', label: 'Tile shape', options: [{ value: 'portrait', label: 'Tall' }, { value: 'landscape', label: 'Wide' }], hint: 'Pick Wide for landscape photos.' }
        ]
      }],
      defaults: defaults.photos
    },
    {
      id: 'room',
      label: 'The Room',
      description: 'Tiles without a photo show a blue placeholder.',
      fields: [
        eyebrow(), { key: 'title', type: 'text', label: 'Title', required: true, max: 80 }, body('Text', 3),
        {
          key: 'tiles',
          type: 'list',
          label: 'Tiles',
          itemLabel: 'Tile',
          titleKey: 'label',
          max: 8,
          fields: [image('image', 'Photo', false), { key: 'label', type: 'text', label: 'Label', max: 40 }]
        }
      ],
      defaults: defaults.room
    },
    {
      id: 'social',
      label: 'Instagram',
      fields: [
        { key: 'handle', type: 'text', label: 'Account name', max: 40 },
        { key: 'title', type: 'text', label: 'Title', required: true, max: 60 },
        body('Text', 2), button()
      ],
      defaults: defaults.social
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
