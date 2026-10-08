<template>
  <div class="yana-page">
    <!-- ===================== HERO ===================== -->
    <header id="home" class="hero">
      <video
        v-if="c.hero.video && !reducedMotion"
        :key="c.hero.video"
        class="hero-video"
        :poster="c.hero.image.src"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
      >
        <source :src="c.hero.video" type="video/mp4">
      </video>
      <div v-else class="hero-img" :class="{ 'no-zoom': !c.hero.zoom }" :style="bg(c.hero.image.src)" />
      <div class="hero-scrim" />
      <div aria-hidden="true" class="hero-fade" />
      <div class="hero-content">
        <div v-if="c.hero.eyebrow" v-reveal="{ y: 24, duration: 1.1 }">
          <span class="hero-eyebrow">
            <span class="rule rule-left" />{{ c.hero.eyebrow }}<span class="rule rule-right" />
          </span>
        </div>
        <h1 v-reveal="{ y: 28, duration: 1.2, delay: 0.12 }" class="hero-title">{{ c.hero.title }}</h1>
        <p v-if="c.hero.location" v-reveal="{ y: 24, duration: 1.2, delay: 0.2 }" class="hero-locale">{{ c.hero.location }}</p>
        <p v-if="c.hero.subtitle" v-reveal="{ y: 24, duration: 1.2, delay: 0.24 }" class="hero-sub">{{ c.hero.subtitle }}</p>
        <div v-reveal="{ y: 24, duration: 1.2, delay: 0.38 }" class="hero-cta-wrap">
          <CmsLink :link="c.hero.button" class="btn-gold-hero" />
        </div>
      </div>
      <div class="yana-scroll-cue scroll-cue">
        <span class="scroll-label">Scroll</span>
        <span class="scroll-bar" />
      </div>
    </header>

    <!-- ===================== INTRO ===================== -->
    <section v-if="c.intro.visible" class="intro">
      <div v-reveal="{ y: 26 }" class="intro-head">
        <!-- Fire & sea, drawn in one line: a flame over a wave. -->
        <svg class="intro-mark" viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M60 6c6 9 10 14 10 21a10 10 0 0 1-20 0c0-4 2-7 4-10 1 4 3 6 5 7-1-7 0-12 1-18Z" />
          <path d="M26 44c6 0 6-5 12-5s6 5 12 5 6-5 12-5 6 5 12 5 6-5 12-5" />
          <path d="M20 54c7 0 7-5 14-5s7 5 14 5 7-5 14-5 7 5 14 5 7-5 14-5" opacity="0.55" />
        </svg>
        <h2 class="intro-title" v-html="richText(c.intro.title)" />
        <p v-for="(p, i) in paragraphs(c.intro.body)" :key="i" class="intro-copy" :class="{ 'intro-copy--next': i }" v-html="richText(p)" />
        <CmsLink :link="c.intro.button" class="intro-btn" />
      </div>
    </section>

    <!-- ===================== KITCHEN (split feature) ===================== -->
    <section v-if="c.kitchen.visible" id="cuisine" class="split">
      <div class="split-media">
        <div class="split-photo" :style="bg(c.kitchen.roomImage.src)" role="img" :aria-label="c.kitchen.roomImage.alt" />
      </div>
      <div class="split-panel">
        <div aria-hidden="true" class="split-pattern" />
        <div v-reveal="{ y: 28 }" class="split-inner">
          <div class="split-dish" :style="bg(c.kitchen.dishImage.src)" role="img" :aria-label="c.kitchen.dishImage.alt" />
          <span v-if="c.kitchen.eyebrow" class="eyebrow eyebrow-dark split-eyebrow"><span class="rule-short" />{{ c.kitchen.eyebrow }}</span>
          <h2 class="split-title" v-html="richText(c.kitchen.title)" />
          <p v-for="(p, i) in paragraphs(c.kitchen.body)" :key="i" class="split-copy" v-html="richText(p)" />
          <CmsLink :link="c.kitchen.button" class="split-link">
            <span aria-hidden="true"> →</span>
          </CmsLink>
        </div>
      </div>
    </section>

    <!-- ===================== PULL QUOTE ===================== -->
    <section v-if="c.quote.visible" class="pull-quote">
      <blockquote v-reveal="{ y: 24 }" class="pull-quote-text" v-html="richText(c.quote.text)" />
    </section>

    <!-- ===================== PISCO BAR (dark band) ===================== -->
    <section v-if="c.bar.visible" id="bar" class="feature feature--dark">
      <div aria-hidden="true" class="pattern-dark pattern-dark--tall" />
      <span v-if="c.bar.ghost" aria-hidden="true" class="ghost-word ghost-word--light ghost-center">{{ c.bar.ghost }}</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30 }" class="feature-text">
          <span v-if="c.bar.eyebrow" class="eyebrow eyebrow-light"><span class="rule-short" />{{ c.bar.eyebrow }}</span>
          <h2 class="h2-light" v-html="richText(c.bar.title)" />
          <p v-for="(p, i) in paragraphs(c.bar.body)" :key="i" class="body-copy body-copy--light" v-html="richText(p)" />
          <CmsLink :link="c.bar.button" class="link-underline link-underline--light" />
        </div>
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-media">
          <div class="feature-photo feature-photo--portrait" :style="bg(c.bar.image.src)" role="img" :aria-label="c.bar.image.alt" />
        </div>
      </div>
    </section>

    <!-- ===================== TERRACE ===================== -->
    <section v-if="c.terrace.visible" id="terrace" class="feature section-light">
      <span v-if="c.terrace.ghost" aria-hidden="true" class="ghost-word ghost-left">{{ c.terrace.ghost }}</span>
      <div class="feature-grid">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span v-if="c.terrace.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.terrace.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.terrace.title)" />
          <p v-for="(p, i) in paragraphs(c.terrace.body)" :key="i" class="body-copy" v-html="richText(p)" />
          <CmsLink :link="c.terrace.button" class="link-underline" />
        </div>
        <div v-reveal="{ y: 30 }" class="feature-media">
          <div class="feature-photo feature-photo--tall" :style="bg(c.terrace.image.src)" role="img" :aria-label="c.terrace.image.alt" />
        </div>
      </div>
    </section>

    <!-- ===================== EVENINGS (full-bleed) ===================== -->
    <section v-if="c.evenings.visible" id="evenings" class="bleed">
      <div class="bleed-bg" :style="bg(c.evenings.image.src)" />
      <div aria-hidden="true" class="bleed-scrim" />
      <span v-if="c.evenings.ghost" aria-hidden="true" class="ghost-word ghost-word--light ghost-bottom-left">{{ c.evenings.ghost }}</span>
      <div class="bleed-inner">
        <div v-reveal="{ y: 30 }" class="bleed-text">
          <span v-if="c.evenings.eyebrow" class="eyebrow eyebrow-light"><span class="rule-short" />{{ c.evenings.eyebrow }}</span>
          <h2 class="h2-light" v-html="richText(c.evenings.title)" />
          <p v-for="(p, i) in paragraphs(c.evenings.body)" :key="i" class="body-copy body-copy--light" v-html="richText(p)" />
          <CmsLink :link="c.evenings.button" class="link-underline link-underline--light" />
        </div>
      </div>
    </section>

    <!-- ===================== OUR STORY ===================== -->
    <section v-if="c.story.visible" id="story" class="feature section-light">
      <span v-if="c.story.ghost" aria-hidden="true" class="ghost-word ghost-left">{{ c.story.ghost }}</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span v-if="c.story.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.story.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.story.title)" />
          <p v-for="(p, i) in paragraphs(c.story.body)" :key="i" class="body-copy" v-html="richText(p)" />
          <p v-if="c.story.signoff" class="story-signoff">{{ c.story.signoff }}</p>
        </div>
        <div v-reveal="{ y: 30 }" class="feature-media">
          <div class="feature-photo feature-photo--tall" :style="bg(c.story.image.src)" role="img" :aria-label="c.story.image.alt" />
        </div>
      </div>
    </section>

    <div v-if="c.moments.visible" aria-hidden="true" class="section-divider" />

    <!-- ===================== BEST SHOTS (carousel) ===================== -->
    <section v-if="c.moments.visible && shots.length" class="shots-section">
      <div class="shots" @mouseenter="pauseShots = true" @mouseleave="pauseShots = false" @focusin="pauseShots = true" @focusout="pauseShots = false">
        <div v-reveal="{ y: 26 }" class="shots-head">
          <div class="shots-intro">
            <span v-if="c.moments.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.moments.eyebrow }}</span>
            <h2 class="h2-dark" v-html="richText(c.moments.title)" />
            <p v-for="(p, i) in paragraphs(c.moments.body)" :key="i" class="body-copy shots-copy" v-html="richText(p)" />
            <CmsLink :link="c.moments.instagram" class="shots-insta">
              <template #before>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
              </template>
            </CmsLink>
          </div>
          <div class="shots-controls">
            <span class="shots-count" aria-hidden="true">{{ String(shotIndex + 1).padStart(2, '0') }} <span class="shots-count-total">/ {{ String(shots.length).padStart(2, '0') }}</span></span>
            <div class="shots-nav">
              <button type="button" class="shots-btn" aria-label="Previous photos" @click="scrollShots(-1)">
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M21 6H1M6 1 1 6l5 5" /></svg>
              </button>
              <button type="button" class="shots-btn" aria-label="Next photos" @click="scrollShots(1)">
                <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div v-reveal="{ y: 26, delay: 0.1 }" ref="shotsTrack" class="shots-track" role="region" aria-label="Photos of YANA" tabindex="0" @scroll.passive="onShotsScroll" @touchstart.passive="pauseShots = true">
          <figure v-for="(shot, i) in shots" :key="i" class="shot">
            <img :src="shot.image.src" :alt="shot.image.alt" width="750" height="1000" loading="lazy" decoding="async">
            <figcaption v-if="shot.label" class="shot-caption">{{ shot.label }}</figcaption>
          </figure>
        </div>
        <div class="shots-progress" aria-hidden="true">
          <span class="shots-progress-bar" :style="{ transform: `scaleX(${shotsProgress})` }" />
        </div>
      </div>
    </section>

    <!-- ===================== RESERVATION CTA ===================== -->
    <section v-if="c.reserve.visible" id="reserve" class="cta-section">
      <div class="cta-bg" :style="bg(c.reserve.image.src)" />
      <div class="cta-scrim" />
      <div v-reveal class="cta-content">
        <span v-if="c.reserve.eyebrow" class="eyebrow-plain">{{ c.reserve.eyebrow }}</span>
        <h2 class="cta-title" v-html="richText(c.reserve.title)" />
        <p v-for="(p, i) in paragraphs(c.reserve.body)" :key="i" class="cta-copy" v-html="richText(p)" />
        <CmsLink :link="c.reserve.button" class="btn-gold-hero btn-gold-hero--cta" />
        <p v-if="c.reserve.phoneLine" class="cta-phone">{{ c.reserve.phoneLine }} {{ site.contact.phone }}</p>
      </div>
    </section>

    <!-- ===================== VISIT (map + details) ===================== -->
    <section v-if="c.visit.visible" id="location" class="visit">
      <a
        class="visit-map"
        :href="site.contact.mapsUrl"
        target="_blank"
        rel="noopener"
        aria-label="Open YANA on Google Maps"
      >
        <img :src="c.visit.mapImage.src" :alt="c.visit.mapImage.alt" width="1200" height="1200" loading="lazy" decoding="async">
        <span v-if="c.visit.mapButton" class="visit-map-cta">{{ c.visit.mapButton }} <span aria-hidden="true">↗</span></span>
      </a>
      <div class="visit-panel">
        <div aria-hidden="true" class="split-pattern" />
        <div v-reveal="{ y: 26 }" class="visit-inner">
          <h2 class="visit-title">{{ c.visit.title }}</h2>
          <p v-for="(p, i) in paragraphs(c.visit.body)" :key="i" class="visit-copy" v-html="richText(p)" />
          <dl class="visit-rows">
            <div class="visit-row">
              <dt>Address</dt>
              <dd><a :href="site.contact.mapsUrl" target="_blank" rel="noopener">{{ addressLines(site.contact.address).join(' ') }}</a></dd>
            </div>
            <div class="visit-row">
              <dt>Phone</dt>
              <dd><a :href="telHref(site.contact.phone)">{{ site.contact.phone }}</a></dd>
            </div>
            <div class="visit-row">
              <dt>Contact</dt>
              <dd><a :href="`mailto:${site.contact.email}`">{{ site.contact.email }}</a></dd>
            </div>
            <div class="visit-row">
              <dt>WhatsApp</dt>
              <dd><a :href="whatsappHref(site.contact.whatsapp)" target="_blank" rel="noopener">{{ site.contact.whatsapp }}</a></dd>
            </div>
            <div v-if="site.social.instagramUrl" class="visit-row">
              <dt>Instagram</dt>
              <dd><a :href="site.social.instagramUrl" target="_blank" rel="noopener">{{ site.social.instagramHandle || 'Instagram' }}</a></dd>
            </div>
            <div class="visit-row">
              <dt>Opening hours</dt>
              <dd>
                <template v-for="(row, i) in site.hours.rows" :key="i"><br v-if="i">{{ row.days }} | {{ row.hours }}</template>
              </dd>
            </div>
            <div v-if="c.visit.bookingLabel" class="visit-row">
              <dt>Reservations</dt>
              <dd><NuxtLink to="/reservation">{{ c.visit.bookingLabel }}</NuxtLink></dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- ===================== MARQUEE ===================== -->
    <YanaMarquee />
  </div>
