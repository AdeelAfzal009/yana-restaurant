<template>
  <div class="yana-page">
    <header class="about-banner">
      <div aria-hidden="true" class="banner-bg" :style="bg(c.banner.image.src)" />
      <div aria-hidden="true" class="banner-scrim" />
      <div aria-hidden="true" class="banner-fade" />
      <div class="banner-content">
        <span v-if="c.banner.eyebrow" class="eyebrow-plain"><span class="rule-short" />{{ c.banner.eyebrow }}</span>
        <h1 class="banner-title">{{ c.banner.title }}</h1>
      </div>
    </header>

    <!-- A NEW STANDARD -->
    <section v-if="c.standard.visible" class="standard-section">
      <div class="standard-grid">
        <div class="standard-text">
          <span v-if="c.standard.eyebrow" class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />{{ c.standard.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.standard.title)" />
          <p v-for="(p, i) in paragraphs(c.standard.body)" :key="i" class="body-copy" :style="i ? 'margin-top: 20px;' : undefined" v-html="richText(p)" />
        </div>
        <div class="standard-image-wrap">
          <div class="standard-image" :style="bg(c.standard.image.src)" role="img" :aria-label="c.standard.image.alt">
            <div class="frame-border" />
          </div>
        </div>
      </div>
    </section>

    <!-- FOUNDER -->
    <section v-if="c.founder.visible" class="founder-section">
      <div aria-hidden="true" class="pattern-dark" />
      <div class="founder-inner">
        <div class="founder-intro">
          <span v-if="c.founder.eyebrow" class="eyebrow-plain"><span class="rule-short" />{{ c.founder.eyebrow }}</span>
          <h2 class="h2-light" v-html="richText(c.founder.title)" />
        </div>
        <div class="founder-grid">
          <div class="founder-portrait founder-portrait--a">
            <img v-if="c.founder.portraitA.src" :src="c.founder.portraitA.src" :alt="c.founder.portraitA.alt" class="cms-fill" loading="lazy" decoding="async">
            <ImagePlaceholder v-else label="Founder portrait" />
          </div>
          <div class="founder-portrait founder-portrait--b">
            <img v-if="c.founder.portraitB.src" :src="c.founder.portraitB.src" :alt="c.founder.portraitB.alt" class="cms-fill" loading="lazy" decoding="async">
            <ImagePlaceholder v-else label="Founder portrait" />
          </div>
          <div class="founder-quote-cell">
            <span class="quote-glyph">&ldquo;</span>
            <p class="quote-text" v-html="richText(c.founder.quote)" />
            <div v-if="c.founder.attribution" class="quote-attr">
              <span class="rule-short rule-short--center" />
              <span class="eyebrow-plain">{{ c.founder.attribution }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MISSION / VISION / CORE -->
    <section v-if="c.pillars.visible" class="pillars-section">
      <div class="pillars-grid">
        <div v-for="(pillar, i) in c.pillars.items" :key="i" class="pillar">
          <span class="pillar-label">{{ pillar.title }}</span>
          <p class="pillar-copy" v-html="richText(pillar.copy)" />
        </div>
      </div>
    </section>

    <!-- EXPERIENCE -->
    <section v-if="c.experience.visible" class="about-experience-section">
      <div class="about-experience-grid">
        <div class="about-experience-image-wrap">
          <div class="about-experience-image">
            <img v-if="c.experience.image.src" :src="c.experience.image.src" :alt="c.experience.image.alt" class="cms-fill" loading="lazy" decoding="async">
            <ImagePlaceholder v-else label="Dining room photograph" />
          </div>
        </div>
        <div class="about-experience-text">
          <span v-if="c.experience.eyebrow" class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />{{ c.experience.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.experience.title)" />
          <p v-for="(p, i) in paragraphs(c.experience.body)" :key="i" class="body-copy" :style="i ? 'margin-top: 20px;' : undefined" v-html="richText(p)" />
          <div v-if="c.experience.stats.length" class="stats-row">
            <div v-for="(stat, i) in c.experience.stats" :key="i" class="stat">
              <span class="stat-number">{{ stat.number }}</span>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="c.cta.visible" class="cta-section">
      <div aria-hidden="true" class="cta-bg" :style="bg(c.cta.image.src)" />
      <div aria-hidden="true" class="cta-scrim" />
      <div class="cta-content">
        <span v-if="c.cta.eyebrow" class="eyebrow-plain">{{ c.cta.eyebrow }}</span>
        <h2 class="cta-title">{{ c.cta.title }}</h2>
        <CmsLink :link="c.cta.button" class="btn-gold" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const c = await usePageContent('about')
useContentSeo(() => c.value.seo)

const bg = (src: string) => src ? { backgroundImage: `url('${src}')` } : undefined
</script>

<style scoped>
/* Words set in **bold** in the dashboard. */
.body-copy :deep(strong) {
  font-weight: 500;
  color: var(--ink);
}

/* Photos added in the dashboard fill the frame the placeholder used. */
.cms-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-banner {
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
  background: url('/images/yana-image-4-mrt9n45r-v3w7.webp') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.7), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.4));
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
  /* Same deep midnight sapphire as the homepage Pisco Bar band, with the
     light pool centred behind the content. */
  background:
    radial-gradient(55% 60% at 50% 55%, rgba(52, 106, 170, 0.38), transparent 72%),
    radial-gradient(120% 70% at 50% 0%, rgba(217, 182, 144, 0.09), transparent 55%),
    linear-gradient(180deg, #08172a 0%, #0d2440 50%, #08172a 100%);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(76px, 11vw, 150px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.12;
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
  font-weight: 600;
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
