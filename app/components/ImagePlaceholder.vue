<template>
  <div class="image-placeholder">
    <span class="image-placeholder-label" :class="{ 'is-dark-text': onLight }">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; onLight?: boolean }>()
</script>

<style scoped>
.image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px dashed rgba(217, 182, 144, 0.55);
}

.image-placeholder-label {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
}

.image-placeholder-label.is-dark-text {
  color: rgba(15, 30, 46, 0.5);
}
</style>
