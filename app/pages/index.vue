<template>
  <div class="yana-page">
    <!-- ===================== HERO ===================== -->
    <header id="home" class="hero">
      <div class="hero-img" :class="{ 'no-zoom': !heroKenBurns }" :style="{ backgroundImage: `url('${heroImage}')` }" />
      <div class="hero-scrim" />
      <div class="hero-content">
        <div v-reveal="{ y: 24, duration: 1.1 }">
          <span class="hero-eyebrow">
            <span class="rule rule-left" />Peruvian &middot; Pan-Asian Kitchen<span class="rule rule-right" />
          </span>
        </div>
        <h1 v-reveal="{ y: 28, duration: 1.2, delay: 0.12 }" class="hero-title">Fire &amp; Sea</h1>
        <p v-reveal="{ y: 24, duration: 1.2, delay: 0.2 }" class="hero-locale">Saadiyat Island &middot; Abu Dhabi</p>
        <p v-reveal="{ y: 24, duration: 1.2, delay: 0.24 }" class="hero-sub">Where the shores of Peru meet the fire of the East.</p>
        <div v-reveal="{ y: 24, duration: 1.2, delay: 0.38 }" class="hero-cta-wrap">
          <NuxtLink to="/reservation" class="btn-gold-hero">Reserve a Table</NuxtLink>
        </div>
      </div>
      <div class="yana-scroll-cue scroll-cue">
        <span class="scroll-label">Scroll</span>
        <span class="scroll-bar" />
      </div>
    </header>

    <div aria-hidden="true" class="hero-transition" />

    <!-- ===================== STORY ===================== -->
    <section id="story" class="section-pad section-light">
      <span aria-hidden="true" class="ghost-word ghost-left">PERU</span>
      <div class="story-grid">
        <div v-reveal="{ y: 30 }" class="story-image-wrap">
          <div class="story-image" :style="{ backgroundImage: `url('${sideImage}')` }">
            <div class="frame-border" />
          </div>
        </div>
        <div v-reveal="{ y: 30, delay: 0.15 }" class="story-text">
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />01 — Our Story</span>
          <h2 class="h2-dark">Two coastlines,<br>one table.</h2>
          <p class="body-copy">YANA is a meeting of distant shores — the citrus-bright kitchens of coastal Peru and the quiet mastery of Pan-Asian cuisine. Set against the hush of Saadiyat Island, each plate is an invitation to linger over fire, sea and spice long into the Abu Dhabi night.</p>
          <p class="body-copy" style="margin-top: 20px;">We cook over open flame, pour with intention, and treat every evening as a slow, deliberate occasion.</p>
          <p class="story-signoff">— The House of YANA</p>
        </div>
      </div>
    </section>

    <div class="divider-flourish" />

    <!-- ===================== SIGNATURE DISHES ===================== -->
    <section id="dishes" class="section-pad section-light">
      <span aria-hidden="true" class="ghost-word ghost-right">CUISINE</span>
      <div v-reveal class="dishes-intro">
        <span class="eyebrow eyebrow-dark"><span class="rule-short" />02 — The Menu</span>
        <h2 class="h2-dark">Signature plates</h2>
        <p class="body-copy-sm">A selection from our nightly kitchen — Nikkei precision, Peruvian soul and the smoke of the Josper grill. Swipe to explore.</p>
      </div>
      <div v-reveal class="dish-controls">
        <button aria-label="Previous dish" class="icon-btn" @click="scrollDishes(-1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="15 5 8 12 15 19" /></svg>
        </button>
        <button aria-label="Next dish" class="icon-btn" @click="scrollDishes(1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="9 5 16 12 9 19" /></svg>
        </button>
      </div>
      <div id="yana-dish-track" ref="dishTrack" class="dish-track">
        <div v-for="dish in dishes" :key="dish.name" class="dish-card">
          <div class="dish-image" :style="{ background: dish.gradient }">
            <div class="frame-border frame-border--tint" />
          </div>
          <h3 class="dish-name">{{ dish.name }}</h3>
          <p class="dish-desc">{{ dish.desc }}</p>
        </div>
      </div>
      <div v-reveal class="dishes-cta">
        <NuxtLink to="/menu" class="btn-outline">Show All Dishes</NuxtLink>
      </div>
    </section>

    <!-- ===================== EXPERIENCE ===================== -->
    <section id="experience" class="experience-section">
      <div aria-hidden="true" class="pattern-dark pattern-dark--tall" />
      <div aria-hidden="true" class="pattern-dark pattern-dark--square" />
      <span aria-hidden="true" class="ghost-word ghost-word--light ghost-bottom-left">AMBIANCE</span>
      <div class="experience-inner">
        <div v-reveal class="experience-intro">
          <span class="eyebrow eyebrow-light"><span class="rule-short" />03 — The Experience</span>
          <h2 class="h2-light">Dusk, gold and open fire</h2>
          <p class="body-copy-sm body-copy-sm--dark">A dining room wrapped in deep blue and brass, and a bar where the pisco flows late. YANA is made for evenings that unfold slowly.</p>
        </div>
        <div class="experience-grid">
          <div v-reveal="{ y: 34 }" class="experience-card">
            <div class="experience-card-bg experience-card-bg--a" />
            <div class="experience-card-scrim" />
            <div class="experience-card-caption">
              <span class="micro-label">The Dining Room</span>
              <p class="experience-card-title">Blue, brass &amp; candlelight</p>
            </div>
          </div>
          <div v-reveal="{ y: 34, delay: 0.16 }" class="experience-card">
            <div class="experience-card-bg experience-card-bg--b" />
            <div class="experience-card-scrim" />
            <div class="experience-card-caption">
              <span class="micro-label">The Bar</span>
              <p class="experience-card-title">The Pisco Lounge</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== QUOTE ===================== -->
    <section class="quote-section">
      <div v-reveal class="quote-inner">
        <span class="quote-glyph">&ldquo;</span>
        <p class="quote-text">A rare place where the fire of Lima and the calm of the East share one table — every course feels like an occasion.</p>
        <div class="quote-attr">
          <span class="rule-short rule-short--center" />
          <span class="micro-label micro-label--dark">Abu Dhabi Fine Dining Review</span>
        </div>
      </div>
    </section>

    <!-- ===================== RESERVATION CTA ===================== -->
    <section id="reserve" class="cta-section">
      <div class="cta-bg" :style="{ backgroundImage: `url('${ctaImage}')` }" />
      <div class="cta-scrim" />
      <div v-reveal class="cta-content">
        <span class="eyebrow-plain">Reservations</span>
        <h2 class="cta-title">Reserve your evening<br>at YANA</h2>
        <p class="cta-copy">We recommend booking in advance to secure your table. Our team is happy to help with larger parties and special occasions.</p>
        <NuxtLink to="/reservation" class="btn-gold-hero btn-gold-hero--cta">Reserve a Table</NuxtLink>
        <p class="cta-phone">or call +971 2 447 6998</p>
      </div>
    </section>

    <!-- ===================== LOCATION & HOURS ===================== -->
    <section id="location" class="section-pad-tight section-light">
      <div class="location-grid">
        <div v-reveal>
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />04 — Visit</span>
          <h2 class="h2-dark h2-dark--tight">Find us on<br>Saadiyat Island</h2>
          <div class="location-details">
            <div>
              <span class="micro-label micro-label--dark">Address</span>
              <p class="location-address">Al Saadiyat Island<br>Abu Dhabi, United Arab Emirates</p>
            </div>
            <div class="location-rule" />
            <div>
              <span class="micro-label micro-label--dark">Opening Hours</span>
              <div class="hours-list">
                <div class="hours-row">
                  <span>Sunday — Thursday</span><span class="hours-time">9:00 AM — 10:00 PM</span>
                </div>
                <div class="hours-row">
                  <span>Friday</span><span class="hours-time">9:00 AM — 12:00 AM</span>
                </div>
                <div class="hours-row hours-row--last">
                  <span>Saturday</span><span class="hours-time">9:00 AM — 12:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-reveal="{ delay: 0.15 }" class="map-placeholder">
          <div class="map-grid" />
          <div class="frame-border" />
          <div class="map-pin">
            <span class="map-pin-dot" />
            <span class="map-pin-dot map-pin-pulse" />
          </div>
          <span class="map-pin-label">YANA · Saadiyat</span>
          <span class="map-caption">Map placeholder</span>
        </div>
      </div>
    </section>

    <!-- ===================== MARQUEE ===================== -->
    <div aria-hidden="true" class="marquee">
      <div class="marquee-track">
        <span class="marquee-text">Ceviche&nbsp;&middot;&nbsp;Nikkei&nbsp;&middot;&nbsp;Josper Grill&nbsp;&middot;&nbsp;Anticuchos&nbsp;&middot;&nbsp;Pisco Lounge&nbsp;&middot;&nbsp;Tiradito&nbsp;&middot;&nbsp;Wagyu&nbsp;&middot;&nbsp;</span>
        <span class="marquee-text">Ceviche&nbsp;&middot;&nbsp;Nikkei&nbsp;&middot;&nbsp;Josper Grill&nbsp;&middot;&nbsp;Anticuchos&nbsp;&middot;&nbsp;Pisco Lounge&nbsp;&middot;&nbsp;Tiradito&nbsp;&middot;&nbsp;Wagyu&nbsp;&middot;&nbsp;</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const heroImage = '/images/yana-image-2-mruiybvd-26zk.webp'
