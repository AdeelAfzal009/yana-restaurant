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
        <div v-if="c.hero.showEyebrow && c.hero.eyebrow" v-reveal="{ y: 24, duration: 1.1 }">
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
          <img v-if="c.kitchen.dishImage.src" :src="c.kitchen.dishImage.src" :alt="c.kitchen.dishImage.alt" class="split-dish" loading="lazy" decoding="async">
          <span v-if="c.kitchen.showEyebrow && c.kitchen.eyebrow" class="eyebrow eyebrow-dark split-eyebrow"><span class="rule-short" />{{ c.kitchen.eyebrow }}</span>
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
    <section v-if="c.bar.visible" id="bar" class="feature feature--dark" :style="sectionBackground(c.bar.bgColor)">
      <div v-if="c.bar.showBgImage" aria-hidden="true" class="pattern-dark pattern-dark--tall" />
      <span v-if="c.bar.showGhost && c.bar.ghost" aria-hidden="true" class="ghost-word ghost-word--light ghost-center">{{ c.bar.ghost }}</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30 }" class="feature-text">
          <span v-if="c.bar.showEyebrow && c.bar.eyebrow" class="eyebrow eyebrow-light"><span class="rule-short" />{{ c.bar.eyebrow }}</span>
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
      <span v-if="c.terrace.showGhost && c.terrace.ghost" aria-hidden="true" class="ghost-word ghost-left">{{ c.terrace.ghost }}</span>
      <div class="feature-grid">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span v-if="c.terrace.showEyebrow && c.terrace.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.terrace.eyebrow }}</span>
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
      <span v-if="c.evenings.showGhost && c.evenings.ghost" aria-hidden="true" class="ghost-word ghost-word--light ghost-bottom-left">{{ c.evenings.ghost }}</span>
      <div class="bleed-inner">
        <div v-reveal="{ y: 30 }" class="bleed-text">
          <span v-if="c.evenings.showEyebrow && c.evenings.eyebrow" class="eyebrow eyebrow-light"><span class="rule-short" />{{ c.evenings.eyebrow }}</span>
          <h2 class="h2-light" v-html="richText(c.evenings.title)" />
          <p v-for="(p, i) in paragraphs(c.evenings.body)" :key="i" class="body-copy body-copy--light" v-html="richText(p)" />
          <CmsLink :link="c.evenings.button" class="link-underline link-underline--light" />
        </div>
      </div>
    </section>

    <!-- Two cream sections meet when Evenings is switched off, so a fine line separates them. -->
    <div v-if="c.terrace.visible && c.story.visible && !c.evenings.visible" aria-hidden="true" class="section-divider" />

    <!-- ===================== OUR STORY ===================== -->
    <section v-if="c.story.visible" id="story" class="feature section-light">
      <span v-if="c.story.showGhost && c.story.ghost" aria-hidden="true" class="ghost-word ghost-left">{{ c.story.ghost }}</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span v-if="c.story.showEyebrow && c.story.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.story.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.story.title)" />
          <p v-for="(p, i) in paragraphs(c.story.body)" :key="i" class="body-copy" v-html="richText(p)" />
          <p v-if="c.story.signoff" class="story-signoff">{{ c.story.signoff }}</p>
        </div>
        <div v-reveal="{ y: 30 }" class="feature-media">
          <div class="feature-photo feature-photo--tall" :style="bg(c.story.image.src)" role="img" :aria-label="c.story.image.alt" />
        </div>
      </div>
    </section>

    <!-- ===================== PHOTO STRIP (endless scroll) ===================== -->
    <section v-if="c.strip.visible && stripPhotos.length" class="strip-section" :style="sectionBackground(c.strip.bgColor)">
      <div v-if="c.strip.title || c.strip.body || (c.strip.showEyebrow && c.strip.eyebrow)" v-reveal="{ y: 24 }" class="strip-intro">
        <span v-if="c.strip.showEyebrow && c.strip.eyebrow" class="eyebrow eyebrow-light strip-eyebrow"><span class="rule-short" />{{ c.strip.eyebrow }}</span>
        <h2 v-if="c.strip.title" class="strip-title" v-html="richText(c.strip.title)" />
        <p v-for="(p, i) in paragraphs(c.strip.body)" :key="i" class="strip-copy" v-html="richText(p)" />
      </div>
      <!-- Two copies side by side, so sliding by half loops without a seam. Pauses on hover. -->
      <div class="strip">
        <div class="strip-track">
          <ul v-for="copy in 2" :key="copy" class="strip-row" :aria-hidden="copy === 2 ? 'true' : undefined">
            <li v-for="(photo, i) in stripPhotos" :key="i" class="strip-item">
              <img :src="photo.src" :alt="copy === 1 ? photo.alt : ''" loading="lazy" decoding="async">
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ===================== GUEST REVIEWS (carousel) ===================== -->
    <section
      v-if="c.testimonials.visible && quotes.length"
      class="reviews"
      :style="sectionBackground(c.testimonials.bgColor)"
      aria-roledescription="carousel"
      aria-label="What our guests say"
      @mouseenter="pauseQuotes = true"
      @mouseleave="pauseQuotes = false"
      @focusin="pauseQuotes = true"
      @focusout="pauseQuotes = false"
    >
      <div class="reviews-viewport">
        <div class="reviews-track" :style="{ transform: `translate3d(-${quoteIndex * 100}%, 0, 0)` }">
          <figure v-for="(q, i) in quotes" :key="i" class="review" :aria-hidden="i !== quoteIndex" :inert="i !== quoteIndex">
            <span aria-hidden="true" class="review-mark">&ldquo;</span>
            <blockquote class="review-quote">
              <p v-html="richText(q.quote)" />
            </blockquote>
            <span aria-hidden="true" class="review-mark review-mark--close">&ldquo;</span>
            <figcaption class="review-by">
              <span class="review-name">{{ q.name }}</span>
              <template v-if="q.detail"><br>{{ q.detail }}</template>
            </figcaption>
          </figure>
        </div>
      </div>
      <div v-if="quotes.length > 1" class="reviews-nav">
        <button type="button" class="reviews-btn" aria-label="Show the previous quote" @click="stepQuote(-1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <ul class="reviews-dots">
          <li v-for="(q, i) in quotes" :key="i">
            <button
              type="button"
              class="reviews-dot"
              :class="{ 'is-active': i === quoteIndex }"
              :aria-label="`Show the quote from ${q.name}`"
              :aria-current="i === quoteIndex"
              @click="quoteIndex = i"
            />
          </li>
        </ul>
        <button type="button" class="reviews-btn" aria-label="Show the next quote" @click="stepQuote(1)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </section>

    <div v-if="c.moments.visible" aria-hidden="true" class="section-divider" />

    <!-- ===================== BEST SHOTS (carousel) ===================== -->
    <section v-if="c.moments.visible && shots.length" class="shots-section">
      <div class="shots" @mouseenter="pauseShots = true" @mouseleave="pauseShots = false" @focusin="pauseShots = true" @focusout="pauseShots = false">
        <div v-if="c.moments.showIntro" v-reveal="{ y: 26 }" class="shots-head">
          <span v-if="c.moments.showEyebrow && c.moments.eyebrow" class="eyebrow eyebrow-dark"><span class="rule-short" />{{ c.moments.eyebrow }}</span>
          <h2 class="h2-dark" v-html="richText(c.moments.title)" />
          <p v-for="(p, i) in paragraphs(c.moments.body)" :key="i" class="body-copy shots-copy" v-html="richText(p)" />
          <CmsLink :link="c.moments.instagram" class="shots-insta">
            <template #before>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
            </template>
          </CmsLink>
        </div>
        <!-- Photos with the arrows over their left and right edges. -->
        <div v-reveal="{ y: 26, delay: 0.1 }" class="shots-stage">
          <div ref="shotsTrack" class="shots-track" role="region" aria-label="Photos of YANA" tabindex="0" @scroll.passive="onShotsScroll" @touchstart.passive="pauseShots = true">
            <figure v-for="(shot, i) in shots" :key="i" class="shot">
              <img :src="shot.image.src" :alt="shot.image.alt" width="750" height="1000" loading="lazy" decoding="async">
              <figcaption v-if="shot.label" class="shot-caption">{{ shot.label }}</figcaption>
            </figure>
          </div>
          <button type="button" class="shots-btn shots-btn--prev" aria-label="Previous photos" @click="scrollShots(-1)">
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M21 6H1M6 1 1 6l5 5" /></svg>
          </button>
          <button type="button" class="shots-btn shots-btn--next" aria-label="Next photos" @click="scrollShots(1)">
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" /></svg>
          </button>
        </div>
        <!-- Counter and progress line under the photos. -->
        <div class="shots-foot" aria-hidden="true">
          <span class="shots-count">{{ String(shotIndex + 1).padStart(2, '0') }} <span class="shots-count-total">/ {{ String(shots.length).padStart(2, '0') }}</span></span>
          <div class="shots-progress">
            <span class="shots-progress-bar" :style="{ transform: `scaleX(${shotsProgress})` }" />
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== RESERVATION CTA ===================== -->
    <section v-if="c.reserve.visible" id="reserve" class="cta-section">
      <div class="cta-bg" :style="bg(c.reserve.image.src)" />
      <div class="cta-scrim" />
      <div v-reveal class="cta-content">
        <span v-if="c.reserve.showEyebrow && c.reserve.eyebrow" class="eyebrow-plain">{{ c.reserve.eyebrow }}</span>
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
        <!-- Map and pin share one square canvas, so the pin stays on the spot however the map is cropped. -->
        <span class="visit-map-canvas">
          <img :src="c.visit.mapImage.src" :alt="c.visit.mapImage.alt" width="1046" height="1024" loading="lazy" decoding="async">
          <span v-if="c.visit.showPin" class="map-marker" aria-hidden="true">
            <span class="map-ripple" />
            <span class="map-ripple map-ripple--2" />
            <span class="map-ripple map-ripple--3" />
            <span class="map-tile">
              <!-- Hand-drawn line art: a flame rising from the sea, under a low sun. -->
              <svg class="map-art" viewBox="0 0 120 84" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path class="map-art-sun" d="M93.5 13.2c4.1-.3 7.6 2.9 7.8 7 .2 4.3-3.2 7.7-7.4 7.8-4.1.1-7.5-3.1-7.7-7.2-.2-4 3-7.4 7.3-7.6Z" />
                <path class="map-art-flame" d="M59.6 12.4c4.9 7.1 8.4 11.3 8.1 17-.3 5-4.2 8.6-8.9 8.3-4.6-.3-7.8-3.9-7.6-8.4.1-3.2 1.8-5.6 3.4-8 .8 3.1 2.3 4.8 4.1 5.6-.8-5.4.1-9.6.9-14.5Z" />
                <path class="map-art-wave" d="M13 47.5c5.6-.4 6.3-4.8 11.9-5 5.8-.2 6.2 4.6 12.1 4.6 5.7 0 6.4-4.9 12.2-4.8 5.9.1 6.1 4.7 11.9 4.8 5.8.1 6.6-4.6 12.3-4.6 5.9 0 6 4.8 11.8 4.8 5.6 0 6.5-4.4 12.3-4.6" />
                <path class="map-art-wave map-art-wave--soft" d="M24 59.2c5.2-.2 5.9-4.1 11.2-4.2 5.4-.1 5.7 4.1 11.1 4.1 5.3 0 6-4.2 11.4-4.1 5.4.1 5.6 4.1 11 4.2 5.3.1 6.1-4 11.4-4 5.2 0 5.9 3.8 10.6 4" />
                <path class="map-art-wave map-art-wave--faint" d="M38 70.1c4.4 0 5-3.3 9.5-3.4 4.6 0 4.8 3.4 9.4 3.4 4.5 0 5.1-3.4 9.6-3.3 4.4.1 4.8 3.3 9.3 3.3" />
              </svg>
              <span class="map-word">YANA</span>
            </span>
          </span>
        </span>
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

