<template>
  <div class="yana-page">
    <header class="gallery-banner">
      <div aria-hidden="true" class="banner-bg" />
      <div aria-hidden="true" class="banner-scrim" />
      <div aria-hidden="true" class="banner-fade" />
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
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${seafrontImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${banquetteImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${diningRoomImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${eveningImage}')` }" />
          </div>
          <div class="mosaic-tile">
            <div class="mosaic-tile-bg" :style="{ backgroundImage: `url('${marinaImage}')` }" />
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
const seafrontImage = '/images/web/gallery-seafront.jpg'
const banquetteImage = '/images/web/gallery-banquette.jpg'
const diningRoomImage = '/images/web/gallery-dining-room.jpg'
const eveningImage = '/images/web/gallery-evening.jpg'
const marinaImage = '/images/web/gallery-marina.jpg'

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
  min-height: clamp(494px, 67.6vh, 676px);
  display: flex;
  align-items: center;
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
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.68), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.4));
}

.banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 88px clamp(20px, 5vw, 64px) 0;
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

.room-section {
  position: relative;
  overflow: hidden;
  /* Same deep midnight sapphire as the homepage Pisco Bar band, with the
     light pool centred behind the content. */
  background:
    radial-gradient(55% 60% at 50% 55%, rgba(52, 106, 170, 0.38), transparent 72%),
    radial-gradient(120% 70% at 50% 0%, rgba(217, 182, 144, 0.09), transparent 55%),
    linear-gradient(180deg, #08172a 0%, #0d2440 50%, #08172a 100%);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(72px, 10vw, 132px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.12;
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
  font-weight: 600;
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