const sideImage = '/images/yana-side-image-mrt8vz5a-90ny.webp'
const ctaImage = '/images/yana-image-2-mrt9pbly-db2c.webp'
const heroKenBurns = true

const dishTrack = ref<HTMLElement | null>(null)

const dishes = [
  { name: 'Nikkei Tiradito', desc: "Yellowtail, aji amarillo tiger's milk, yuzu and a whisper of gold leaf.", gradient: 'radial-gradient(90% 80% at 80% 100%, rgba(217,182,144,.22), transparent 55%), linear-gradient(160deg, #F3ECE1, #EAD9BF 74%)' },
  { name: 'Anticuchos de Wagyu', desc: 'Charcoal-grilled wagyu skewers, panca glaze and smoked lime.', gradient: 'radial-gradient(90% 80% at 15% 100%, rgba(217,182,144,.24), transparent 55%), linear-gradient(150deg, #F6EFE4, #EAD9BF 74%)' },
  { name: 'Josper Black Cod', desc: 'Miso-lacquered black cod, roasted sweet potato and shiso.', gradient: 'radial-gradient(80% 80% at 90% 90%, rgba(217,182,144,.22), transparent 55%), linear-gradient(165deg, #F3ECE1, #EAD9BF 74%)' },
  { name: 'Ceviche YANA', desc: 'Sea bass, leche de tigre, crisp cancha, red onion and coriander oil.', gradient: 'radial-gradient(90% 80% at 12% 92%, rgba(217,182,144,.24), transparent 55%), linear-gradient(155deg, #F6EFE4, #EAD9BF 74%)' },
  { name: 'Lomo Saltado', desc: 'Wok-seared beef tenderloin, soy, vine tomato and crisp golden potato.', gradient: 'radial-gradient(90% 80% at 80% 100%, rgba(217,182,144,.22), transparent 55%), linear-gradient(158deg, #F3ECE1, #EAD9BF 74%)' },
  { name: 'Salmón Nikkei', desc: 'Torched salmon, den miso, jalapeño and a lift of kizami wasabi.', gradient: 'radial-gradient(90% 80% at 95% 85%, rgba(217,182,144,.24), transparent 55%), linear-gradient(150deg, #F6EFE4, #EAD9BF 74%)' },
  { name: 'Pulpo al Josper', desc: 'Grilled octopus, botija olive, aji panca and purple Andean potato.', gradient: 'radial-gradient(90% 80% at 10% 90%, rgba(217,182,144,.22), transparent 55%), linear-gradient(162deg, #F3ECE1, #EAD9BF 74%)' }
]