// Photo strip: only photos that have an image.
const stripPhotos = computed(() => c.value.strip.photos.map(p => p.image).filter(img => img.src))

// Guest reviews: one quote at a time, moving on every 8 seconds unless the
// visitor is reading (hover / keyboard focus) or prefers less motion.
const quotes = computed(() => c.value.testimonials.quotes.filter(q => q.quote))
const quoteIndex = ref(0)
const pauseQuotes = ref(false)
function stepQuote(dir: 1 | -1) {
  const n = quotes.value.length
  if (n) quoteIndex.value = (quoteIndex.value + dir + n) % n
}
watch(() => quotes.value.length, (n) => {
  if (quoteIndex.value >= n) quoteIndex.value = 0
})

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

let quotesTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (reducedMotion.value) return
  quotesTimer = setInterval(() => {
    if (!pauseQuotes.value && !document.hidden && quotes.value.length > 1) stepQuote(1)
  }, 8000)
})
onUnmounted(() => clearInterval(quotesTimer))

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
  color: var(--heading-on-light, #12426D);
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

/* Optional heading block above the photos. */
.shots-head {
  max-width: 560px;
  margin-bottom: clamp(32px, 4vw, 52px);
}

/* The photos, with the arrows over their left and right edges. */
.shots-stage {
  position: relative;
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

/* Counter beside the progress line, under the photos. */
.shots-foot {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2.4vw, 28px);
  margin-top: clamp(26px, 3vw, 36px);
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
  flex: 1;
  height: 1px;
  background: rgba(138, 107, 69, 0.2);
}

.shots-progress-bar {
  position: absolute;
  inset: 0;
  background: var(--gold-dk);
  transform-origin: left center;
  transition: transform 0.4s ease;
}

/* Round arrows centred on the photos' height, half over each outer edge. */
.shots-btn {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid rgba(138, 107, 69, 0.35);
  border-radius: 50%;
  background: var(--panel);
  color: var(--gold-dk);
  box-shadow: 0 10px 26px rgba(15, 30, 46, 0.16);
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s, transform 0.3s;
}

.shots-btn--prev {
  left: 0;
  transform: translate(-50%, -50%);
}

.shots-btn--next {
  right: 0;
  transform: translate(50%, -50%);
}

.shots-btn:hover,
.shots-btn:focus-visible {
  background: var(--gold-dk);
  border-color: var(--gold-dk);
  color: var(--panel);
}

.shots-track:focus-visible {
  outline: 1px solid var(--gold-dk);
  outline-offset: 6px;
}

/* Narrow screens have little side room, so the arrows sit just inside the photos. */
@media (max-width: 900px) {
  .shots-btn {
    width: 44px;
    height: 44px;
  }

  .shots-btn--prev {
    left: 10px;
    transform: translateY(-50%);
  }

  .shots-btn--next {
    right: 10px;
    transform: translateY(-50%);
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
  /* Lets the canvas below size itself against this box (cqw / cqh). */
  container-type: size;
}

/* A square that covers the box like object-fit: cover, so map and pin crop
   and zoom together. Inside it, 1cqw = 1% of the map (12px of the 1200px image). */
.visit-map-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  width: max(100cqw, 100cqh);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  container-type: inline-size;
  transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.visit-map-canvas img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Maps that aren't exactly square are trimmed, not stretched. */
  object-fit: cover;
}

.visit-map:hover .visit-map-canvas {
  transform: translate(-50%, -50%) scale(1.04);
}

/* ---- YANA map marker: a rounded tile with a pointer (the same idea as
   GIGI's), in YANA blue with gold and cream line art. Its pointer sits on
   the restaurant: 582, 588 of the 1200px map. ---- */
.map-marker {
  --tile: max(16cqw, 92px);
  position: absolute;
  left: 48.5%;
  top: 49%;
  width: 0;
  height: 0;
}

.map-tile {
  position: absolute;
  left: 0;
  bottom: calc(var(--tile) * 0.12);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--tile) * 0.04);
  width: var(--tile);
  aspect-ratio: 1;
  border-radius: calc(var(--tile) * 0.1);
  background: #12426D;
  box-shadow: 0 calc(var(--tile) * 0.06) calc(var(--tile) * 0.14) rgba(15, 30, 46, 0.3);
  transform: translateX(-50%);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* Fine gold frame inside the tile. */
