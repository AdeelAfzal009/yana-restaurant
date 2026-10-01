<template>
  <div class="yana-page">
    <!-- ===================== HERO ===================== -->
    <header id="home" class="hero">
      <video
        v-if="heroVideo && !reducedMotion"
        class="hero-video"
        :poster="heroImage"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
      >
        <source :src="heroVideo" type="video/mp4">
      </video>
      <div v-else class="hero-img" :class="{ 'no-zoom': !heroKenBurns }" :style="{ backgroundImage: `url('${heroImage}')` }" />
      <div class="hero-scrim" />
      <div aria-hidden="true" class="hero-fade" />
      <div class="hero-content">
        <div v-reveal="{ y: 24, duration: 1.1 }">
          <span class="hero-eyebrow">
            <span class="rule rule-left" />Pan Asian Fusion Peruvian Flair<span class="rule rule-right" />
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


    <!-- ===================== INTRO ===================== -->
    <section class="intro">
      <div v-reveal="{ y: 26 }" class="intro-head">
        <!-- Fire & sea, drawn in one line: a flame over a wave. -->
        <svg class="intro-mark" viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M60 6c6 9 10 14 10 21a10 10 0 0 1-20 0c0-4 2-7 4-10 1 4 3 6 5 7-1-7 0-12 1-18Z" />
          <path d="M26 44c6 0 6-5 12-5s6 5 12 5 6-5 12-5 6 5 12 5 6-5 12-5" />
          <path d="M20 54c7 0 7-5 14-5s7 5 14 5 7-5 14-5 7 5 14 5 7-5 14-5" opacity="0.55" />
        </svg>
        <h2 class="intro-title">YANA Abu Dhabi: a Pan-Asian kitchen<br>with Peruvian flair on Saadiyat Island</h2>
        <p class="intro-copy">Set on Al Saadiyat Island, YANA brings together the citrus-bright kitchens of coastal Peru and the quiet precision of Pan-Asian cooking. Guests dine in a room of deep blue and brass, take long lunches on the terrace under the palms, and linger at the bar over pisco, matcha and cold-pressed coolers. Ceviches and tiraditos open the evening; the Josper grill carries it late into the night.</p>
        <NuxtLink to="/reservation" class="intro-btn">Make a Reservation</NuxtLink>
      </div>

      <div v-reveal="{ y: 26, delay: 0.12 }" class="intro-cols">
        <div class="intro-col">
          <h3 class="intro-col-title">Restaurant</h3>
          <svg aria-hidden="true" class="intro-flourish" viewBox="0 0 48 12" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
            <path d="M2 6h14" /><path d="M32 6h14" />
            <path d="M24 2.6c-2.4 0-3.6 1.4-3.6 3.4S21.6 9.4 24 9.4 27.6 8 27.6 6 26.4 2.6 24 2.6Z" />
          </svg>
          <p>Lunch &amp; Dinner | Sunday &ndash; Thursday | 9am &ndash; 10pm</p>
          <p>Friday &amp; Saturday | 9am &ndash; midnight</p>
        </div>
        <div class="intro-col">
          <h3 class="intro-col-title">The Terrace &amp; Bar</h3>
          <svg aria-hidden="true" class="intro-flourish" viewBox="0 0 48 12" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
            <path d="M2 6h14" /><path d="M32 6h14" />
            <path d="M24 2.6c-2.4 0-3.6 1.4-3.6 3.4S21.6 9.4 24 9.4 27.6 8 27.6 6 26.4 2.6 24 2.6Z" />
          </svg>
          <p>Open daily alongside the dining room</p>
          <p>Pisco, matcha, coolers &amp; cold-pressed juices</p>
        </div>
        <div class="intro-col">
          <h3 class="intro-col-title">Reservations</h3>
          <svg aria-hidden="true" class="intro-flourish" viewBox="0 0 48 12" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
            <path d="M2 6h14" /><path d="M32 6h14" />
            <path d="M24 2.6c-2.4 0-3.6 1.4-3.6 3.4S21.6 9.4 24 9.4 27.6 8 27.6 6 26.4 2.6 24 2.6Z" />
          </svg>
          <p><a href="tel:+97124476998">+971 2 447 6998</a></p>
          <p><a href="mailto:info@yanarestaurants.com">info@yanarestaurants.com</a></p>
        </div>
      </div>
    </section>

    <!-- ===================== KITCHEN (split feature) ===================== -->
    <section id="cuisine" class="split">
      <div class="split-media">
        <div class="split-photo" :style="{ backgroundImage: `url('${kitchenRoomImage}')` }" role="img" aria-label="The YANA dining room" />
      </div>
      <div class="split-panel">
        <div aria-hidden="true" class="split-pattern" />
        <div v-reveal="{ y: 28 }" class="split-inner">
          <div class="split-dish" :style="{ backgroundImage: `url('${signatureDishImage}')` }" role="img" aria-label="Signature plates at YANA" />
          <span class="eyebrow eyebrow-dark split-eyebrow"><span class="rule-short" />01 — Food</span>
          <h2 class="split-title">La Cocina de YANA</h2>
          <p class="split-copy">YANA is a Pan-Asian kitchen with Peruvian flair, built on fire, citrus and restraint. Plates are made to be shared, and the room is made to be lingered in.</p>
          <p class="split-copy">Signature dishes like Hotate Tiradito, Miso Black Cod and the Andean Striploin carry the Nikkei thread, while Chocolate &amp; Lucuma Mochi and the Matcha Cheesecake close the evening.</p>
          <NuxtLink to="/menu" class="split-link">Discover Our Menus <span aria-hidden="true">→</span></NuxtLink>
        </div>
      </div>
    </section>

    <!-- ===================== FOOD (previous layout — hidden, kept for reference) =====================
         Flip showLegacyFoodSection to true in the script below to bring it back. -->
    <section v-if="showLegacyFoodSection" id="cuisine-legacy" class="feature section-light">
      <span aria-hidden="true" class="ghost-word ghost-center">FOOD</span>
      <div class="feature-grid">
        <div v-reveal="{ y: 30 }" class="feature-text">
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />01 — Food</span>
          <h2 class="h2-dark">Discover the flavours<br>of Peru at YANA</h2>
          <p class="body-copy">Experience the vibrant flavours of Peru, reimagined on Saadiyat Island.</p>
          <p class="body-copy">A curated menu of fresh ceviches, silken tiraditos and anticuchos charred over the Josper grill — Nikkei precision met with Peruvian soul.</p>
          <p class="body-copy">Set in a dining room of deep blue and brass, YANA offers a culinary journey that blends authentic Peruvian tastes with the fire of the East.</p>
          <NuxtLink to="/menu" class="link-underline">Explore the Menu</NuxtLink>
        </div>
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-media">
          <svg aria-hidden="true" class="feature-frame" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="2.5,3.5 98,0 99.5,96.5 0,99" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="feature-photo" :style="{ backgroundImage: `url('${signatureDishImage}')` }" />
        </div>
      </div>
    </section>

    <!-- ===================== PULL QUOTE ===================== -->
    <section class="pull-quote">
      <blockquote v-reveal="{ y: 24 }" class="pull-quote-text">
        &lsquo;YANA is not a fusion restaurant. It&rsquo;s one kitchen that remembers two coastlines.&rsquo;
      </blockquote>
    </section>

    <!-- ===================== PISCO BAR (dark band) ===================== -->
    <section id="bar" class="feature feature--dark">
      <div aria-hidden="true" class="pattern-dark pattern-dark--tall" />
      <span aria-hidden="true" class="ghost-word ghost-word--light ghost-center">PISCO BAR</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30 }" class="feature-text">
          <span class="eyebrow eyebrow-light"><span class="rule-short" />02 — Pisco Bar</span>
          <h2 class="h2-light">Unwind over pisco,<br>late into the night</h2>
          <p class="body-copy body-copy--light">A bar built around Peru's national spirit — pisco sours shaken to order, chilcanos over crushed ice and Nikkei-leaning cocktails poured against deep blue and brass.</p>
          <p class="body-copy body-copy--light">Matchas, coolers and cold-pressed juices run alongside, so every table finds its pour.</p>
          <NuxtLink to="/menu?menu=drinks" class="link-underline link-underline--light">Discover the Drinks</NuxtLink>
        </div>
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-media">
          <svg aria-hidden="true" class="feature-frame feature-frame--light" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="1.5,2.5 98.5,0.5 99,97.5 0.5,99" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="feature-photo feature-photo--portrait" :style="{ backgroundImage: `url('${barImage}')` }" />
        </div>
      </div>
    </section>

    <!-- ===================== TERRACE ===================== -->
    <section id="terrace" class="feature section-light">
      <span aria-hidden="true" class="ghost-word ghost-left">TERRACE</span>
      <div class="feature-grid">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />03 — The Terrace</span>
          <h2 class="h2-dark">Sea breeze, palms<br>and long lunches</h2>
          <p class="body-copy">Marble-topped tables under the palms, the Gulf a few steps away. The terrace is made for slow afternoons — ceviche, a cooler in hand and the island quiet around you.</p>
          <p class="body-copy">As the light drops, lanterns come on and lunch turns, unhurried, into dinner.</p>
          <NuxtLink to="/gallery" class="link-underline">See the Gallery</NuxtLink>
        </div>
        <div v-reveal="{ y: 30 }" class="feature-media">
          <svg aria-hidden="true" class="feature-frame" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="1,3 99,0 97.5,97 2,99.5" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="feature-photo feature-photo--tall" :style="{ backgroundImage: `url('${terraceImage}')` }" />
        </div>
      </div>
    </section>

    <!-- ===================== EVENINGS (full-bleed) ===================== -->
    <section id="evenings" class="bleed">
      <div class="bleed-bg" :style="{ backgroundImage: `url('${eveningImage}')` }" />
      <div aria-hidden="true" class="bleed-scrim" />
      <span aria-hidden="true" class="ghost-word ghost-word--light ghost-bottom-left">EVENINGS</span>
      <div class="bleed-inner">
        <div v-reveal="{ y: 30 }" class="bleed-text">
          <span class="eyebrow eyebrow-light"><span class="rule-short" />04 — Evenings</span>
          <h2 class="h2-light">When the lights<br>come on</h2>
          <p class="body-copy body-copy--light">Brass glows, the grill settles into rhythm and the room fills. Evenings at YANA are long and warm — a dining room wrapped in deep blue, a bar that keeps pouring, and a table worth lingering at.</p>
          <NuxtLink to="/reservation" class="link-underline link-underline--light">Plan Your Evening</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ===================== OUR STORY ===================== -->
    <section id="story" class="feature section-light">
      <span aria-hidden="true" class="ghost-word ghost-left">PERU</span>
      <div class="feature-grid feature-grid--reverse">
        <div v-reveal="{ y: 30, delay: 0.15 }" class="feature-text">
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />05 — Our Story</span>
          <h2 class="h2-dark">Two coastlines,<br>one table.</h2>
          <p class="body-copy">YANA is a meeting of distant shores — the citrus-bright kitchens of coastal Peru and the quiet mastery of Pan-Asian cuisine. Set against the hush of Saadiyat Island, each plate is an invitation to linger over fire, sea and spice long into the Abu Dhabi night.</p>
          <p class="body-copy">We cook over open flame, pour with intention, and treat every evening as a slow, deliberate occasion.</p>
          <p class="story-signoff">— The House of YANA</p>
        </div>
        <div v-reveal="{ y: 30 }" class="feature-media">
          <svg aria-hidden="true" class="feature-frame" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="2,2 98.5,1 98,98 1,97" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="feature-photo feature-photo--tall" :style="{ backgroundImage: `url('${storyImage}')` }" />
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

    <!-- ===================== VISIT (map + details) ===================== -->
    <section id="location" class="visit">
      <a
        class="visit-map"
        :href="mapsProfileUrl"
        target="_blank"
        rel="noopener"
        aria-label="Open YANA on Google Maps"
      >
        <img src="/images/yana-map.webp" alt="Map showing YANA on Al Saadiyat Island, Abu Dhabi" width="1200" height="1200" loading="lazy" decoding="async">
        <span class="visit-map-cta">View on Google Maps <span aria-hidden="true">↗</span></span>
      </a>
      <div class="visit-panel">
        <div aria-hidden="true" class="split-pattern" />
        <div v-reveal="{ y: 26 }" class="visit-inner">
          <h2 class="visit-title">YANA Abu Dhabi</h2>
          <p class="visit-copy">On Al Saadiyat Island, minutes from the museums and the beach — a Pan-Asian kitchen with Peruvian flair, open from morning coffee to late dinner.</p>
          <dl class="visit-rows">
            <div class="visit-row">
              <dt>Address</dt>
              <dd><a href="https://maps.google.com/?q=YANA+Restaurant+Al+Saadiyat+Island+Abu+Dhabi" target="_blank" rel="noopener">Al Saadiyat Island &ndash; Abu Dhabi</a></dd>
            </div>
            <div class="visit-row">
              <dt>Phone</dt>
              <dd><a href="tel:+97124476998">+971 2 447 6998</a></dd>
            </div>
            <div class="visit-row">
              <dt>Contact</dt>
              <dd><a href="mailto:info@yanarestaurants.com">info@yanarestaurants.com</a></dd>
            </div>
            <div class="visit-row">
              <dt>Opening hours</dt>
              <dd>Sunday &ndash; Thursday | 9am &ndash; 10pm<br>Friday &amp; Saturday | 9am &ndash; midnight</dd>
            </div>
            <div class="visit-row">
              <dt>Reservations</dt>
              <dd><NuxtLink to="/reservation">Book a table online</NuxtLink></dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- ===================== LOCATION & HOURS (previous layout — hidden, kept for reference)
         Flip showLegacyLocationSection to true in the script to bring it back. -->
    <section v-if="showLegacyLocationSection" id="location-legacy" class="section-pad-tight section-light">
      <div class="location-grid">
        <div v-reveal>
          <span class="eyebrow eyebrow-dark"><span class="rule-short" />06 — Visit</span>
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
    <YanaMarquee />
  </div>
