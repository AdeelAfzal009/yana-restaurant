<template>
  <div>
    <YanaNav :active="active" />
    <slot />
    <YanaFooter />
    <YanaConcierge />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

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
