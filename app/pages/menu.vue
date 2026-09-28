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
        <div class="group-tabs" role="tablist" aria-label="Menu">
          <button
            v-for="g in menuGroups"
            :key="g.id"
            type="button"
            role="tab"
            :aria-selected="g.id === activeGroup"
            class="group-tab"
            :class="{ 'is-active': g.id === activeGroup }"
            @click="selectGroup(g.id)"
          >
            {{ g.label }}
            <span class="group-tab-count">{{ itemCount(g) }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- CATEGORY RAIL -->
    <div class="category-rail">
      <div class="category-rail-inner">
        <a v-for="sec in group.sections" :key="sec.id" :href="`#${sec.id}`" class="rail-link">{{ sec.label }}</a>
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

    <!-- ===================== MENU SECTIONS ===================== -->
    <section
      v-for="(sec, i) in group.sections"
      :id="sec.id"
      :key="sec.id"
      class="menu-section"
      :class="{ 'menu-section--dark': isDark(i) }"
    >
      <div v-if="isDark(i)" aria-hidden="true" class="pattern-dark" />
      <div class="menu-section-inner">
        <div class="menu-section-head" :class="{ 'menu-section-head--dark': isDark(i) }">
          <h2 class="menu-h2" :class="{ 'menu-h2--light': isDark(i) }">{{ sec.label }}</h2>
          <span class="menu-section-label" :class="{ 'menu-section-label--light': isDark(i) }">
            {{ sec.items.length }} {{ activeGroup === 'drinks' ? (sec.items.length === 1 ? 'drink' : 'drinks') : (sec.items.length === 1 ? 'dish' : 'dishes') }}
          </span>
        </div>

        <div class="dish-grid">
          <article v-for="item in sec.items" :key="item.name" class="dish-card">
            <div class="dish-photo">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                width="800"
                height="800"
                loading="lazy"
                decoding="async"
              >
              <ImagePlaceholder v-else label="Photo coming soon" :on-light="!isDark(i)" />
              <span aria-hidden="true" class="dish-photo-frame" />
            </div>
            <div class="dish-head">
              <h3 class="dish-name" :class="{ 'dish-name--light': isDark(i) }">{{ displayName(item.name) }}</h3>
              <span class="dish-leader" :class="{ 'dish-leader--light': isDark(i) }" />
              <span class="dish-price" :class="{ 'dish-price--light': isDark(i) }">{{ item.price }}</span>
            </div>
            <p v-if="item.desc" class="dish-desc" :class="{ 'dish-desc--light': isDark(i) }">{{ item.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <p class="price-disclaimer">All prices in AED and inclusive of applicable taxes.</p>

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
import { menuGroups, type MenuGroup } from '~/data/menu'

const digitalMenuUrl = 'https://qr.mydigimenu.com/e4f76cdf-d1f1-404e-94b9-7c105e902fa4/menu-page?menuID=62881'

// ?menu=drinks keeps a shared link on the right list.
const route = useRoute()
const router = useRouter()
const fromQuery = typeof route.query.menu === 'string' && menuGroups.some(g => g.id === route.query.menu)
  ? route.query.menu
  : menuGroups[0]!.id

const activeGroup = ref(fromQuery)
const group = computed(() => menuGroups.find(g => g.id === activeGroup.value) ?? menuGroups[0]!)

const itemCount = (g: MenuGroup) => g.sections.reduce((n, sec) => n + sec.items.length, 0)

function selectGroup(id: string) {
  if (id === activeGroup.value) return
  activeGroup.value = id
  router.replace({ query: id === menuGroups[0]!.id ? {} : { menu: id } })
}

// A few names arrive shouting from the digital menu (ESPRESSO); even them out.
function displayName(name: string) {
  if (name.length < 4 || name !== name.toUpperCase()) return name
  return name.toLowerCase().replace(/(^|[\s(-])([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase())
}

// Alternate light and dark bands down the page.
const isDark = (i: number) => i % 2 === 1

useHead({ title: 'Menu · YANA Restaurant' })
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