</template>

<script setup lang="ts">
// TEMPORARY placeholder for staging review only: this file belongs to COYA and is
// hotlinked from their server. Replace it with YANA's own footage before launch —
// drop an .mp4 into public/videos and point heroVideo at it, e.g. '/videos/hero.mp4'.
const heroVideo = 'https://coyarestaurant.com/uploads/content/pages/1698918469_44fefc7e-15ae-4f40-b8a4-dac51b658d78.mp4'
const heroImage = '/images/yana-image-2-mruiybvd-26zk.webp'
const ctaImage = '/images/yana-image-2-mrt9pbly-db2c.webp'
const signatureDishImage = '/images/food1.webp'
const kitchenRoomImage = '/images/yana-image-2-mruiybvd-26zk.webp'
// The previous "01 — Food" band is kept in the template but switched off.
const showLegacyFoodSection = false
// The previous "06 — Visit" block is kept in the template but switched off.
const showLegacyLocationSection = false
// YANA's Google listing — swap for the exact share link from the business profile.
const mapsProfileUrl = 'https://www.google.com/maps/search/?api=1&query=Yana+Restaurant+Al+Saadiyat+Island+Abu+Dhabi'
const barImage = '/images/bar-cocktails.webp'
const terraceImage = '/images/yana-image-3-mrt9rmoi-9m3z.webp'
const storyImage = '/images/yana-side-image-mrt8vz5a-90ny.webp'
const eveningImage = '/images/yana-image-4-mrt9n45r-v3w7.webp'
const heroKenBurns = true

