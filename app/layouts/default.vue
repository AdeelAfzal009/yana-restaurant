<template>
  <div class="yana-site" :style="{ '--heading-on-light': headingColour }">
    <YanaNav :active="active" />
    <main id="main">
      <slot />
    </main>
    <YanaFooter />
    <YanaConcierge />
  </div>
</template>

<script setup lang="ts">
import { HEADING_COLOUR_VALUES } from '#shared/content/layout'
import { openingHoursSpecification } from '#shared/utils/opening-hours'

const route = useRoute()

// Site-wide colour for headings on light backgrounds (Header & footer › Style).
const layout = useContent('layout')
const headingColour = computed(() => HEADING_COLOUR_VALUES[layout.value.style.headingColor] ?? HEADING_COLOUR_VALUES.blue)

// Tells search engines this is a restaurant, with its address, phone, hours,
// menu and booking page, all from the dashboard's Site details. This is what
// powers Google's restaurant panel and map listing details.
const site = useContent('site')
const origin = useSiteOrigin()
const structuredData = computed(() => {
  const { contact, hours, social } = site.value
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${origin}/#restaurant`,
    'name': 'YANA Restaurant',
    'url': `${origin}/`,
    'image': `${origin}${DEFAULT_SHARE_IMAGE}`,
    'logo': `${origin}/images/yana-logo-gold.svg`,
    'description': 'Pan-Asian kitchen with Peruvian flair on Saadiyat Island, Abu Dhabi.',
    'servesCuisine': ['Pan-Asian', 'Peruvian', 'Nikkei'],
    'telephone': contact.phone,
    'email': contact.email,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': contact.address.split('\n')[0]?.replace(/,\s*$/, ''),
      'addressLocality': 'Abu Dhabi',
      'addressCountry': 'AE'
    },
    'hasMap': contact.mapsUrl || undefined,
    'menu': `${origin}/menu`,
    'acceptsReservations': `${origin}/reservation`,
    'openingHoursSpecification': openingHoursSpecification(hours.rows),
    'sameAs': [social.instagramUrl, social.linkedinUrl].filter(Boolean)
  }
  // "<" is escaped so text from the dashboard can't close the script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
})
useHead({ script: [{ type: 'application/ld+json', key: 'restaurant-ld', innerHTML: structuredData }] })

type NavKey = 'home' | 'menu' | 'reservation' | 'about' | 'gallery' | 'contact'

const active = computed<NavKey>(() => {
  const map: Record<string, NavKey> = {
    '/': 'home',
    '/menu': 'menu',
    '/reservation': 'reservation',
    '/about': 'about',
    '/gallery': 'gallery',
    '/contact': 'contact'
  }
  return map[route.path] || 'home'
})
</script>
