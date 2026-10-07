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
          <button
            v-for="(photo, i) in photos"
            :key="photo.src"
            type="button"
            class="mosaic-tile"
            :class="photo.landscape ? 'mosaic-tile--landscape' : 'mosaic-tile--portrait'"
            :aria-label="`Open photo: ${photo.alt}`"
            @click="openPhoto(i)"
          >
            <img :src="photo.src" :alt="photo.alt" class="mosaic-img" loading="lazy" decoding="async">
            <span aria-hidden="true" class="mosaic-zoom">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
            </span>
          </button>
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
    <!-- LIGHTBOX -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="activePhoto !== null"
          class="lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="`Photo ${activePhoto + 1} of ${photos.length}`"
          @click.self="closePhoto"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <button type="button" class="lightbox-close" aria-label="Close" @click="closePhoto">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>
          <button type="button" class="lightbox-arrow lightbox-arrow--prev" aria-label="Previous photo" @click="stepPhoto(-1)">
            <svg width="26" height="14" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 6H1M6 1 1 6l5 5" /></svg>
          </button>
          <figure class="lightbox-figure">
            <Transition name="lightbox-img" mode="out-in">
              <img :key="photos[activePhoto].src" :src="photos[activePhoto].src" :alt="photos[activePhoto].alt" class="lightbox-img">
            </Transition>
            <figcaption class="lightbox-caption">
              <span class="lightbox-count">{{ String(activePhoto + 1).padStart(2, '0') }} / {{ String(photos.length).padStart(2, '0') }}</span>
              <span>{{ photos[activePhoto].alt }}</span>
            </figcaption>
          </figure>
          <button type="button" class="lightbox-arrow lightbox-arrow--next" aria-label="Next photo" @click="stepPhoto(1)">
            <svg width="26" height="14" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 6h20M16 1l5 5-5 5" /></svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Gallery photos in display order, with their real pixel size. Landscape
// photos get a wide tile; portrait and square photos get a portrait tile.
const photos = [
  { src: '/images/web/gallery-seafront.jpg', alt: 'Palms along the Saadiyat seafront at dusk', w: 1600, h: 1200 },
  { src: '/images/yana-side-image-mrt8vz5a-90ny.webp', alt: 'The YANA dining room', w: 816, h: 1020 },
  { src: '/images/yana-image-3-mrt9rmoi-9m3z.webp', alt: 'The terrace by the water', w: 765, h: 1020 },
  { src: '/images/yana-image-4-mrt9n45r-v3w7.webp', alt: 'The entrance to YANA', w: 765, h: 1020 },
  { src: '/images/yana-image-2-mruiybvd-26zk.webp', alt: 'Deep blue banquettes and brass lights', w: 816, h: 1020 },
  { src: '/images/web/gallery-banquette.jpg', alt: 'Blue velvet banquettes', w: 1120, h: 1400 },
  { src: '/images/web/gallery-dining-room.jpg', alt: 'The dining room and its blue carpet', w: 787, h: 1400 },
  { src: '/images/web/gallery-evening.jpg', alt: 'An evening of live music', w: 1120, h: 1400 },
  { src: '/images/web/gallery-marina.jpg', alt: 'The marina view from the terrace', w: 1050, h: 1400 }
].map(photo => ({ ...photo, landscape: photo.w > photo.h }))

const activePhoto = ref<number | null>(null)

function openPhoto(i: number) {
  activePhoto.value = i
}

function closePhoto() {
  activePhoto.value = null
}

// Moves through the photos, wrapping at either end.
function stepPhoto(dir: 1 | -1) {
  if (activePhoto.value === null) return
  activePhoto.value = (activePhoto.value + dir + photos.length) % photos.length
}

function onKeydown(e: KeyboardEvent) {
  if (activePhoto.value === null) return
  if (e.key === 'Escape') closePhoto()
  else if (e.key === 'ArrowRight') stepPhoto(1)
  else if (e.key === 'ArrowLeft') stepPhoto(-1)
}

// Swipe left/right on phones.
let touchX = 0
function onTouchStart(e: TouchEvent) {
  touchX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) > 50) stepPhoto(dx < 0 ? 1 : -1)
}

watch(activePhoto, (val) => {
  document.body.style.overflow = val === null ? '' : 'hidden'
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

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

/* 5 columns on desktop, 2 on tablet and phone. Landscape tiles span two
   columns at 16:10 and portrait tiles take one at 4:5, so a landscape tile
   lines up with the portraits beside it. "dense" back-fills gaps. */
.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-flow: dense;
  align-items: start;
  gap: clamp(10px, 1.4vw, 18px);
}

.mosaic-tile {
  position: relative;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(217, 182, 144, 0.28);
  background: var(--panel-dk);
  cursor: zoom-in;
}

.mosaic-tile--portrait {
  aspect-ratio: 4 / 5;
}

.mosaic-tile--landscape {
  grid-column: span 2;
  aspect-ratio: 16 / 10;
}

.mosaic-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s ease;
}

.mosaic-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(8, 23, 42, 0.32);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.mosaic-zoom {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  color: #ffffff;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.85);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.mosaic-tile:hover .mosaic-img,
.mosaic-tile:focus-visible .mosaic-img {
  transform: scale(1.05);
}

.mosaic-tile:hover::after,
.mosaic-tile:focus-visible::after {
  opacity: 1;
}

.mosaic-tile:hover .mosaic-zoom,
.mosaic-tile:focus-visible .mosaic-zoom {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.mosaic-tile:focus-visible {
  outline: 1px solid var(--gold-dk);
  outline-offset: 3px;
}

@media (max-width: 1100px) {
  .mosaic-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ---------- Lightbox ---------- */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(56px, 8vh, 90px) clamp(12px, 7vw, 110px);
  background: rgba(6, 14, 24, 0.94);
  font-family: var(--sans);
}

.lightbox-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
}

.lightbox-img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 2 * clamp(56px, 8vh, 90px) - 48px);
  max-height: calc(100dvh - 2 * clamp(56px, 8vh, 90px) - 48px);
  object-fit: contain;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.lightbox-count {
  font-weight: 600;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}

.lightbox-close,
.lightbox-arrow {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.lightbox-close {
  top: clamp(14px, 3vh, 28px);
  right: clamp(14px, 3vw, 32px);
  width: 48px;
  height: 48px;
  border: none;
}

.lightbox-close:hover {
  color: var(--gold);
}

.lightbox-arrow {
  top: 50%;
  width: 56px;
  height: 56px;
  margin-top: -28px;
  border: 1px solid rgba(217, 182, 144, 0.5);
  border-radius: 50%;
}

.lightbox-arrow:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--blue-dk);
}

.lightbox-arrow--prev {
  left: clamp(10px, 2.5vw, 36px);
}

.lightbox-arrow--next {
  right: clamp(10px, 2.5vw, 36px);
}

/* On phones the arrows sit under the photo instead of over it. */
@media (max-width: 640px) {
  .lightbox {
    padding: 64px 12px 96px;
  }

  .lightbox-arrow {
    top: auto;
    bottom: 22px;
    margin-top: 0;
    width: 50px;
    height: 50px;
  }

  .lightbox-arrow--prev {
    left: calc(50% - 62px);
  }

  .lightbox-arrow--next {
    right: calc(50% - 62px);
  }

  .lightbox-img {
    max-height: calc(100dvh - 210px);
  }

  .lightbox-caption {
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.35s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-img-enter-active,
.lightbox-img-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-img-enter-from,
.lightbox-img-leave-to {
  opacity: 0;
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