// Visitors who ask for less motion get the still hero instead of the video.
const reducedMotion = ref(false)
onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

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

.intro-btn {
  display: inline-block;
  margin-top: clamp(30px, 4vw, 46px);
  padding: 17px 38px;
  border: 1px solid rgba(15, 30, 46, 0.5);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  transition: background 0.35s, color 0.35s, border-color 0.35s;
}

.intro-btn:hover {
  background: var(--ink);
  border-color: var(--ink);
  color: #ffffff;
}

.intro-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(24px, 4vw, 56px);
  max-width: 1240px;
  margin: clamp(56px, 7vw, 104px) auto 0;
}

.intro-col {
  position: relative;
  padding: 0 clamp(10px, 2vw, 28px);
}

.intro-col + .intro-col::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: rgba(138, 107, 69, 0.45);
}

.intro-col-title {
  margin: 0;
  font-size: clamp(14px, 1.5vw, 17px);
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-dk);
}

.intro-flourish {
  display: block;
  width: 48px;
  height: 12px;
  margin: 14px auto 20px;
  color: var(--gold);
}

.intro-col p {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.7;
  font-weight: 300;
  color: var(--ink-dim);
}

.intro-col a {
  color: var(--ink-dim);
  text-decoration: none;
  border-bottom: 1px solid rgba(217, 182, 144, 0.7);
  transition: color 0.3s;
}

