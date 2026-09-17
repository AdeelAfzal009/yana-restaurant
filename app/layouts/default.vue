<template>
  <div>
    <YanaNav :active="active" />
    <slot />
    <YanaFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const active = computed(() => {
  const map: Record<string, string> = {
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
