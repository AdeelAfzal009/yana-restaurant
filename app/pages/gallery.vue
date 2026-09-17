<template>
  <div class="yana-page">
    <header class="gallery-banner">
      <div aria-hidden="true" class="banner-bg" />
      <div aria-hidden="true" class="banner-scrim" />
      <div class="banner-content">
        <span class="eyebrow-plain"><span class="rule-short" />Inside Yana</span>
        <h1 class="banner-title">Gallery</h1>
        <p class="banner-sub">The room, the plates, the evenings.</p>
      </div>
    </header>

    <!-- MOSAIC -->
    <section class="mosaic-section">
      <div class="mosaic-inner">
        <div class="mosaic-grid">
          <div class="mosaic-tile mosaic-tile--wide">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${heroImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${sideImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${menuCtaImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${aboutBannerImage}')` }" />
          </div>
          <div class="mosaic-tile mosaic-tile--wide">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${contactCtaImage}')` }" />
          </div>
          <div class="mosaic-tile mosaic-tile--placeholder mosaic-tile--placeholder-a">
            <ImagePlaceholder label="Dining room" />
          </div>
          <div class="mosaic-tile mosaic-tile--placeholder mosaic-tile--placeholder-b">
            <ImagePlaceholder label="Signature dish" />
          </div>
        </div>
      </div>
    </section>

    <!-- DARK BAND: THE ROOM -->
    <section class="room-section">
      <div aria-hidden="true" class="pattern-dark" />
      <div class="room-inner">
        <div class="room-intro">
          <span class="eyebrow-plain"><span class="rule-short" />The Room</span>
          <h2 class="h2-light">Blue, brass and candlelight</h2>
          <p class="body-copy-sm">A dining room wrapped in deep blue and brass, and a bar where the evening runs late.</p>
        </div>
        <div class="room-grid">
          <div v-for="room in rooms" :key="room.label" class="room-tile" :style="{ background: room.gradient }">
            <ImagePlaceholder :label="room.label" />
          </div>
        </div>
      </div>
    </section>

    <!-- SOCIAL -->
    <section class="social-section">
      <div class="social-inner">
        <span class="handle">@yanarestaurants</span>
        <h2 class="h2-dark">More on Instagram</h2>
        <p class="body-copy-sm body-copy-sm--dark">New plates, new evenings — posted as they happen.</p>
        <a href="https://www.instagram.com/yanarestaurants/" target="_blank" rel="noopener" class="btn-outline">Follow Yana</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const heroImage = '/images/yana-image-2-mruiybvd-26zk.webp'
const sideImage = '/images/yana-side-image-mrt8vz5a-90ny.webp'
const menuCtaImage = '/images/yana-image-3-mrt9rmoi-9m3z.webp'
const aboutBannerImage = '/images/yana-image-4-mrt9n45r-v3w7.webp'
const contactCtaImage = '/images/yana-image-4-mrt9r8ad-uvfn.webp'

const rooms = [
  { label: 'Dining room, wide', gradient: 'linear-gradient(160deg, #12426d, #0f1e2e 74%)' },
  { label: 'The bar', gradient: 'linear-gradient(150deg, #12426d, #0f1e2e 74%)' },
  { label: 'Terrace at dusk', gradient: 'linear-gradient(165deg, #12426d, #0f1e2e 74%)' },
  { label: 'Private dining', gradient: 'linear-gradient(155deg, #12426d, #0f1e2e 74%)' }
]
</script>

<style scoped>
.gallery-banner {
  position: relative;
  overflow: hidden;
  min-height: clamp(380px, 52vh, 520px);
  display: flex;
  align-items: flex-end;
  background: #0f1e2e;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-wide.jpeg') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.68), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.94));
}

.banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) clamp(46px, 6vw, 74px);
}

.eyebrow-plain {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-lt);
  font-weight: 400;
}

.rule-short {
  width: 34px;
  height: 1px;
  background: var(--gold);
  display: inline-block;
}

.banner-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(44px, 9vw, 104px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.banner-sub {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(19px, 3vw, 28px);
  color: rgba(255, 255, 255, 0.9);
  margin: 16px 0 0;
}

.mosaic-section {
  position: relative;
  overflow: hidden;
  padding: clamp(64px, 9vw, 120px) clamp(20px, 5vw, 64px);
}

.pattern-light {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.25) contrast(1.1);
  opacity: 0.55;
  pointer-events: none;
}

.mosaic-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

.mosaic-tile {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.mosaic-tile--wide {
  grid-column: span 2;
  aspect-ratio: 16 / 10;
}

.mosaic-tile-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.mosaic-tile--placeholder-a {
  background: linear-gradient(160deg, #f3ece1, #ead9bf 74%);
}

.mosaic-tile--placeholder-b {
  background: linear-gradient(150deg, #f3ece1, #ead9bf 74%);
}

.room-section {
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 0%, rgba(217, 182, 144, 0.14), transparent 55%), linear-gradient(180deg, #0f1e2e, #12426d 50%, #0f1e2e);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(72px, 10vw, 132px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.room-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.room-intro {
  max-width: 620px;
}

.h2-light {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(30px, 4.6vw, 54px);
  line-height: 1.06;
  margin: 22px 0 0;
  color: #ffffff;
}

.body-copy-sm {
  font-size: 15px;
  line-height: 1.9;
  color: var(--cream-dim);
  margin: 20px 0 0;
}

.body-copy-sm--dark {
  color: var(--ink-dim);
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(12px, 1.6vw, 20px);
  margin-top: clamp(40px, 5vw, 64px);
}

.room-tile {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.social-section {
  position: relative;
  overflow: hidden;
  padding: clamp(72px, 10vw, 132px) clamp(20px, 5vw, 64px);
  text-align: center;
}

.social-inner {
  position: relative;
  max-width: 620px;
  margin: 0 auto;
}

.handle {
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.h2-dark {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(30px, 4.6vw, 52px);
  line-height: 1.08;
  margin: 20px 0 0;
  color: var(--ink);
}

.btn-outline {
  display: inline-block;
  margin-top: 34px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold-dk);
  background: transparent;
  border: 1px solid var(--gold);
  padding: 18px 42px;
  text-decoration: none;
  transition: all 0.4s ease;
}

.btn-outline:hover {
  background: var(--gold);
  color: #ffffff;
}
</style>