.map-tile::before {
  content: '';
  position: absolute;
  inset: calc(var(--tile) * 0.05);
  border: 1px solid rgba(217, 182, 144, 0.5);
  border-radius: calc(var(--tile) * 0.065);
}

/* The pointer under the tile. */
.map-tile::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: calc(var(--tile) * -0.12 + 1px);
  width: calc(var(--tile) * 0.2);
  height: calc(var(--tile) * 0.12);
  background: #12426D;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform: translateX(-50%);
}

.visit-map:hover .map-tile {
  transform: translateX(-50%) translateY(calc(var(--tile) * -0.04));
}

.map-art {
  width: 78%;
  overflow: visible;
}

.map-art-flame,
.map-art-sun {
  stroke: #D9B690;
  stroke-width: 2.4;
}

.map-art-wave {
  stroke: #F3ECE1;
  stroke-width: 2.4;
}

.map-art-wave--soft {
  opacity: 0.7;
}

.map-art-wave--faint {
  opacity: 0.4;
}

.map-word {
  position: relative;
  font-size: calc(var(--tile) * 0.075);
  font-weight: 500;
  letter-spacing: 0.42em;
  margin-right: -0.42em;
  color: #D9B690;
}

/* Sea vibe: soft rings spreading over the water from the pin. */
.map-ripple {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(var(--tile) * 0.42);
  aspect-ratio: 2.6 / 1;
  border: 1.5px solid rgba(18, 66, 109, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.4);
  opacity: 0;
  animation: mapRipple 3.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
}

