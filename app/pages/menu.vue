<template>
  <div class="yana-page">
    <!-- BANNER -->
    <header class="menu-banner">
      <div aria-hidden="true" class="banner-bg banner-bg--wide" />
      <div aria-hidden="true" class="banner-scrim banner-scrim--menu" />
      <div class="banner-content">
        <span class="eyebrow-plain"><span class="rule-short" />Al Saadiyat Island · Abu Dhabi</span>
        <h1 class="banner-title">Menu</h1>
        <p class="banner-sub">Pan-Asian Fusion, Peruvian Flair</p>
      </div>
    </header>

    <!-- CATEGORY RAIL -->
    <div class="category-rail">
      <div class="category-rail-inner">
        <a v-for="cat in categories" :key="cat.id" :href="`#${cat.id}`" class="rail-link">{{ cat.label }}</a>
        <a :href="digitalMenuUrl" target="_blank" rel="noopener" class="rail-link rail-link--digital">Digital Menu →</a>
      </div>
    </div>

    <!-- INTRO -->
    <section class="intro-section">
      <div aria-hidden="true" class="pattern-light" />
      <div class="intro-inner">
        <p class="intro-text">Our kitchen brings together Pan-Asian precision and Peruvian heat — bold in flavour, beautifully presented, and made to be remembered.</p>
      </div>
    </section>

    <!-- STARTERS -->
    <section id="starters" class="menu-section">
      <div class="menu-section-inner">
        <div class="menu-section-head">
          <h2 class="menu-h2">Starters</h2>
          <span class="menu-section-label">Raw bar &amp; small plates</span>
        </div>
        <div class="menu-rows">
          <div v-for="item in starters" :key="item.name" class="menu-row">
            <div class="menu-row-text">
              <h3 class="menu-item-name">{{ item.name }}</h3>
              <p class="menu-item-desc">{{ item.desc }}</p>
            </div>
            <span class="menu-item-price">{{ item.price }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MAINS (dark band) -->
    <section id="mains" class="menu-section menu-section--dark">
      <div aria-hidden="true" class="pattern-dark" />
      <div class="menu-section-inner">
        <div class="menu-section-head menu-section-head--dark">
          <h2 class="menu-h2 menu-h2--light">Mains</h2>
          <span class="menu-section-label menu-section-label--light">From the Josper grill</span>
        </div>
        <div class="menu-rows">
          <div v-for="item in mains" :key="item.name" class="menu-row menu-row--dark">
            <div class="menu-row-text">
              <h3 class="menu-item-name menu-item-name--light">{{ item.name }}</h3>
              <p class="menu-item-desc menu-item-desc--light">{{ item.desc }}</p>
            </div>
            <span class="menu-item-price menu-item-price--light">{{ item.price }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- DESSERTS + DRINKS -->
    <section id="desserts" class="desserts-section">
      <div class="desserts-grid">
        <div>
          <div class="menu-section-head menu-section-head--tight">
            <h2 class="menu-h2 menu-h2--sm">Desserts</h2>
          </div>
          <div class="menu-rows menu-rows--tight">
            <div v-for="item in desserts" :key="item.name" class="menu-row menu-row--tight">
              <div class="menu-row-text">
                <h3 class="menu-item-name menu-item-name--sm">{{ item.name }}</h3>
                <p class="menu-item-desc">{{ item.desc }}</p>
              </div>
              <span class="menu-item-price">{{ item.price }}</span>
            </div>
          </div>
        </div>
        <div id="drinks" class="drinks-col">
          <div class="menu-section-head menu-section-head--tight">
            <h2 class="menu-h2 menu-h2--sm">Drinks</h2>
          </div>
          <div class="menu-rows menu-rows--tight">
            <div v-for="item in drinks" :key="item.name" class="menu-row menu-row--tight">
              <div class="menu-row-text">
                <h3 class="menu-item-name menu-item-name--sm">{{ item.name }}</h3>
                <p class="menu-item-desc">{{ item.desc }}</p>
              </div>
              <span class="menu-item-price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
      <p class="price-disclaimer">All prices in AED and inclusive of applicable taxes.</p>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div aria-hidden="true" class="cta-bg" />
      <div aria-hidden="true" class="cta-scrim" />
      <div class="cta-content">
        <span class="eyebrow-plain">The Full List</span>
        <h2 class="cta-title">Browse our digital menu</h2>
        <p class="cta-copy">Every dish, every pour — kept current by the kitchen.</p>
        <div class="cta-btn-row">
          <a :href="digitalMenuUrl" target="_blank" rel="noopener" class="btn-gold">Open Digital Menu</a>
          <NuxtLink to="/reservation" class="btn-outline-light">Reserve a Table</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const digitalMenuUrl = 'https://qr.mydigimenu.com/e4f76cdf-d1f1-404e-94b9-7c105e902fa4/menu-page?menuID=54266'

const categories = [
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Mains' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' }
]

const starters = [
  { name: 'Ceviche YANA', desc: 'Sea bass, leche de tigre, crisp cancha, red onion and coriander oil.', price: '75' },
  { name: 'Nikkei Tiradito', desc: "Yellowtail, aji amarillo tiger's milk, yuzu and a whisper of gold leaf.", price: '85' },
  { name: 'Anticuchos de Wagyu', desc: 'Charcoal-grilled wagyu skewers, panca glaze and smoked lime.', price: '95' },
  { name: 'Pulpo al Josper', desc: 'Grilled octopus, botija olive, aji panca and purple Andean potato.', price: '110' }
]

const mains = [
  { name: 'Miso Glazed Black Cod', desc: 'Black cod marinated in miso glaze, broiled and served with pandan rice and bok choy.', price: '145' },
  { name: 'Lomo Saltado', desc: 'Wok-seared beef tenderloin, soy, vine tomato and crisp golden potato.', price: '135' },
  { name: 'Salmón Nikkei', desc: 'Torched salmon, den miso, jalapeño and a lift of kizami wasabi.', price: '125' },
  { name: 'Charcoaled Beef Burger', desc: 'Robata-grilled patty, cheddar, caramelised onion and aji panca in a brioche bun.', price: '95' }
]

const desserts = [
  { name: 'Lucuma Cheesecake', desc: 'Peruvian lucuma, torched meringue and cacao crumb.', price: '55' },
  { name: 'Yuzu Matcha Tart', desc: 'Matcha ganache, yuzu curd and white sesame tuile.', price: '50' }
]

const drinks = [
  { name: 'Chicha Morada', desc: 'Purple corn, pineapple, clove and lime — served over ice.', price: '38' },
  { name: 'Yuzu Cooler', desc: 'Yuzu, shiso, cucumber and soda.', price: '42' }
]
</script>

<style scoped>
.menu-banner {
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
}

.banner-bg--wide {
  background: url('/images/yana-pattern-wide.jpeg') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
}

.banner-scrim--menu {
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.72), rgba(15, 30, 46, 0.55) 45%, rgba(15, 30, 46, 0.94));
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