</template>

<script setup lang="ts">
import { addressLines, telHref, whatsappHref } from '#shared/content/site'

const c = await usePageContent('home')
const site = useContent('site')
useContentSeo(() => c.value.seo)

const bg = (src: string) => src ? { backgroundImage: `url('${src}')` } : undefined

// "Best shots" carousel under the intro.
const shots = computed(() => c.value.moments.shots.filter(s => s.image.src))
const shotsTrack = ref<HTMLElement | null>(null)
const pauseShots = ref(false)
const shotIndex = ref(0)
const shotsProgress = ref(0)

// Keeps the counter and progress line in step with the track's position.
function onShotsScroll() {
  const track = shotsTrack.value
  const first = track?.firstElementChild as HTMLElement | null
  if (!track || !first) return
  const max = track.scrollWidth - track.clientWidth
  const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0')
  shotsProgress.value = max > 0 ? Math.max(0.08, track.scrollLeft / max) : 1
  const atEnd = track.scrollLeft >= max - 4
  shotIndex.value = atEnd ? shots.value.length - 1 : Math.min(shots.value.length - 1, Math.round(track.scrollLeft / step))
}

// Moves one photo along; wraps around at either end.
function scrollShots(dir: 1 | -1) {
  const track = shotsTrack.value
  const first = track?.firstElementChild as HTMLElement | null
  if (!track || !first) return
  const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0')
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
  const atStart = track.scrollLeft <= 4
  if (dir > 0 && atEnd) track.scrollTo({ left: 0, behavior: 'smooth' })
  else if (dir < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
  else track.scrollBy({ left: dir * step, behavior: 'smooth' })
}

// Visitors who ask for less motion get the still hero instead of the video.
const reducedMotion = ref(false)
let shotsTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  onShotsScroll()
  // Gentle auto-advance, paused while the visitor is hovering or interacting.
  if (!reducedMotion.value) {
    shotsTimer = setInterval(() => {
      if (!pauseShots.value && !document.hidden) scrollShots(1)
    }, 4500)
  }
})
onUnmounted(() => clearInterval(shotsTimer))

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
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.72) 0%, rgba(15, 30, 46, 0.42) 38%, rgba(15, 30, 46, 0.3) 100%);
}