.map-ripple--2 {
  animation-delay: 1.2s;
}

.map-ripple--3 {
  animation-delay: 2.4s;
}

@keyframes mapRipple {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(4.2); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .map-ripple {
    animation: none;
  }

  .map-ripple--2 {
    opacity: 0.35;
    transform: translate(-50%, -50%) scale(1.8);
  }
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
  color: var(--heading-on-light, #12426D);
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
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
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
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(24px, 3.4vw, 46px);
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--gold-dk);
}

/* ---------- Photo strip: navy band, endlessly scrolling photos ---------- */
.strip-section {
  background: var(--blue-dk);
}

.strip-intro {
  max-width: 1040px;
  margin: 0 auto;
  padding: clamp(64px, 8vw, 110px) clamp(22px, 5vw, 60px) clamp(48px, 6vw, 88px);
  text-align: center;
}

.strip-eyebrow {
  justify-content: center;
  margin-bottom: 18px;
}

.strip-title {
  margin: 0 0 20px;
  font-size: clamp(26px, 3.2vw, 44px);
  font-weight: 300;
  line-height: 1.25;
  letter-spacing: 0.01em;
  color: #F3ECE1;
}

.strip-copy {
  max-width: 860px;
  margin: 0 auto;
  font-size: clamp(14px, 1.1vw, 16px);
  font-weight: 300;
  line-height: 1.85;
  color: rgba(243, 236, 225, 0.72);
}

