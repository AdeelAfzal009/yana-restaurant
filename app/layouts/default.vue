<template>
  <div class="yana-site" :style="{ '--heading-on-light': headingColour }">
    <YanaNav :active="active" />
    <slot />
    <YanaFooter />
    <YanaConcierge />
  </div>
</template>

<script setup lang="ts">
import { HEADING_COLOUR_VALUES } from '#shared/content/layout'

const route = useRoute()

// Site-wide colour for headings on light backgrounds (Header & footer › Style).
const layout = useContent('layout')
const headingColour = computed(() => HEADING_COLOUR_VALUES[layout.value.style.headingColor] ?? HEADING_COLOUR_VALUES.blue)

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
