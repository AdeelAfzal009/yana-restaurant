<template>
  <div class="hc">
    <div class="hc-card" role="img" :aria-label="`Yana Honors ${HONORS_TIER_LABEL[tier]} membership card for ${name}, member ID ${memberNumber}`">
      <img class="hc-lockup" src="/honors/honors-lockup.png" alt="">
      <p class="hc-title">Membership card</p>
      <dl class="hc-fields">
        <dt>Guest name:</dt><dd>{{ name }}</dd>
        <dt>Member ID:</dt><dd>{{ memberNumber }}</dd>
        <dt>Tier:</dt><dd>{{ HONORS_TIER_LABEL[tier] }}</dd>
      </dl>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="qrSvg" class="hc-qr" v-html="qrSvg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { HonorsTier } from '#shared/utils/honors'
import QRCode from 'qrcode'

// The Yana Honors card as designed (public/honors/yana-membership-card.png,
// 1748 x 1240), scaled to whatever width it is given. The QR code is the same
// staff verify link the wallet cards carry. The wallets draw their own version
// from pieces of the same design.
const props = defineProps<{ tier: HonorsTier, name: string, memberNumber: string }>()

const qrSvg = ref('')
onMounted(async () => {
  qrSvg.value = await QRCode.toString(`${location.origin}/admin/honors/${props.memberNumber}`, {
    type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#EAB77A', light: '#0F1E2E' }
  })
})
</script>

<style scoped>
.hc {
  container-type: inline-size;
  width: 100%;
}

.hc-card {
  /* One design pixel. */
  --u: calc(100cqw / 1748);
  position: relative;
  overflow: hidden;
  aspect-ratio: 1748 / 1240;
  border-radius: calc(60 * var(--u));
  background: #0F1E2E;
  border: 1px solid rgba(234, 183, 122, 0.28);
  font-family: Montserrat, sans-serif;
  box-shadow: 0 calc(40 * var(--u)) calc(90 * var(--u)) rgba(5, 12, 20, 0.35);
}

.hc-lockup {
  position: absolute;
  left: 50%;
  top: calc(104 * var(--u));
  width: calc(419 * var(--u));
  transform: translateX(-50%);
}

.hc-title {
  position: absolute;
  inset: calc(352 * var(--u)) 0 auto;
  margin: 0;
  padding-left: 0.15em;
  font-size: calc(94 * var(--u));
  font-weight: 400;
  letter-spacing: 0.15em;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  color: #EAB77A;
}

.hc-fields {
  position: absolute;
  left: calc(126 * var(--u));
  top: calc(548 * var(--u));
  right: calc(560 * var(--u));
  display: grid;
  grid-template-columns: auto 1fr;
  gap: calc(44 * var(--u)) calc(28 * var(--u));
  margin: 0;
  font-size: calc(62 * var(--u));
  line-height: 1.15;
  text-align: left;
}

.hc-fields dt {
  text-transform: uppercase;
  color: #fff;
}

.hc-fields dd {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #EAB77A;
}

.hc-qr {
  position: absolute;
  left: calc(1263 * var(--u));
  top: calc(791 * var(--u));
  width: calc(294 * var(--u));
}

.hc-qr :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
