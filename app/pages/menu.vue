<template>
  <div class="yana-page">
    <!-- BANNER -->
    <header class="menu-banner">
      <div aria-hidden="true" class="banner-bg banner-bg--wide" :style="bg(c.banner.image.src)" />
      <div aria-hidden="true" class="banner-scrim banner-scrim--menu" />
      <div aria-hidden="true" class="banner-fade" />
      <div class="banner-content">
        <span v-if="c.banner.eyebrow" class="eyebrow-plain"><span class="rule-short" />{{ c.banner.eyebrow }}</span>
        <h1 class="banner-title">{{ c.banner.title }}</h1>
        <p v-if="c.banner.subtitle" class="banner-sub">{{ c.banner.subtitle }}</p>
      </div>
    </header>

    <!-- MENU TILES -->
    <section v-if="c.tiles.visible" class="tiles">
      <div v-if="c.tiles.heading" v-reveal class="tiles-head">
        <span class="tiles-eyebrow">{{ c.tiles.heading }}</span>
      </div>
      <div class="tiles-grid">
        <a
          v-for="(tile, i) in c.tiles.items"
          :key="i"
          v-reveal="{ y: 22 }"
          class="tile"
          :href="tile.url"
          target="_blank"
          rel="noopener"
        >
          <span class="tile-art">
            <svg class="tile-mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="tileIcons[tile.icon as TileIcon] ?? tileIcons.plate" />
          </span>
          <span class="tile-label">{{ tile.label }}</span>
          <span class="tile-rule" aria-hidden="true" />
          <span v-if="tile.desc" class="tile-desc">{{ tile.desc }}</span>
          <span class="tile-note">{{ isPdf(tile.url) ? 'Open PDF ↗' : 'View online ↗' }}</span>
        </a>
      </div>
    </section>

    <!-- FOOD -->
    <template v-if="c.food.visible">
      <div aria-hidden="true" class="section-divider" />
      <section id="food" class="feature">
        <div class="feature-copy">
          <h2 class="feature-title">{{ c.food.title }}</h2>
          <p v-for="(p, i) in paragraphs(c.food.body)" :key="i" class="feature-text" v-html="richText(p)" />
          <CmsLink :link="c.food.button" class="feature-link">
            <span aria-hidden="true"> →</span>
          </CmsLink>
        </div>
        <div class="feature-media">
          <img :src="c.food.image.src" :alt="c.food.image.alt" width="1254" height="1600" loading="lazy" decoding="async">
        </div>
      </section>
    </template>

    <!-- DRINKS -->
    <template v-if="c.drinks.visible">
      <div aria-hidden="true" class="section-divider" />
      <section id="drinks" class="feature feature--reverse feature--panel">
        <div class="feature-copy">
          <h2 class="feature-title">{{ c.drinks.title }}</h2>
          <p v-for="(p, i) in paragraphs(c.drinks.body)" :key="i" class="feature-text" v-html="richText(p)" />
          <CmsLink :link="c.drinks.button" class="feature-link">
            <span aria-hidden="true"> →</span>
          </CmsLink>
        </div>
        <div class="feature-media">
          <img :src="c.drinks.image.src" :alt="c.drinks.image.alt" width="736" height="920" loading="lazy" decoding="async">
        </div>
      </section>
    </template>

    <!-- CTA -->
    <section v-if="c.cta.visible" class="cta-section">
      <div aria-hidden="true" class="cta-bg" :style="bg(c.cta.image.src)" />
      <div aria-hidden="true" class="cta-scrim" />
      <div class="cta-content">
        <span v-if="c.cta.eyebrow" class="eyebrow-plain">{{ c.cta.eyebrow }}</span>
        <h2 class="cta-title">{{ c.cta.title }}</h2>
        <p v-for="(p, i) in paragraphs(c.cta.body)" :key="i" class="cta-copy" v-html="richText(p)" />
        <div class="cta-btn-row">
          <CmsLink :link="c.cta.button" class="btn-gold" />
          <CmsLink :link="c.cta.button2" class="btn-outline-light" />
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <YanaMarquee />
  </div>
</template>

