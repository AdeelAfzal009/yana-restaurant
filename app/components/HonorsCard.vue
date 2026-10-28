<template>
  <div class="hc">
    <div class="hc-card" role="img" :aria-label="`Yana Honors ${HONORS_TIER_LABEL[tier]} membership card for ${name}, member ID ${memberNumber}`">
      <img class="hc-lockup" src="/honors/honors-lockup.png" alt="">
      <dl class="hc-fields">
        <dt>Guest name:</dt><dd>{{ name }}</dd>
        <dt>Member ID:</dt><dd>{{ memberNumber }}</dd>
        <dt>Tier:</dt><dd>{{ HONORS_TIER_LABEL[tier] }}</dd>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { HonorsTier } from '#shared/utils/honors'

// The Yana Honors card as designed (public/honors/yana-membership-card.png):
// a vertical card with the "YANA Honors" logo and, under it, the guest's
// details. Scaled to whatever width it is given. The wallets draw their own
// version from the same logo.
defineProps<{ tier: HonorsTier, name: string, memberNumber: string }>()
</script>

<style scoped>
.hc {
  container-type: inline-size;
  width: 100%;
}

.hc-card {
  /* One design pixel, on a 1080-wide card. */
  --u: calc(100cqw / 1080);
  display: flex;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1080 / 1500;
  padding-top: calc(330 * var(--u));
  border-radius: calc(56 * var(--u));
  background: #0F1E2E;
  border: 1px solid rgba(234, 183, 122, 0.28);
  font-family: Montserrat, sans-serif;
  text-align: center;
  box-shadow: 0 calc(30 * var(--u)) calc(70 * var(--u)) rgba(5, 12, 20, 0.35);
  box-sizing: border-box;
}

.hc-lockup {
  width: calc(433 * var(--u));
}

.hc-fields {
  width: 84%;
  margin: calc(150 * var(--u)) 0 0;
}

.hc-fields dt {
  font-size: calc(36 * var(--u));
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}

.hc-fields dd {
  margin: calc(10 * var(--u)) 0 calc(56 * var(--u));
  overflow: hidden;
  font-size: calc(54 * var(--u));
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #EAB77A;
}
</style>
