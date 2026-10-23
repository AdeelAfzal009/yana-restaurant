<template>
  <div class="hc">
    <div class="hc-card" :class="`is-${tier}`" role="img" :aria-label="`Yana Honors ${HONORS_TIER_LABEL[tier]} card for ${name}, member ID ${memberNumber}`">
      <img class="hc-pattern" src="/honors/corner-pattern.jpg" alt="">
      <div class="hc-frame" />
      <div class="hc-body">
        <img class="hc-mark" src="/honors/mark-gold.png" alt="">
        <img class="hc-wordmark" src="/honors/wordmark-gold.png" alt="">
        <img class="hc-divider" src="/honors/divider-gold.png" alt="">
        <p class="hc-program">Yana Honors</p>
        <p class="hc-tier">{{ HONORS_TIER_LABEL[tier] }}</p>
        <p class="hc-label">Member name</p>
        <p class="hc-value">{{ name }}</p>
        <p class="hc-label">Member ID</p>
        <p class="hc-value hc-id">{{ memberNumber }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { HonorsTier } from '#shared/utils/honors'

// The Yana Honors card as designed (390 x 560), scaled to whatever width it
// is given. The wallets draw their own version from the same brand images.
defineProps<{ tier: HonorsTier, name: string, memberNumber: string }>()
</script>

<style scoped>
.hc {
  container-type: inline-size;
  width: 100%;
}

.hc-card {
  /* One design pixel. */
  --u: calc(100cqw / 390);
  position: relative;
  overflow: hidden;
  aspect-ratio: 390 / 560;
  border-radius: calc(22 * var(--u));
  background: #0C1D2F;
  font-family: Montserrat, sans-serif;
  color: #E8BD73;
  box-shadow: 0 calc(18 * var(--u)) calc(40 * var(--u)) rgba(5, 12, 20, 0.35);
}

.hc-pattern {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 47%;
  object-fit: cover;
  object-position: right bottom;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 55%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 55%);
  opacity: 0.85;
}

.hc-frame {
  position: absolute;
  inset: calc(10 * var(--u));
  border-radius: calc(16 * var(--u));
  border: calc(1.2 * var(--u)) solid rgba(211, 216, 224, 0.35);
  pointer-events: none;
}

.is-platinum .hc-frame {
  border-color: rgba(232, 189, 115, 0.6);
}

.hc-body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: calc(42 * var(--u));
  text-align: center;
}

.hc-body p {
  margin: 0;
}

.hc-mark {
  width: calc(48 * var(--u));
}

.hc-wordmark {
  width: calc(170 * var(--u));
  margin-top: calc(20 * var(--u));
}

.hc-divider {
  width: calc(205 * var(--u));
  margin-top: calc(16 * var(--u));
}

.hc-program {
  margin-top: calc(26 * var(--u)) !important;
  padding-left: 0.42em;
  font-size: calc(13 * var(--u));
  font-weight: 300;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: #C9A465;
}

.hc-tier {
  margin-top: calc(26 * var(--u)) !important;
  min-width: calc(200 * var(--u));
  padding: calc(9 * var(--u)) calc(28 * var(--u)) calc(9 * var(--u)) calc(34 * var(--u));
  border: calc(1.2 * var(--u)) solid #D3D8E0;
  border-radius: 999px;
  font-size: calc(17 * var(--u));
  font-weight: 400;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #D3D8E0;
}

.is-platinum .hc-tier {
  border-color: #E8BD73;
  background: #E8BD73;
  color: #0C1D2F;
}

.hc-label {
  margin-top: calc(24 * var(--u)) !important;
  padding-left: 0.26em;
  font-size: calc(10 * var(--u));
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #C9A465;
}

.hc-tier + .hc-label {
  margin-top: calc(30 * var(--u)) !important;
}

.hc-value {
  max-width: 86%;
  margin-top: calc(5 * var(--u)) !important;
  overflow: hidden;
  font-size: calc(17 * var(--u));
  font-weight: 400;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #E8BD73;
}

.hc-label + .hc-value + .hc-label {
  margin-top: calc(16 * var(--u)) !important;
}

.hc-id {
  letter-spacing: 0.14em;
}
</style>