.strip-copy + .strip-copy {
  margin-top: 14px;
}

.strip {
  overflow: hidden;
}

.strip-track {
  display: flex;
  width: max-content;
  animation: stripScroll 60s linear infinite;
}

.strip:hover .strip-track {
  animation-play-state: paused;
}

.strip-row {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  margin: 0;
  padding: 0 4px 0 0;
  list-style: none;
}

.strip-item {
  position: relative;
  flex-shrink: 0;
  height: clamp(240px, 30vw, 380px);
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.strip-item img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.strip-item:hover img {
  transform: scale(1.04);
}

@keyframes stripScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ---------- Guest reviews: one quote at a time ---------- */
.reviews {
  padding: clamp(56px, 6vw, 72px) 28px clamp(72px, 8vw, 104px);
  background: var(--blue-dk);
}

.reviews-viewport {
  max-width: 820px;
  margin: 0 auto;
  overflow: hidden;
}

.reviews-track {
  display: flex;
  will-change: transform;
  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}

.review {
  flex-shrink: 0;
  width: 100%;
  margin: 0;
  padding: 0 4px;
  text-align: center;
}

.review-mark {
  display: block;
  font-size: 3rem;
  font-weight: 300;
  line-height: 1;
  color: rgba(217, 182, 144, 0.7);
}

.review-mark--close {
  transform: rotate(180deg);
}

.review-quote {
  margin: 4px 0;
}

.review-quote p {
  max-width: 760px;
  margin: 0 auto;
  font-size: clamp(17px, 1.5vw, 21px);
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
  color: #F3ECE1;
}

.review-by {
  margin-top: 36px;
  font-size: 12px;
  line-height: 1.7;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #C7D0D8;
}

.review-name {
  color: var(--gold);
}

.reviews-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.reviews-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: transparent;
  color: var(--gold);
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s, color 0.3s;
}

.reviews-btn:hover,
.reviews-btn:focus-visible {
  border-color: var(--gold);
  background: var(--gold);
  color: var(--blue-dk);
}

.reviews-dots {
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reviews-dot {
  display: block;
  width: 6px;
  height: 6px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: width 0.5s ease, background 0.5s ease;
}

.reviews-dot:hover {
  background: rgba(255, 255, 255, 0.45);
}

.reviews-dot.is-active {
  width: 28px;
  background: var(--gold);
}

@media (prefers-reduced-motion: reduce) {
  .strip {
    overflow-x: auto;
  }

  .strip-track {
    animation: none;
  }

  .reviews-track {
    transition: none;
  }
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

/* Full width of the text column, at the photo's own shape (landscape or
   portrait), so whatever is chosen in the dashboard is never cropped. */
.split-dish {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: clamp(28px, 3.5vw, 48px);
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
  color: var(--heading-on-light, #12426D);
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
  color: var(--heading-on-light, #12426D);
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
</style>
