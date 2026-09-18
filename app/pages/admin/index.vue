<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })
await navigateTo('/admin/reservations', { replace: true })
</script>