.intro-col a:hover {
  color: var(--gold-dk);
}

@media (max-width: 860px) {
  .intro-cols {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .intro-col + .intro-col::before {
    left: 50%;
    right: auto;
    top: -18px;
    bottom: auto;
    width: 64px;
    height: 1px;
    transform: translateX(-50%);
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

.feature--dark {
  background: radial-gradient(120% 80% at 50% 0%, rgba(217, 182, 144, 0.14), transparent 55%), linear-gradient(180deg, #0f1e2e, #12426d 52%, #0f1e2e);
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  border-bottom: 1px solid rgba(217, 182, 144, 0.35);
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
  font-weight: 400;
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

/* The photo sits inside a hand-cut gold outline, as on COYA's feature blocks. */
.feature-media {
  position: relative;
  flex: 1 1 420px;
  min-width: 280px;
  padding: 26px 22px;
}

.feature-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: rgba(217, 182, 144, 0.75);
  transform: rotate(-1.8deg);
  pointer-events: none;
}

.feature-frame--light {
  color: rgba(217, 182, 144, 0.6);
  transform: rotate(1.6deg);
}

.feature-photo {
  position: relative;
  aspect-ratio: 4 / 4.5;
  background-color: var(--panel);
  background-size: cover;
  /* The dishes sit low in the frame, so bias the crop downward. */
  background-position: center 58%;
  background-repeat: no-repeat;
  clip-path: polygon(1% 2.5%, 99.5% 0%, 98.5% 98%, 0.5% 100%);
}

.feature-photo--portrait {
  aspect-ratio: 4 / 5.1;
  background-position: center 62%;
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

.split-dish {
  aspect-ratio: 16 / 9;
  margin-bottom: clamp(28px, 3.5vw, 48px);
  background-size: cover;
  background-position: center 58%;
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