.hero-fade {
  /* A light lift into the cream section below — not the old white band. */
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: clamp(130px, 20vh, 260px);
  background: linear-gradient(180deg, rgba(243, 236, 225, 0) 0%, rgba(243, 236, 225, 0.3) 45%, rgba(243, 236, 225, 0.62) 74%, rgba(243, 236, 225, 0.9) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 80px 24px 120px;
  max-width: 900px;
}

/* Shorter hero on phones so the intro below peeks into view. */
@media (max-width: 640px) {
  .hero {
    min-height: 72vh;
    min-height: 72svh;
  }

  .hero-content {
    padding: 96px 20px 84px;
  }

  .hero-fade {
    height: 110px;
  }

  .hero .hero-cta-wrap {
    margin-top: 30px;
  }
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
  font-weight: 200;
  font-size: clamp(56px, 12vw, 152px);
  line-height: 0.98;
  margin: 26px 0 0;
  letter-spacing: -0.02em;
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
  font-weight: 600;
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
  color: var(--ink);
}

.scroll-bar {
  display: block;
  width: 1px;
  height: 54px;
  background: linear-gradient(var(--ink), rgba(15, 30, 46, 0));
  animation: yanaScroll 2.6s ease-in-out infinite;
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

.ghost-center {
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(76px, 15vw, 210px);
  letter-spacing: 0.12em;
}

.ghost-word--light {
  color: rgba(255, 255, 255, 0.06);
}

.ghost-bottom-left {
  bottom: clamp(24px, 5vw, 60px);
  top: auto;
  left: -1.5vw;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* ---------- Intro: mark, statement, hours ---------- */
.intro {
  position: relative;
  background: var(--panel);
  padding: clamp(60px, 8vw, 120px) clamp(20px, 5vw, 64px) clamp(56px, 7vw, 104px);
  text-align: center;
}

.intro-head {
  max-width: 980px;
  margin: 0 auto;
}

.intro-mark {
  width: clamp(92px, 11vw, 132px);
  height: auto;
  color: var(--gold-dk);
}

.intro-title {
  margin: clamp(26px, 3.5vw, 44px) 0 0;
  font-size: clamp(19px, 2.2vw, 30px);
  font-weight: 300;
  line-height: 1.5;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.intro-copy {
  max-width: 76ch;
  margin: clamp(22px, 3vw, 34px) auto 0;
  font-size: 15px;
  line-height: 2;
  font-weight: 300;
  color: var(--ink-dim);
}

.intro-copy--next {
  margin-top: 18px;
}

.intro-btn {
  display: inline-block;
  margin-top: clamp(30px, 4vw, 46px);
  padding: 17px 38px;
  border: 1px solid rgba(15, 30, 46, 0.5);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  transition: background 0.35s, color 0.35s, border-color 0.35s;
}

.intro-btn:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}

/* ---------- Best shots carousel ---------- */
.shots-section {
  background: var(--panel);
  padding: clamp(64px, 8vw, 112px) clamp(20px, 5vw, 64px);
  overflow: hidden;
}

.shots {
  max-width: 1320px;
  margin: 0 auto;
}

/* Title on the left, counter + arrows on the right. */
.shots-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  margin-bottom: clamp(32px, 4vw, 52px);
}

.shots-intro {
  max-width: 560px;
  text-align: left;
}

.shots-insta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--gold-dk);
  text-decoration: none;
  border-bottom: 1px solid rgba(138, 107, 69, 0.4);
  padding-bottom: 4px;
  transition: color 0.3s, border-color 0.3s;
}

