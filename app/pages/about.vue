<template>
  <div class="yana-page">
    <header class="about-banner">
      <div aria-hidden="true" class="banner-bg" />
      <div aria-hidden="true" class="banner-scrim" />
      <div class="banner-content">
        <span class="eyebrow-plain"><span class="rule-short" />About Yana</span>
        <h1 class="banner-title">About us</h1>
      </div>
    </header>

    <!-- A NEW STANDARD -->
    <section class="standard-section">
      <div class="standard-grid">
        <div class="standard-text">
          <span class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />About Yana</span>
          <h2 class="h2-dark">A New Standard of Dining in Saadiyat</h2>
          <p class="body-copy">YANA is a contemporary dining destination inspired by the vibrant fusion of <strong class="strong-ink">Asian and Latin flavors</strong>, crafted for those who appreciate refined taste and warm hospitality. Located on Saadiyat Island, YANA blends modern elegance with a welcoming atmosphere, offering dishes that are bold in flavor, beautifully presented, and made to be remembered.</p>
          <p class="body-copy" style="margin-top: 20px;">From the kitchen to the table, every detail at YANA reflects our passion for creativity, quality, and exceptional service. Whether you're joining us for a casual meal or a special gathering, our goal is to make every visit feel unique, effortless, and unforgettable.</p>
        </div>
        <div class="standard-image-wrap">
          <div class="standard-image" :style="{ backgroundImage: `url('${sideImage}')` }">
            <div class="frame-border" />
          </div>
        </div>
      </div>
    </section>

    <!-- FOUNDER -->
    <section class="founder-section">
      <div aria-hidden="true" class="pattern-dark" />
      <div class="founder-inner">
        <div class="founder-intro">
          <span class="eyebrow-plain"><span class="rule-short" />Our Founder</span>
          <h2 class="h2-light">Message from the Founder</h2>
        </div>
        <div class="founder-grid">
          <div class="founder-portrait founder-portrait--a">
            <ImagePlaceholder label="Founder portrait (DSC00908)" />
          </div>
          <div class="founder-portrait founder-portrait--b">
            <ImagePlaceholder label="Founder portrait (DSC01258)" />
          </div>
          <div class="founder-quote-cell">
            <span class="quote-glyph">&ldquo;</span>
            <p class="quote-text">Every plate that leaves our kitchen should feel like an occasion — that is the standard we hold ourselves to.</p>
            <div class="quote-attr">
              <span class="rule-short rule-short--center" />
              <span class="eyebrow-plain">Founder, YANA Restaurant</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MISSION / VISION / CORE -->
    <section class="pillars-section">
      <div class="pillars-grid">
        <div v-for="pillar in pillars" :key="pillar.title" class="pillar">
          <span class="pillar-label">{{ pillar.title }}</span>
          <p class="pillar-copy">{{ pillar.copy }}</p>
        </div>
      </div>
    </section>

    <!-- EXPERIENCE -->
    <section class="about-experience-section">
      <div class="about-experience-grid">
        <div class="about-experience-image-wrap">
          <div class="about-experience-image">
            <ImagePlaceholder label="Dining room photograph (DSC00837)" />
          </div>
        </div>
        <div class="about-experience-text">
          <span class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />Experience</span>
          <h2 class="h2-dark">Refined Dining, Elevated Atmosphere</h2>
          <p class="body-copy">At YANA, we've created a dining experience where flavor, design, and comfort come together seamlessly. From our curated menu to the ambiance and service, everything is designed to celebrate good food and good moments.</p>
          <p class="body-copy" style="margin-top: 20px;">Our chefs merge culinary craftsmanship with global inspiration, while our service team ensures every guest feels welcomed and valued. Whether it's a relaxed lunch or an elegant dinner, YANA offers the perfect setting for every occasion.</p>
          <div class="stats-row">
            <div class="stat">
              <span class="stat-number">40+</span>
              <p class="stat-label">Signature Dishes</p>
            </div>
            <div class="stat">
              <span class="stat-number">120+</span>
              <p class="stat-label">Seating Capacity</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div aria-hidden="true" class="cta-bg" />
      <div aria-hidden="true" class="cta-scrim" />
      <div class="cta-content">
        <span class="eyebrow-plain">Reservations</span>
        <h2 class="cta-title">Visit Yana Restaurant</h2>
        <NuxtLink to="/reservation" class="btn-gold">Reserve Now</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const sideImage = '/images/yana-side-image-mrt8vz5a-90ny.webp'

const pillars = [
  { title: 'Mission', copy: 'At YANA, our mission is to create refined dining experiences that blend bold flavors, thoughtful craftsmanship, and warm hospitality—bringing together Pan-Asian precision with Peruvian.' },
  { title: 'Vision', copy: 'To become a leading destination for contemporary fusion dining in Abu Dhabi, where cuisine, atmosphere, and culture meet to create memorable moments beyond the table.' },
  { title: 'Core', copy: 'We believe in quality without compromise, creativity with purpose, and consistency in experience. Every dish, interaction, and space is guided by authenticity, and elegance.' }
]
</script>

