<template>
  <NuxtLink
    v-if="link?.label && link.url"
    :to="link.url"
    :target="link.newTab ? '_blank' : undefined"
    :rel="link.newTab ? 'noopener' : undefined"
  >
    <slot name="before" />{{ link.label }}<slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { LinkValue } from '#shared/content/schema'

// A button or text link edited in the dashboard. Renders nothing when its text
// or address is empty, which is how editors hide a button.
defineProps<{ link?: LinkValue | null }>()
</script>