.shots-insta:hover {
  color: var(--ink);
  border-color: var(--ink);
}

.shots-copy {
  margin: 18px 0 0;
}

.shots-controls {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.4vw, 32px);
  flex-shrink: 0;
}

.shots-count {
  font-size: 13px;
  letter-spacing: 0.2em;
  font-weight: 600;
  color: var(--gold-dk);
  font-variant-numeric: tabular-nums;
}

.shots-count-total {
  font-weight: 300;
  color: var(--ink-dim);
}

.shots-track {
  display: flex;
  gap: clamp(12px, 1.6vw, 20px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  outline: none;
}

.shots-track::-webkit-scrollbar {
  display: none;
}

.shot {
  position: relative;
  flex: 0 0 clamp(240px, 27vw, 380px);
  margin: 0;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  scroll-snap-align: start;
  background: var(--panel-dk);
}

.shot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s ease;
}

/* Soft navy wash at the foot so the caption reads on any photo. */
.shot::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0), rgba(15, 30, 46, 0.72));
  pointer-events: none;
}

.shot-caption {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 20px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 600;
  color: #ffffff;
}

.shot-caption::before {
  content: '';
  width: 22px;
  height: 1px;
  background: var(--gold);
  transition: width 0.5s ease;
}

.shot:hover img {
  transform: scale(1.05);
}