<style scoped>
.about-banner {
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
  background: url('/images/yana-image-4-mrt9n45r-v3w7.webp') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.7), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.94));
}

.banner-pattern {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.22;
  mix-blend-mode: screen;
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

.eyebrow-plain--dark {
  color: var(--gold-dk);
  letter-spacing: 0.32em;
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

.banner-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(44px, 9vw, 104px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.standard-section {
  position: relative;
  overflow: hidden;
  padding: clamp(76px, 11vw, 150px) clamp(20px, 5vw, 64px);
}

.pattern-light {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.25) contrast(1.1);
  opacity: 0.55;
  pointer-events: none;
}

.standard-grid {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(40px, 6vw, 84px);
  align-items: center;
}

.standard-text {
  flex: 1 1 380px;
  min-width: 300px;
}

.h2-dark {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.06;
  margin: 24px 0 0;
  color: var(--ink);
}

.h2-light {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 1.06;
  margin: 22px 0 0;
  color: #ffffff;
}

.body-copy {
  font-size: 15.5px;
  line-height: 2;
  color: var(--ink-dim);
  margin: 28px 0 0;
  max-width: 54ch;
}

.strong-ink {
  font-weight: 500;
  color: var(--ink);
}

.standard-image-wrap {
  flex: 1 1 340px;
  min-width: 280px;
}

.standard-image {
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

.founder-section {
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 0%, rgba(217, 182, 144, 0.14), transparent 55%), linear-gradient(180deg, #0f1e2e, #12426d 50%, #0f1e2e);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(76px, 11vw, 150px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.founder-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.founder-intro {
  max-width: 620px;
}

.founder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(20px, 3vw, 36px);
  margin-top: clamp(40px, 5vw, 64px);
}

.founder-portrait {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.founder-portrait--a {
  background: linear-gradient(160deg, #12426d, #0f1e2e 74%);
}

.founder-portrait--b {
  background: linear-gradient(150deg, #12426d, #0f1e2e 74%);
}

.founder-quote-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(8px, 2vw, 20px) 0;
}

.quote-glyph {
  font-family: var(--serif);
  font-size: 76px;
  line-height: 0.5;
  color: var(--gold);
  opacity: 0.6;
}

.quote-text {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(20px, 2.6vw, 28px);
  line-height: 1.45;
  color: #ffffff;
  margin: 16px 0 0;
}

.quote-attr {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pillars-section {
  position: relative;
  overflow: hidden;
  padding: clamp(76px, 11vw, 150px) clamp(20px, 5vw, 64px);
}

.pillars-grid {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(32px, 4vw, 60px);
}

.pillar {
  border-top: 1px solid rgba(217, 182, 144, 0.5);
  padding-top: 26px;
}

.pillar-label {
  font-size: 10.5px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.pillar-copy {
  font-size: 15.5px;
  line-height: 1.95;
  color: var(--ink-dim);
  margin: 18px 0 0;
}

.about-experience-section {
  position: relative;
  overflow: hidden;
  padding: 0 clamp(20px, 5vw, 64px) clamp(76px, 11vw, 150px);
}

.about-experience-grid {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(40px, 6vw, 84px);
  align-items: center;
}

.about-experience-image-wrap {
  flex: 1 1 340px;
  min-width: 280px;
  order: 2;
}

.about-experience-image {
  position: relative;
  aspect-ratio: 5 / 6;
  overflow: hidden;
  border: 1px solid rgba(217, 182, 144, 0.28);
  background: linear-gradient(160deg, #f3ece1, #ead9bf 74%);
}

.about-experience-text {
  flex: 1 1 380px;
  min-width: 300px;
  order: 1;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(32px, 5vw, 64px);
  margin-top: 44px;
}

.stat {
  border-top: 1px solid rgba(217, 182, 144, 0.5);
  padding-top: 18px;
}

.stat-number {
  font-family: var(--serif);
  font-size: clamp(40px, 6vw, 62px);
  line-height: 1;
  color: var(--gold-dk);
  font-weight: 400;
}

.stat-label {
  font-size: 10.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ink-dim);
  margin: 10px 0 0;
}

.cta-section {
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: clamp(80px, 12vw, 150px) clamp(20px, 5vw, 64px);
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: url('/images/yana-image-2-mrt9pbly-db2c.webp') center/cover no-repeat;
}

.cta-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.84), rgba(15, 30, 46, 0.92));
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(34px, 5.6vw, 66px);
  line-height: 1.06;
  margin: 20px 0 0;
  color: #ffffff;
}

.btn-gold {
  display: inline-block;
  margin-top: 38px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #0f1e2e;
  background: var(--gold);
  padding: 19px 46px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid var(--gold);
}

.btn-gold:hover {
  background: transparent;
  color: #ffffff;
}
</style>
