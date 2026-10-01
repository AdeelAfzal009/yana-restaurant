<template>
  <div aria-hidden="true" class="marquee">
    <div class="marquee-track yana-marquee-track">
      <span class="marquee-text">{{ line }}</span>
      <span class="marquee-text">{{ line }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Duplicated twice in the track so the loop has no visible seam.
const words = ['Ceviche', 'Nikkei', 'Josper Grill', 'Anticuchos', 'Pisco Lounge', 'Tiradito', 'Wagyu']
const line = `${words.join(' · ')} · `
</script>

<style scoped>
.marquee {
  overflow: hidden;
  border-top: 1px solid rgba(217, 182, 144, 0.3);
  border-bottom: 1px solid rgba(217, 182, 144, 0.3);
  padding: clamp(26px, 4vw, 46px) 0;
  background: var(--panel);
}

.marquee-track {
  display: flex;
  width: max-content;
  white-space: nowrap;
  animation: yanaMarquee 34s linear infinite;
}

.marquee-text {
  font-family: var(--serif);
  font-weight: 300;
  font-size: clamp(28px, 5vw, 58px);
  color: rgba(18, 66, 109, 0.14);
  letter-spacing: 0.02em;
  padding-right: 0.35em;
}

@keyframes yanaMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