.shot:hover .shot-caption::before {
  width: 38px;
}

.shots-progress {
  position: relative;
  height: 1px;
  margin-top: clamp(26px, 3vw, 36px);
  background: rgba(138, 107, 69, 0.2);
}

.shots-progress-bar {
  position: absolute;
  inset: 0;
  background: var(--gold-dk);
  transform-origin: left center;
  transition: transform 0.4s ease;
}

.shots-nav {
  display: flex;
  gap: 10px;
}

.shots-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(138, 107, 69, 0.45);
  border-radius: 50%;
  background: transparent;
  color: var(--gold-dk);
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.shots-btn:hover {
  background: var(--gold-dk);
  border-color: var(--gold-dk);
  color: var(--panel);
}

.shots-track:focus-visible {
  outline: 1px solid var(--gold-dk);
  outline-offset: 6px;
}

@media (max-width: 700px) {
  .shots-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .shots-controls {
    width: 100%;
    justify-content: space-between;
  }
}

/* ---------- Visit: map beside the details panel ---------- */
.visit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  background: var(--panel);
}

.visit-map {
  position: relative;
  display: block;
  overflow: hidden;
  min-height: clamp(380px, 46vw, 680px);
}

.visit-map img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.visit-map:hover img {
  transform: scale(1.04);
}