function scrollDishes(dir: number) {
  const track = dishTrack.value
  if (!track) return
  const card = track.querySelector('.dish-card') as HTMLElement | null
  const width = card ? card.getBoundingClientRect().width : 280
  const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '24') || 24
  track.scrollBy({ left: dir * (width + gap), behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.hero-img {
  position: absolute;
  inset: -6%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  animation: yanaZoom 24s ease-in-out infinite alternate;
}

.hero-img.no-zoom {
  animation: none;
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.55) 0%, rgba(15, 30, 46, 0.12) 34%, rgba(15, 30, 46, 0.6) 68%, #0f1e2e 92%, #0f1e2e 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 80px 24px 120px;
  max-width: 900px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold-lt);
  font-weight: 400;
}

.rule {
  width: 40px;
  height: 1px;
}

.rule-left {
  background: linear-gradient(90deg, transparent, var(--gold));
}

.rule-right {
  background: linear-gradient(90deg, var(--gold), transparent);
}

.hero-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(56px, 12vw, 152px);
  line-height: 0.98;
  margin: 26px 0 0;
  letter-spacing: 0.02em;
  color: #ffffff;
}

.hero-locale {
  font-size: 11px;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin: 20px 0 0;
}

.hero-sub {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(18px, 3.2vw, 27px);
  color: rgba(255, 255, 255, 0.9);
  margin: 22px 0 0;
  letter-spacing: 0.02em;
}

