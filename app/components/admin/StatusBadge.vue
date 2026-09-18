<template>
  <span class="adm-pill" :style="{ borderColor: `${meta.color}40`, background: `${meta.color}12` }">
    <span class="adm-dot" :style="{ background: meta.color }" />
    {{ meta.label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: ReservationStatus }>()
const meta = computed(() => STATUS_META[props.status])
</script>