.visit-map-cta {
  position: absolute;
  left: clamp(18px, 2.5vw, 34px);
  bottom: clamp(18px, 2.5vw, 34px);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--ink);
  font-size: 11.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: background 0.3s, color 0.3s;
}

.visit-map:hover .visit-map-cta {
  background: var(--ink);
  color: #ffffff;
}

.visit-panel {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: clamp(44px, 5vw, 92px) clamp(22px, 4.5vw, 78px);
  background: #F6F1E9;
}

.visit-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 620px;
}

.visit-title {
  margin: 0 0 18px;
  font-size: clamp(21px, 2.1vw, 29px);
  font-weight: 300;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.visit-copy {
  margin: 0 0 34px;
  max-width: 52ch;
  font-size: 15px;
  line-height: 1.95;
  font-weight: 300;
  color: var(--ink-dim);
}

.visit-rows {
  margin: 0;
}

.visit-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px 24px;
  padding: 16px 0;
  border-top: 1px solid rgba(138, 107, 69, 0.35);
}

.visit-row:last-child {
  border-bottom: 1px solid rgba(138, 107, 69, 0.35);
}

.visit-row dt {
  font-family: 'Playfair Display', Georgia, var(--serif);
  font-style: italic;
  font-size: clamp(17px, 1.7vw, 22px);
  color: var(--gold-dk);
}