.hero-cta-wrap {
  margin-top: 42px;
}

.btn-gold-hero {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--blue-dk);
  background: var(--gold);
  padding: 19px 44px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid var(--gold);
}

.btn-gold-hero:hover {
  background: transparent;
  color: #ffffff;
}

.scroll-cue {
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.scroll-label {
  font-size: 9.5px;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

.scroll-bar {
  display: block;
  width: 1px;
  height: 54px;
  background: linear-gradient(var(--gold), transparent);
  animation: yanaScroll 2.6s ease-in-out infinite;
}

.hero-transition {
  height: clamp(130px, 16vh, 210px);
  background: linear-gradient(180deg, #0f1e2e 0%, #0d1f38 32%, var(--ground) 100%);
}

.section-pad {
  scroll-margin-top: 80px;
  position: relative;
  overflow: hidden;
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(84px, 13vw, 168px) clamp(20px, 5vw, 64px);
}

.section-pad-tight {
  scroll-margin-top: 80px;
  position: relative;
  overflow: hidden;
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(84px, 13vw, 150px) clamp(20px, 5vw, 64px);
}

.pattern-light {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.25) contrast(1.1);
  opacity: 0.55;
  pointer-events: none;
}

.ghost-word {
  position: absolute;
  top: clamp(24px, 5vw, 72px);
  font-family: var(--serif);
  font-size: clamp(80px, 17vw, 250px);
  line-height: 0.8;
  color: rgba(18, 66, 109, 0.05);
  font-weight: 500;
  letter-spacing: 0.03em;
  pointer-events: none;
  white-space: nowrap;
}

.ghost-left {
  left: -1.5vw;
  font-size: clamp(88px, 20vw, 250px);
}

.ghost-right {
  right: -1.5vw;
}

.ghost-word--light {
  color: rgba(255, 255, 255, 0.06);
}

.ghost-bottom-left {
  bottom: clamp(24px, 5vw, 60px);
  top: auto;
  left: -1.5vw;
}

.story-grid {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(40px, 6vw, 84px);
  align-items: center;
}

.story-image-wrap {
  flex: 1 1 360px;
  min-width: 300px;
}

.story-image {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.frame-border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.frame-border--tint {
  border-color: rgba(217, 182, 144, 0.24);
}

.story-text {
  flex: 1 1 380px;
  min-width: 300px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  font-weight: 400;
}

.eyebrow-dark {
  color: var(--gold-dk);
}

.eyebrow-light {
  color: var(--gold-lt);
}

.rule-short {
  width: 34px;
  height: 1px;
  background: var(--gold);
  display: inline-block;
}

.rule-short--center {
  width: 44px;
}

.h2-dark {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.06;
  margin: 24px 0 0;
  color: var(--ink);
}

.h2-dark--tight {
  font-size: clamp(32px, 4.5vw, 50px);
  line-height: 1.08;
  margin-top: 22px;
}

.h2-light {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.06;
  margin: 22px 0 0;
  color: #ffffff;
}

.body-copy {
  font-size: 15.5px;
  line-height: 2;
  color: var(--ink-dim);
  margin: 28px 0 0;
  max-width: 52ch;
  font-weight: 300;
}

.body-copy-sm {
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink-dim);
  margin: 22px 0 0;
  font-weight: 300;
}

.body-copy-sm--dark {
  color: var(--cream-dim);
}

.story-signoff {
  font-family: var(--serif);
  font-style: italic;
  font-size: 22px;
  color: var(--gold-dk);
  margin: 34px 0 0;
}

.divider-flourish {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(217, 182, 144, 0.4), transparent);
  max-width: 1320px;
  margin: 0 auto;
}

.dishes-intro {
  position: relative;
  max-width: 640px;
}

.dish-controls {
  position: relative;
  margin-top: clamp(40px, 5vw, 60px);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: none;
  border: 1px solid rgba(217, 182, 144, 0.5);
  color: var(--gold-dk);
  cursor: pointer;
  transition: all 0.35s ease;
}

.icon-btn:hover {
  background: var(--gold);
  color: #ffffff;
  border-color: var(--gold);
}

.dish-track {
  position: relative;
  display: flex;
  gap: clamp(18px, 2vw, 28px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  margin-top: clamp(22px, 2.5vw, 30px);
  padding-bottom: 6px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dish-card {
  flex: 0 0 clamp(240px, 74vw, 300px);
  scroll-snap-align: start;
}

.dish-image {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.dish-name {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(23px, 2.4vw, 27px);
  margin: 24px 0 10px;
  color: var(--ink);
}

.dish-desc {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--ink-dim);
  margin: 0;
  font-weight: 300;
}

.dishes-cta {
  position: relative;
  margin-top: clamp(44px, 5vw, 64px);
  display: flex;
  justify-content: center;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold-dk);
  background: transparent;
  border: 1px solid var(--gold);
  padding: 18px 40px;
  text-decoration: none;
  transition: all 0.4s ease;
}

.btn-outline:hover {
  background: var(--gold);
  color: #ffffff;
}

.experience-section {
  scroll-margin-top: 80px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 0%, rgba(217, 182, 144, 0.14), transparent 55%), radial-gradient(100% 100% at 80% 120%, rgba(18, 66, 109, 0.6), transparent 60%), linear-gradient(180deg, #0f1e2e, #12426d 48%, #0f1e2e);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(84px, 13vw, 168px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  center: center;
  pointer-events: none;
}

.pattern-dark--tall {
  background: url('/images/yana-pattern-tall.png') center/cover no-repeat;
  opacity: 0.4;
  mix-blend-mode: screen;
}

.pattern-dark--square {
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
}

.pattern-dark--wide {
  background: url('/images/yana-pattern-wide.jpeg') center/cover no-repeat;
  opacity: 0.28;
  mix-blend-mode: screen;
}

.experience-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.experience-intro {
  max-width: 640px;
}

.experience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(20px, 3vw, 36px);
  margin-top: clamp(48px, 6vw, 72px);
}

.experience-card {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.experience-card-bg {
  position: absolute;
  inset: 0;
}

.experience-card-bg--a {
  background: radial-gradient(120% 90% at 30% 20%, rgba(18, 66, 109, 0.9), transparent 60%), linear-gradient(160deg, #12426d, #0f1e2e 74%);
}

.experience-card-bg--b {
  background: radial-gradient(120% 90% at 70% 25%, rgba(18, 66, 109, 0.9), transparent 60%), linear-gradient(150deg, #12426d, #0f1e2e 74%);
}

.experience-card-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(15, 30, 46, 0.82), transparent 55%);
}

.experience-card-caption {
  position: absolute;
  left: 28px;
  bottom: 26px;
  right: 28px;
}

.micro-label {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-lt);
}

.micro-label--dark {
  color: var(--gold-dk);
}

.experience-card-title {
  font-family: var(--serif);
  font-size: clamp(24px, 3vw, 32px);
  color: #ffffff;
  margin: 8px 0 0;
  font-weight: 400;
}

.quote-section {
  position: relative;
  overflow: hidden;
  padding: clamp(88px, 13vw, 150px) clamp(20px, 5vw, 64px);
}

.quote-inner {
  position: relative;
  max-width: 920px;
  margin: 0 auto;
  text-align: center;
}

.quote-glyph {
  font-family: var(--serif);
  font-size: 96px;
  line-height: 0.6;
  color: var(--gold);
  opacity: 0.6;
  display: block;
}

.quote-text {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(24px, 4vw, 42px);
  line-height: 1.4;
  color: var(--ink);
  margin: 14px 0 0;
}

.quote-attr {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cta-section {
  scroll-margin-top: 80px;
  position: relative;
  text-align: center;
  padding: clamp(96px, 15vw, 180px) clamp(20px, 5vw, 64px);
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.cta-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.82), rgba(15, 30, 46, 0.9));
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 760px;
  margin: 0 auto;
}