.category-rail {
  position: sticky;
  top: 60px;
  z-index: 60;
  background: rgba(255, 255, 255, 0.94);
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
  font-family: var(--serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(21px, 3.4vw, 32px);
  line-height: 1.45;
  color: var(--ink);
  margin: 0;
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

.menu-section-head--tight {
  gap: 20px;
  padding-bottom: 20px;
}

.menu-h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(30px, 4.6vw, 54px);
  line-height: 1;
  margin: 0;
  color: var(--ink);
}

.menu-h2--light {
  color: #ffffff;
}

.menu-h2--sm {
  font-size: clamp(28px, 4vw, 44px);
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

.menu-rows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0 clamp(40px, 6vw, 80px);
  margin-top: clamp(24px, 3vw, 40px);
}

.menu-rows--tight {
  display: block;
  margin-top: 8px;
}

.menu-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 22px 0;
  border-bottom: 1px solid rgba(18, 66, 109, 0.1);
}

.menu-row--dark {
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.menu-row--tight {
  padding: 20px 0;
}

.menu-row-text {
  flex: 1;
  min-width: 0;
}

.menu-item-name {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(20px, 2.2vw, 25px);
  margin: 0;
  color: var(--ink);
}

.menu-item-name--light {
  color: #ffffff;
}

.menu-item-name--sm {
  font-size: 22px;
}

.menu-item-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--ink-dim);
  margin: 7px 0 0;
}

.menu-item-desc--light {
  color: var(--cream-dim);
}

.menu-item-price {
  font-family: var(--serif);
  font-size: 19px;
  color: var(--gold-dk);
  white-space: nowrap;
}

.menu-item-price--light {
  color: var(--gold-lt);
}

.desserts-section {
  position: relative;
  overflow: hidden;
  padding: clamp(64px, 9vw, 110px) clamp(20px, 5vw, 64px);
}

.desserts-grid {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(48px, 6vw, 84px);
}

.drinks-col {
  scroll-margin-top: 130px;
}

.price-disclaimer {
  position: relative;
  max-width: 1320px;
  margin: clamp(40px, 5vw, 60px) auto 0;
  font-size: 11.5px;
  letter-spacing: 0.06em;
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
  font-family: var(--serif);
  font-weight: 400;
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