.visit-row dd {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.75;
  font-weight: 300;
  color: var(--ink);
  text-align: right;
}

.visit-row a {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  border-bottom: 1px solid rgba(217, 182, 144, 0.8);
  transition: color 0.3s, border-color 0.3s;
}

.visit-row a:hover {
  color: var(--gold-dk);
  border-color: var(--gold-dk);
}

@media (max-width: 900px) {
  .visit {
    grid-template-columns: 1fr;
  }

  .visit-map {
    min-height: clamp(260px, 60vw, 420px);
  }

  .visit-row dd {
    text-align: left;
  }
}

/* ---------- Pull quote ---------- */
.pull-quote {
  background: #F3ECE1;
  padding: clamp(64px, 9vw, 132px) clamp(22px, 6vw, 90px);
  text-align: center;
}

.pull-quote-text {
  max-width: 1120px;
  margin: 0 auto;
  /* Display italic, loaded only for this line; swap to var(--serif) to drop it. */
  font-family: 'Playfair Display', Georgia, var(--serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(24px, 3.4vw, 46px);
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--gold-dk);
}

/* ---------- Feature bands (text + angled-frame photo) ---------- */
.feature {
  position: relative;
  overflow: hidden;
  padding: clamp(64px, 9vw, 130px) clamp(20px, 5vw, 64px);
}

/* Deep midnight sapphire with a soft pool of light behind the photo
   (left column), so the imagery lifts off the background. */
.feature--dark {
  background:
    radial-gradient(48% 62% at 27% 50%, rgba(52, 106, 170, 0.42), transparent 72%),
    radial-gradient(120% 70% at 50% 0%, rgba(217, 182, 144, 0.09), transparent 55%),
    linear-gradient(180deg, #08172a 0%, #0d2440 50%, #08172a 100%);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
}

.feature--dark .pattern-dark--tall {
  opacity: 0.12;
}

.feature--dark .feature-photo {
  box-shadow: 0 34px 70px -18px rgba(3, 10, 20, 0.7);
}

.feature-grid {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(36px, 5vw, 90px);
  align-items: center;
  max-width: 1320px;
  margin: 0 auto;
}

.feature-grid--reverse {
  flex-direction: row-reverse;
}

.feature-text {
  flex: 1 1 400px;
  min-width: 280px;
}

.feature-text .body-copy {
  margin-top: 20px;
  max-width: 46ch;
}

.feature-text .body-copy:first-of-type {
  margin-top: 30px;
}

.body-copy.body-copy--light {
  color: var(--cream-dim);
}

.link-underline {
  letter-spacing: 0.01em;
  font-weight: 600;
  display: inline-block;
  margin-top: 36px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--gold);
  font-family: var(--serif);
  font-size: 21px;
  color: var(--ink);
  text-decoration: none;
  transition: color 0.3s, border-color 0.3s;
}

.link-underline:hover {
  color: var(--gold-dk);
  border-color: var(--gold-dk);
}

.link-underline--light {
  color: #ffffff;
}

.link-underline--light:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.feature-media {
  position: relative;
  flex: 1 1 420px;
  min-width: 280px;
}

.feature-photo {
  position: relative;
  aspect-ratio: 4 / 4.5;
  background-color: var(--panel);
  background-size: cover;
  /* The dishes sit low in the frame, so bias the crop downward. */
  background-position: center 58%;
  background-repeat: no-repeat;
}

/* Pisco Bar photo: same frame as The Terrace so the two bands match. */
.feature-photo--portrait {
  aspect-ratio: 4 / 4.2;
  background-position: center 60%;
}