.eyebrow-plain {
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-lt);
  font-weight: 400;
}

.cta-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(38px, 6vw, 72px);
  line-height: 1.04;
  margin: 22px 0 0;
  color: #ffffff;
}

.cta-copy {
  font-size: 15px;
  line-height: 1.9;
  color: var(--cream-dim);
  margin: 26px auto 0;
  max-width: 44ch;
  font-weight: 300;
}

.btn-gold-hero--cta {
  margin-top: 40px;
  padding: 19px 46px;
}

.cta-phone {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--cream-dim);
  margin-top: 20px;
}

.location-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(36px, 5vw, 72px);
  align-items: stretch;
}

.location-details {
  margin-top: 38px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.location-address {
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink);
  margin: 12px 0 0;
  font-weight: 300;
}

.location-rule {
  height: 1px;
  background: rgba(217, 182, 144, 0.3);
}

.hours-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  font-size: 14px;
  color: var(--ink);
  font-weight: 300;
  border-bottom: 1px solid rgba(18, 66, 109, 0.12);
  padding-bottom: 9px;
}

.hours-row--last {
  border-bottom: none;
}

.hours-time {
  color: var(--ink-dim);
}

.map-placeholder {
  position: relative;
  min-height: 360px;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(217, 182, 144, 0.1) 1px, transparent 1px) 0 0 / 42px 42px, linear-gradient(90deg, rgba(217, 182, 144, 0.1) 1px, transparent 1px) 0 0 / 42px 42px, radial-gradient(circle at 50% 44%, rgba(18, 66, 109, 0.07), var(--panel));
}

.map-pin {
  position: absolute;
  left: 50%;
  top: 44%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
}

.map-pin-dot {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--gold);
}

.map-pin-pulse {
  animation: yanaPulse 2.6s ease-out infinite;
}

.map-pin-label {
  position: absolute;
  left: 50%;
  top: calc(44% + 22px);
  transform: translateX(-50%);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ink);
  white-space: nowrap;
}

.map-caption {
  position: absolute;
  left: 20px;
  bottom: 18px;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

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
  font-weight: 400;
  font-size: clamp(28px, 5vw, 58px);
  color: rgba(18, 66, 109, 0.14);
  letter-spacing: 0.02em;
  padding-right: 0.35em;
}
</style>