<script setup lang="ts">
const c = await usePageContent('menu')
useContentSeo(() => c.value.seo)

const bg = (src: string) => src ? { backgroundImage: `url('${src}')` } : undefined

// One drawn mark per menu, on a 64px grid, so the grid isn't six of the same
// icon. The dashboard offers these by name (MENU_TILE_ICONS).
const tileIcons = {
  plate: '<circle cx="32" cy="34" r="17"/><circle cx="32" cy="34" r="11"/><path d="M14 18c3-5 7-7 11-7M39 11c4 0 8 2 11 7"/>',
  sunrise: '<path d="M10 42h44"/><path d="M18 42a14 14 0 0 1 28 0"/><path d="M32 12v6M14 20l4 4M50 20l-4 4M6 32h5M53 32h5"/>',
  coupe: '<path d="M18 20h28l-14 15Z"/><path d="M32 35v14M24 49h16"/><path d="M44 14a5 5 0 1 1-5 5"/>',
  cup: '<path d="M16 24h26v12a13 13 0 0 1-26 0Z"/><path d="M42 27h5a5 5 0 0 1 0 10h-5"/><path d="M14 52h32"/><path d="M24 12c-2 3 2 4 0 7M32 12c-2 3 2 4 0 7"/>',
  highball: '<path d="M22 14h20l-2 36H24Z"/><path d="M27 26h.01M33 32h.01M29 40h.01M35 44h.01"/><path d="M42 14c5-3 9-2 11 1-4 2-7 3-11 2"/>',
  dessert: '<path d="M16 38h32l-4 14H20Z"/><path d="M18 38a14 14 0 0 1 28 0"/><circle cx="32" cy="22" r="3"/><path d="M32 19v-4"/>'
} as const
type TileIcon = keyof typeof tileIcons

const isPdf = (url: string) => /\.pdf($|[?#])/i.test(url)
</script>

<style scoped>
.menu-banner {
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
}

.banner-bg--wide {
  background: url('/images/yana-pattern-wide.jpeg') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
}

.banner-scrim--menu {
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.72), rgba(15, 30, 46, 0.55) 45%, rgba(15, 30, 46, 0.4));
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
  font-weight: 200;
  font-size: clamp(44px, 9vw, 104px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.banner-sub {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(19px, 3vw, 28px);
  color: rgba(255, 255, 255, 0.9);
  margin: 16px 0 0;
}

.group-tabs {
  display: flex;
  gap: clamp(16px, 3vw, 34px);
  margin-top: clamp(24px, 3vw, 34px);
}

.group-tab {
  letter-spacing: 0.01em;
  font-weight: 300;
  display: inline-flex;
  align-items: flex-start;
  gap: 7px;
  padding: 0 0 8px;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.28);
  background: none;
  font-family: var(--serif);
  font-size: clamp(22px, 3vw, 30px);
  color: rgba(255, 255, 255, 0.62);
  cursor: pointer;
  transition: color 0.3s, border-color 0.3s;
}

.group-tab:hover {
  color: #ffffff;
}

.group-tab.is-active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.group-tab-count {
  font-family: var(--sans);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
}

.group-tab.is-active .group-tab-count {
  color: var(--gold-lt);
}

/* ---------- Menu tiles ---------- */
.tiles {
  position: relative;
  background: var(--panel);
  padding: clamp(56px, 7vw, 104px) clamp(20px, 5vw, 64px) clamp(60px, 8vw, 112px);
}

.tiles-head {
  max-width: 1280px;
  margin: 0 auto clamp(34px, 4vw, 54px);
  text-align: center;
}

.tiles-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.tiles-eyebrow::before,
.tiles-eyebrow::after {
  content: '';
  width: 34px;
  height: 1px;
  background: var(--gold);
}

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: clamp(16px, 2vw, 26px);
  max-width: 1280px;
  margin: 0 auto;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: clamp(32px, 3.6vw, 48px) clamp(18px, 2vw, 30px) clamp(26px, 3vw, 38px);
  border: 1px solid rgba(217, 182, 144, 0.45);
  background: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  color: var(--ink);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: background 0.4s ease, border-color 0.4s ease, transform 0.4s ease;
}

.tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(217, 182, 144, 0.16), rgba(217, 182, 144, 0));
  opacity: 0;
  transition: opacity 0.45s ease;
}

.tile:hover,
.tile:focus-visible {
  transform: translateY(-5px);
  border-color: var(--gold);
  background: #FFFDF9;
}

.tile:hover::before,
.tile:focus-visible::before {
  opacity: 1;
}

.tile > * {
  position: relative;
  z-index: 1;
}

.tile-art {
  display: grid;
  place-items: center;
  width: 86px;
  height: 86px;
  margin-bottom: 20px;
  border: 1px solid rgba(217, 182, 144, 0.5);
  border-radius: 50%;
  color: var(--gold-dk);
  transition: background 0.4s ease, border-color 0.4s ease, transform 0.6s ease;
}

.tile:hover .tile-art {
  background: rgba(217, 182, 144, 0.16);
  border-color: var(--gold);
  transform: rotate(-4deg);
}

.tile-mark {
  width: 46px;
  height: 46px;
}

.tile-label {
  font-size: clamp(18px, 1.8vw, 22px);
  font-weight: 300;
  letter-spacing: 0.06em;
}

.tile-rule {
  width: 26px;
  height: 1px;
  margin: 14px 0;
  background: var(--gold);
  transition: width 0.4s ease;
}

.tile:hover .tile-rule {
  width: 54px;
}

.tile-desc {
  max-width: 24ch;
  font-size: 13px;
  line-height: 1.7;
  font-weight: 300;
  color: var(--ink-dim);
}

.tile-note {
  margin-top: 16px;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold-dk);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.tile:hover .tile-note,
.tile:focus-visible .tile-note {
  opacity: 1;
  transform: none;
}

/* ---------- Food / Drinks features ---------- */
.feature {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: clamp(32px, 5vw, 84px);
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(48px, 7vw, 104px) clamp(20px, 5vw, 64px);
}

.feature--reverse .feature-copy {
  order: 2;
}

/* The section is width-capped, so the tint is painted edge to edge behind it. */
.feature--panel {
  background: var(--panel);
  box-shadow: 0 0 0 100vmax var(--panel);
  clip-path: inset(0 -100vmax);
}

.feature-title {
  margin: 0 0 22px;
  font-size: clamp(21px, 2.3vw, 31px);
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.feature-text {
  margin: 0 0 18px;
  max-width: 52ch;
  font-size: 15px;
  line-height: 1.95;
  font-weight: 300;
  color: var(--ink-dim);
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid var(--ink);
  font-size: 11.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  transition: gap 0.3s, color 0.3s, border-color 0.3s;
}

.feature-link:hover {
  gap: 16px;
  color: var(--gold-dk);
  border-color: var(--gold-dk);
}

.feature-media img {
  display: block;
  width: 100%;
  height: clamp(320px, 42vw, 560px);
  object-fit: cover;
}

@media (max-width: 860px) {
  .feature {
    grid-template-columns: 1fr;
  }

  .feature--reverse .feature-copy {
    order: 0;
  }
}

.category-rail {
  position: sticky;
  top: 60px;
  z-index: 60;
  background: var(--panel);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
}

.category-rail-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px);
  display: flex;
  gap: clamp(18px, 3vw, 40px);
  overflow-x: auto;
}

.rail-link {
  flex: 0 0 auto;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  padding: 20px 0;
  border-bottom: 1px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.rail-link:hover {
  color: var(--gold-dk);
  border-bottom-color: var(--gold);
}

.rail-link--digital {
  margin-left: auto;
  color: var(--gold-dk);
  transition: opacity 0.3s;
}

.rail-link--digital:hover {
  opacity: 0.65;
  border-bottom-color: transparent;
}

.intro-section {
  position: relative;
  overflow: hidden;
  padding: clamp(72px, 10vw, 128px) clamp(20px, 5vw, 64px) clamp(40px, 5vw, 64px);
}

.pattern-light {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.25) contrast(1.1);
  opacity: 0.55;
  pointer-events: none;
}