.feature-photo--tall {
  aspect-ratio: 4 / 4.2;
  background-position: center;
}

/* ---------- Split feature: photo one side, panel the other ---------- */
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  background: var(--panel);
}

.split-media {
  position: relative;
}

/* The photo pins to the viewport while the panel beside it scrolls past,
   then releases when the section ends. */
.split-photo {
  position: sticky;
  top: 0;
  height: 100vh;
  background-size: cover;
  background-position: center;
}

.split-panel {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  /* The photo stays pinned for (this height - 100vh) of scrolling, so the
     taller the panel, the longer it holds. */
  min-height: 130vh;
  padding: clamp(60px, 8vw, 120px) clamp(22px, 4.5vw, 78px);
  background: #F6F1E9;
}

.split-pattern {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.2) contrast(1.05);
  opacity: 0.35;
  pointer-events: none;
}

.split-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 640px;
}

/* Matches the photo's own portrait shape so nothing is cropped. */
.split-dish {
  aspect-ratio: 1254 / 1600;
  max-width: 440px;
  margin-bottom: clamp(28px, 3.5vw, 48px);
  background-size: cover;
  background-position: center;
  box-shadow: 0 18px 44px rgba(15, 30, 46, 0.14);
}

.split-eyebrow {
  margin-bottom: 14px;
}

.split-title {
  margin: 0 0 22px;
  font-size: clamp(22px, 2.3vw, 31px);
  font-weight: 300;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.split-copy {
  margin: 0 0 18px;
  max-width: 54ch;
  font-size: 15px;
  line-height: 1.95;
  font-weight: 300;
  color: var(--ink-dim);
}

.split-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ink);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  transition: color 0.3s, border-color 0.3s, gap 0.3s;
}

.split-link:hover {
  gap: 16px;
  color: var(--gold-dk);
  border-color: var(--gold-dk);
}

@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }

  /* No pinning on phones: the photo simply sits above the panel. */
  .split-photo {
    position: relative;
    height: clamp(260px, 56vw, 420px);
  }

  .split-panel {
    min-height: 0;
  }
}

/* ---------- Full-bleed band ---------- */
.story-signoff {
  letter-spacing: 0.01em;
  font-weight: 300;
  font-family: var(--serif);
  font-style: italic;
  font-size: 22px;
  color: var(--gold-dk);
  margin: 34px 0 0;
}

/* ---------- Full-bleed band ---------- */
.bleed {
  position: relative;
  overflow: hidden;
  min-height: clamp(520px, 78vh, 760px);
  display: flex;
  align-items: center;
}

.bleed-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}

.bleed-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 30, 46, 0.92) 0%, rgba(15, 30, 46, 0.72) 45%, rgba(15, 30, 46, 0.45) 100%);
}

.bleed-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(60px, 8vw, 96px) clamp(20px, 5vw, 64px);
}

.bleed-text {
  max-width: 560px;
}

@media (max-width: 760px) {
  .bleed-scrim {
    background: linear-gradient(180deg, rgba(15, 30, 46, 0.78) 0%, rgba(15, 30, 46, 0.88) 100%);
  }

  .bleed {
    min-height: 0;
  }
}

.frame-border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(217, 182, 144, 0.28);
}

.frame-border--tint {
  border-color: rgba(217, 182, 144, 0.24);
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
  letter-spacing: -0.015em;
  font-family: var(--serif);
  font-weight: 300;
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
  letter-spacing: -0.015em;
  font-family: var(--serif);
  font-weight: 300;
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

.divider-flourish {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(217, 182, 144, 0.4), transparent);
  max-width: 1320px;
  margin: 0 auto;
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

.micro-label {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold-lt);
}

.micro-label--dark {
  color: var(--gold-dk);
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
  letter-spacing: -0.015em;
  font-family: var(--serif);
  font-weight: 300;
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

</style>