.intro-inner {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.intro-text {
  letter-spacing: 0;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(21px, 3.4vw, 32px);
  line-height: 1.45;
  color: var(--ink);
  margin: 0;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
  gap: clamp(22px, 2.6vw, 38px);
  margin-top: clamp(28px, 3.5vw, 46px);
}

.dish-card {
  min-width: 0;
}

.dish-photo {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--panel);
}

.dish-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.1s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.dish-card:hover .dish-photo img {
  transform: scale(1.06);
}

.dish-photo-frame {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(217, 182, 144, 0.45);
  pointer-events: none;
}

.dish-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 20px;
}

.dish-name {
  letter-spacing: 0;
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(19px, 1.9vw, 22px);
  line-height: 1.2;
  margin: 0;
  color: var(--ink);
}

.dish-name--light {
  color: #ffffff;
}

.dish-leader {
  flex: 1;
  height: 1px;
  min-width: 12px;
  background: repeating-linear-gradient(90deg, rgba(15, 30, 46, 0.28) 0 2px, transparent 2px 6px);
}

.dish-leader--light {
  background: repeating-linear-gradient(90deg, rgba(232, 220, 200, 0.4) 0 2px, transparent 2px 6px);
}

.dish-price {
  letter-spacing: 0.02em;
  font-weight: 400;
  font-family: var(--serif);
  font-size: 19px;
  color: var(--gold-dk);
  white-space: nowrap;
}

.dish-price--light {
  color: var(--gold);
}

.dish-desc {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.75;
  font-weight: 300;
  color: var(--ink-dim);
}

.dish-desc--light {
  color: var(--cream-dim);
}

.menu-section {
  scroll-margin-top: 130px;
  position: relative;
  overflow: hidden;
  padding: clamp(48px, 7vw, 90px) clamp(20px, 5vw, 64px);
}

.menu-section--dark {
  background: radial-gradient(120% 80% at 50% 0%, rgba(217, 182, 144, 0.14), transparent 55%), linear-gradient(180deg, #0f1e2e, #12426d 50%, #0f1e2e);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
  padding: clamp(64px, 9vw, 110px) clamp(20px, 5vw, 64px);
}

.pattern-dark {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.3;
  mix-blend-mode: screen;
  pointer-events: none;
}

.menu-section-inner {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.menu-section-head {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(217, 182, 144, 0.45);
}

.menu-h2 {
  letter-spacing: -0.01em;
  font-family: var(--serif);
  font-weight: 300;
  font-size: clamp(30px, 4.6vw, 54px);
  line-height: 1;
  margin: 0;
  color: var(--ink);
}

.menu-h2--light {
  color: #ffffff;
}

.menu-section-label {
  font-size: 10.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.menu-section-label--light {
  color: var(--gold-lt);
}

.price-disclaimer {
  position: relative;
  max-width: 1320px;
  /* Standalone strip between the last menu band and the CTA. */
  margin: 0 auto;
  padding: clamp(26px, 3.5vw, 40px) clamp(20px, 5vw, 64px);
  font-size: 11.5px;
  letter-spacing: 0.06em;
  text-align: center;
  color: var(--ink-dim);
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
  background: url('/images/yana-image-3-mrt9rmoi-9m3z.webp') center/cover no-repeat;
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
  letter-spacing: -0.015em;
  font-family: var(--serif);
  font-weight: 300;
  font-size: clamp(32px, 5.4vw, 62px);
  line-height: 1.06;
  margin: 20px 0 0;
  color: #ffffff;
}

.cta-copy {
  font-size: 15px;
  line-height: 1.9;
  color: var(--cream-dim);
  margin: 22px auto 0;
  max-width: 46ch;
}

.cta-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  margin-top: 38px;
}

.btn-gold {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 600;
  color: #0f1e2e;
  background: var(--gold);
  padding: 19px 44px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid var(--gold);
}

.btn-gold:hover {
  background: transparent;
  color: #ffffff;
}

.btn-outline-light {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gold-lt);
  background: transparent;
  padding: 19px 44px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid rgba(217, 182, 144, 0.5);
}

.btn-outline-light:hover {
  background: var(--gold);
  color: #0f1e2e;
  border-color: var(--gold);
}
</style>
