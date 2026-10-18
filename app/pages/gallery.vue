<template>
  <div class="yana-page">
    <header class="gallery-banner" :class="sectionTone(c.banner.bgColor, c.banner.showBgImage)" :style="sectionBackground(c.banner.bgColor)">
      <template v-if="c.banner.showBgImage">
        <div aria-hidden="true" class="banner-bg" :style="bg(c.banner.image.src)" />
        <div aria-hidden="true" class="banner-scrim" />
      </template>
      <div aria-hidden="true" class="banner-fade" />
      <div class="banner-content">
        <span v-if="c.banner.showEyebrow && c.banner.eyebrow" class="eyebrow-plain"><span class="rule-short" />{{ c.banner.eyebrow }}</span>
        <h1 class="banner-title">{{ c.banner.title }}</h1>
        <p v-if="c.banner.subtitle" class="banner-sub">{{ c.banner.subtitle }}</p>
      </div>
    </header>

    <!-- MOSAIC -->
    <section v-if="c.photos.visible && photos.length" class="mosaic-section">
      <div class="mosaic-inner">
        <div class="mosaic-grid">
          <button
            v-for="(photo, i) in photos"
            :key="i"
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

    <!-- INSTAGRAM VIDEOS: playing while on screen; each opens an Instagram-style popup -->
    <section v-if="c.reels.visible && reels.length" class="reels-section">
      <div class="reels-inner">
        <div class="reels-head">
          <div>
            <span v-if="c.reels.showEyebrow && c.reels.eyebrow" class="eyebrow-plain eyebrow-plain--dark"><span class="rule-short" />{{ c.reels.eyebrow }}</span>
            <h2 v-if="c.reels.title" class="h2-dark reels-title">{{ c.reels.title }}</h2>
          </div>
          <div v-if="reelsScroll.canScroll" class="reels-nav">
            <button type="button" class="reels-btn" aria-label="Previous posts" :disabled="reelsScroll.atStart" @click="scrollReels(-1)">
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 6H1M6 1 1 6l5 5" /></svg>
            </button>
            <button type="button" class="reels-btn" aria-label="Next posts" :disabled="reelsScroll.atEnd" @click="scrollReels(1)">
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 6h20M16 1l5 5-5 5" /></svg>
            </button>
          </div>
        </div>
        <ul ref="reelsTrack" class="reels-track" @scroll.passive="updateReelsScroll">
          <li v-for="(post, i) in reels" :key="post.id" class="reel">
            <button type="button" class="reel-card" :aria-label="`Open Instagram post${post.caption ? ': ' + excerpt(post.caption) : ''}`" @click="openReel(i)">
              <video
                v-if="post.type === 'video'"
                :src="post.media"
                :poster="post.cover || undefined"
                muted
                loop
                playsinline
                disablepictureinpicture
                preload="none"
                aria-hidden="true"
                class="reel-video"
                data-reel-video
              />
              <img v-else :src="post.media" alt="" class="reel-video" loading="lazy" decoding="async">
              <span aria-hidden="true" class="reel-shade" />
              <span v-if="post.type === 'video'" aria-hidden="true" class="reel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5" /><path d="M2.5 8h19M8.5 2.5 11 8M14 2.5 16.5 8" /><path d="m10 11 5 3-5 3Z" fill="currentColor" /></svg>
              </span>
              <span v-if="post.likes !== null || post.comments !== null" aria-hidden="true" class="reel-stats">
                <span v-if="post.likes !== null"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.2 1.7-2 3.1-3.2 5.3-3.2 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z" /></svg>{{ compact(post.likes) }}</span>
                <span v-if="post.comments !== null"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" /></svg>{{ compact(post.comments) }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <!-- DARK BAND: THE ROOM -->
    <section v-if="c.room.visible" class="room-section" :class="sectionTone(c.room.bgColor)" :style="sectionBackground(c.room.bgColor)">
      <div v-if="c.room.showBgImage" aria-hidden="true" class="pattern-dark" />
      <div class="room-inner">
        <div class="room-intro">
          <span v-if="c.room.showEyebrow && c.room.eyebrow" class="eyebrow-plain"><span class="rule-short" />{{ c.room.eyebrow }}</span>
          <h2 class="h2-light">{{ c.room.title }}</h2>
          <p v-for="(p, i) in paragraphs(c.room.body)" :key="i" class="body-copy-sm" v-html="richText(p)" />
        </div>
        <div v-if="c.room.tiles.length" class="room-grid">
          <div v-for="(room, i) in c.room.tiles" :key="i" class="room-tile" :style="{ background: ROOM_GRADIENTS[i % ROOM_GRADIENTS.length] }">
            <img v-if="room.image.src" :src="room.image.src" :alt="room.image.alt || room.label" class="room-img" loading="lazy" decoding="async">
            <ImagePlaceholder v-else :label="room.label" />
          </div>
        </div>
      </div>
    </section>

    <!-- SOCIAL -->
    <section v-if="c.social.visible" class="social-section">
      <div class="social-inner">
        <span v-if="c.social.handle" class="handle">{{ c.social.handle }}</span>
        <h2 class="h2-dark">{{ c.social.title }}</h2>
        <p v-for="(p, i) in paragraphs(c.social.body)" :key="i" class="body-copy-sm body-copy-sm--dark" v-html="richText(p)" />
        <CmsLink :link="c.social.button" class="btn-outline" />
      </div>
    </section>
    <!-- INSTAGRAM-STYLE POST POPUP -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="openedReel"
          class="lightbox ig-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="`Instagram post by ${feed.username}`"
          @click.self="closeReel"
        >
          <button ref="reelClose" type="button" class="lightbox-close" aria-label="Close" @click="closeReel">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 5l14 14M19 5 5 19" /></svg>
          </button>
          <button v-if="reels.length > 1" type="button" class="ig-arrow ig-arrow--prev" aria-label="Previous post" @click="stepReel(-1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <article :key="openedReel.id" class="ig-post">
            <div class="ig-media">
              <template v-if="openedReel.type === 'video'">
                <video
                  :src="openedReel.media"
                  :poster="openedReel.cover || undefined"
                  :muted="muted"
                  autoplay
                  loop
                  playsinline
                  class="ig-media-el"
                  @click="togglePlay"
                />
                <button type="button" class="ig-sound" :aria-label="muted ? 'Turn sound on' : 'Turn sound off'" @click="muted = !muted">
                  <svg v-if="muted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3Z" /><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" /></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3Z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" /></svg>
                </button>
              </template>
              <img v-else :src="openedReel.media" :alt="excerpt(openedReel.caption)" class="ig-media-el">
            </div>
            <aside class="ig-side">
              <header class="ig-head">
                <img v-if="feed.picture" :src="feed.picture" alt="" class="ig-avatar">
                <a :href="profileUrl" target="_blank" rel="noopener" class="ig-user">{{ feed.username }}</a>
                <span aria-hidden="true" class="ig-dot">•</span>
                <a :href="profileUrl" target="_blank" rel="noopener" class="ig-follow">Follow</a>
              </header>
              <div class="ig-body">
                <div v-if="openedReel.caption" class="ig-caption">
                  <img v-if="feed.picture" :src="feed.picture" alt="" class="ig-avatar">
                  <div>
                    <p><a :href="profileUrl" target="_blank" rel="noopener" class="ig-user">{{ feed.username }}</a> <span v-html="captionHtml(openedReel.caption)" /></p>
                    <time :datetime="openedReel.timestamp" class="ig-age">{{ ageLabel(openedReel.timestamp) }}</time>
                  </div>
                </div>
              </div>
              <footer class="ig-foot">
                <div class="ig-actions">
                  <a :href="openedReel.permalink" target="_blank" rel="noopener" aria-label="Like on Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.2-4.4-9.2-8.9C1.4 8.4 3.4 5 6.9 5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.5 0 5.5 3.4 4.1 6.6-2 4.5-9.2 8.9-9.2 8.9Z" /></svg>
                  </a>
                  <a :href="openedReel.permalink" target="_blank" rel="noopener" aria-label="Comment on Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.7 16.9A9 9 0 1 0 17 20.3L21 21Z" /></svg>
                  </a>
                  <a :href="openedReel.permalink" target="_blank" rel="noopener" aria-label="Share on Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M22 3 9.2 10.1M22 3l-7 18-4-9.6L2 8Z" /></svg>
                  </a>
                </div>
                <p v-if="openedReel.likes" class="ig-likes">{{ openedReel.likes.toLocaleString('en-US') }} {{ openedReel.likes === 1 ? 'like' : 'likes' }}</p>
                <time :datetime="openedReel.timestamp" class="ig-date">{{ fullDate(openedReel.timestamp) }}</time>
                <a :href="openedReel.permalink" target="_blank" rel="noopener" class="ig-view">View on Instagram</a>
              </footer>
            </aside>
          </article>
          <button v-if="reels.length > 1" type="button" class="ig-arrow ig-arrow--next" aria-label="Next post" @click="stepReel(1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </Transition>
    </Teleport>

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
          <figure v-if="openedPhoto" class="lightbox-figure">
            <Transition name="lightbox-img" mode="out-in">
              <img :key="openedPhoto.src" :src="openedPhoto.src" :alt="openedPhoto.alt" class="lightbox-img">
            </Transition>
            <figcaption class="lightbox-caption">
              <span class="lightbox-count">{{ String(activePhoto + 1).padStart(2, '0') }} / {{ String(photos.length).padStart(2, '0') }}</span>
              <span>{{ openedPhoto.alt }}</span>
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
import { EMPTY_INSTAGRAM_FEED, instagramCode } from '#shared/utils/instagram'
import type { InstagramFeed, InstagramPost } from '#shared/utils/instagram'

const c = await usePageContent('gallery')
useContentSeo(() => c.value.seo)

const bg = (src: string) => src ? { backgroundImage: `url('${src}')` } : undefined

// Photos in display order. "Wide" photos get a landscape tile.
const photos = computed(() => c.value.photos.items
  .filter(p => p.image.src)
  .map(p => ({ src: p.image.src, alt: p.image.alt, landscape: p.shape === 'landscape' })))

// Instagram videos: the account's posts, either the ones listed in the
// dashboard (in that order) or the latest few.
const { data: feedData } = await useFetch<InstagramFeed>('/api/instagram', { key: 'instagram-feed', default: () => EMPTY_INSTAGRAM_FEED })
const feed = computed(() => feedData.value ?? EMPTY_INSTAGRAM_FEED)
const profileUrl = computed(() => `https://www.instagram.com/${feed.value.username}/`)

const reels = computed(() => {
  const posts = feed.value.posts
  const picked = c.value.reels.items.map(i => instagramCode(i.instagramUrl)).filter(Boolean)
  if (picked.length) return picked.map(code => posts.find(p => p.code === code)).filter((p): p is InstagramPost => !!p)
  return posts.filter(p => !c.value.reels.videosOnly || p.type === 'video').slice(0, Number(c.value.reels.count) || 8)
})

const reducedMotion = ref(false)

// Arrows move the slider one card at a time; they hide when everything fits.
const reelsTrack = ref<HTMLElement | null>(null)
const reelsScroll = reactive({ canScroll: false, atStart: true, atEnd: true })
function updateReelsScroll() {
  const el = reelsTrack.value
  if (!el) return
  reelsScroll.canScroll = el.scrollWidth > el.clientWidth + 2
  reelsScroll.atStart = el.scrollLeft <= 2
  reelsScroll.atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
}
function scrollReels(dir: 1 | -1) {
  const el = reelsTrack.value
  const card = el?.querySelector<HTMLElement>('.reel')
  if (!el || !card) return
  el.scrollBy({ left: dir * (card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0')), behavior: 'smooth' })
}

// Card videos play only while they're on screen (and never for visitors who
// ask for reduced motion), so a row of videos doesn't all download at once.
let videoObserver: IntersectionObserver | null = null
function watchReelVideos() {
  videoObserver?.disconnect()
  if (reducedMotion.value || !reelsTrack.value) return
  videoObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target as HTMLVideoElement
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    }
  }, { threshold: 0.6 })
  reelsTrack.value.querySelectorAll('[data-reel-video]').forEach(v => videoObserver!.observe(v))
}

// The popup, laid out like a post opened on Instagram.
const activeReel = ref<number | null>(null)
const openedReel = computed(() => activeReel.value === null ? null : reels.value[activeReel.value] ?? null)
const reelClose = ref<HTMLButtonElement | null>(null)
const muted = ref(false)
let reelOpener: HTMLElement | null = null

function openReel(i: number) {
  reelOpener = document.activeElement as HTMLElement | null
  activeReel.value = i
  nextTick(() => reelClose.value?.focus())
}

function closeReel() {
  activeReel.value = null
  reelOpener?.focus()
}

function stepReel(dir: 1 | -1) {
  if (activeReel.value === null) return
  activeReel.value = (activeReel.value + dir + reels.value.length) % reels.value.length
}

function togglePlay(e: Event) {
  const video = e.currentTarget as HTMLVideoElement
  if (video.paused) video.play().catch(() => {})
  else video.pause()
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }
// Caption as Instagram shows it: line breaks kept, #tags and @names linked.
function captionHtml(text: string) {
  return text
    .replace(/[&<>"']/g, ch => ESCAPES[ch]!)
    .replace(/#([\p{L}\p{N}_]+)/gu, '<a href="https://www.instagram.com/explore/tags/$1/" target="_blank" rel="noopener">#$1</a>')
    .replace(/@([\w.]+)/g, '<a href="https://www.instagram.com/$1/" target="_blank" rel="noopener">@$1</a>')
    .replace(/\n/g, '<br>')
}

const excerpt = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, 80)
const compact = (n: number | null) => n === null ? '' : new Intl.NumberFormat('en', { notation: 'compact' }).format(n)
const fullDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

// "3d", "2w", like Instagram.
function ageLabel(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  if (s < 604800) return `${Math.round(s / 86400)}d`
  if (s < 31536000) return `${Math.round(s / 604800)}w`
  return `${Math.floor(s / 31536000)}y`
}

const activePhoto = ref<number | null>(null)

const openedPhoto = computed(() => activePhoto.value === null ? null : photos.value[activePhoto.value] ?? null)

function openPhoto(i: number) {
  activePhoto.value = i
}

function closePhoto() {
  activePhoto.value = null
}

// Moves through the photos, wrapping at either end.
function stepPhoto(dir: 1 | -1) {
  if (activePhoto.value === null) return
  activePhoto.value = (activePhoto.value + dir + photos.value.length) % photos.value.length
}

function onKeydown(e: KeyboardEvent) {
  if (activeReel.value !== null) {
    if (e.key === 'Escape') closeReel()
    else if (e.key === 'ArrowRight') stepReel(1)
    else if (e.key === 'ArrowLeft') stepReel(-1)
    return
  }
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

watch([activePhoto, activeReel], ([photo, reel]) => {
  document.body.style.overflow = photo === null && reel === null ? '' : 'hidden'
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updateReelsScroll)
  updateReelsScroll()
  watchReelVideos()
})
watch(reels, () => nextTick(() => {
  updateReelsScroll()
  watchReelVideos()
}))
// Card videos pause while the popup is open.
watch(activeReel, (open) => {
  if (open !== null) reelsTrack.value?.querySelectorAll<HTMLVideoElement>('[data-reel-video]').forEach(v => v.pause())
  else watchReelVideos()
})
onUnmounted(() => {
  videoObserver?.disconnect()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updateReelsScroll)
  document.body.style.overflow = ''
})

// Blue washes behind The Room tiles that have no photo yet.
const ROOM_GRADIENTS = [
  'linear-gradient(160deg, #12426d, #0f1e2e 74%)',
  'linear-gradient(150deg, #12426d, #0f1e2e 74%)',
  'linear-gradient(165deg, #12426d, #0f1e2e 74%)',
  'linear-gradient(155deg, #12426d, #0f1e2e 74%)'
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
  font-weight: 300;
}

.rule-short {
  width: 34px;
  height: 1px;
  background: var(--gold);
  display: inline-block;
}

.banner-title {
  font-family: var(--serif);
  font-weight: 300;
  font-size: clamp(44px, 9vw, 104px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.banner-sub {
  font-family: var(--serif);
  font-style: normal;
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
  font-weight: 300;
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
  font-weight: 300;
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

.room-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-weight: 300;
  font-size: clamp(30px, 4.6vw, 52px);
  line-height: 1.08;
  margin: 20px 0 0;
  color: var(--heading-on-light, #12426D);
}

.btn-outline {
  display: inline-block;
  margin-top: 34px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 300;
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

/* ===== Video slider ===== */
.eyebrow-plain--dark {
  color: var(--gold-dk);
}

.reels-section {
  position: relative;
  padding: 0 clamp(20px, 5vw, 64px) clamp(64px, 9vw, 120px);
}

.reels-inner {
  max-width: 1320px;
  margin: 0 auto;
}

.reels-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(24px, 3vw, 40px);
}

.reels-title {
  margin-top: 16px;
}

.reels-nav {
  display: flex;
  gap: 10px;
  flex: 0 0 auto;
}

.reels-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(15, 30, 46, 0.2);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s, opacity 0.3s;
}

.reels-btn:hover:not(:disabled) {
  border-color: var(--gold-dk);
  background: var(--gold-dk);
  color: #ffffff;
}

.reels-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Four portrait cards across on desktop, two on tablets, one and a bit on
   phones (so it's clear the row scrolls). */
.reels-track {
  --gap: clamp(12px, 1.6vw, 22px);
  display: flex;
  gap: var(--gap);
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.reels-track::-webkit-scrollbar {
  display: none;
}

.reel {
  flex: 0 0 calc((100% - 3 * var(--gap)) / 4);
  scroll-snap-align: start;
}

@media (max-width: 1000px) {
  .reel {
    flex-basis: calc((100% - var(--gap)) / 2);
  }
}

@media (max-width: 600px) {
  .reel {
    flex-basis: 78%;
  }
}

.reel-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  padding: 0;
  border: 1px solid rgba(217, 182, 144, 0.28);
  overflow: hidden;
  background: linear-gradient(160deg, #12426d, #0f1e2e 74%);
  font: inherit;
  text-align: left;
}

button.reel-card {
  cursor: pointer;
}

.reel-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

button.reel-card:hover .reel-video,
button.reel-card:focus-visible .reel-video {
  transform: scale(1.04);
}

button.reel-card:focus-visible {
  outline: 1px solid var(--gold-dk);
  outline-offset: 4px;
}

.reel-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 14, 24, 0) 55%, rgba(6, 14, 24, 0.7));
  pointer-events: none;
}

.reel-icon {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  color: #ffffff;
  opacity: 0.9;
}

.reel-card {
  cursor: pointer;
}

/* Likes and comments, shown on hover like Instagram's grid. */
.reel-stats {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background: rgba(6, 14, 24, 0.38);
  color: #ffffff;
  font-size: 15px;
  opacity: 0;
  transition: opacity 0.3s;
}

.reel-stats > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.reel-card:hover .reel-stats,
.reel-card:focus-visible .reel-stats {
  opacity: 1;
}

/* ===== Instagram-style popup =====
   Media on the left, a white panel on the right with the account, caption,
   likes and date, in Instagram's own system font. Stacks on phones. */
.ig-modal {
  background: rgba(0, 0, 0, 0.72);
}

.ig-post {
  display: flex;
  width: min(1180px, calc(100vw - 140px));
  height: min(860px, calc(100svh - 80px));
  background: #ffffff;
  border-radius: 4px;
  overflow: hidden;
  color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 18px;
}

.ig-media {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
}

.ig-media-el {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

video.ig-media-el {
  cursor: pointer;
}

.ig-sound {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: rgba(38, 38, 38, 0.85);
  color: #ffffff;
  cursor: pointer;
}

.ig-side {
  display: flex;
  flex-direction: column;
  flex: 0 0 400px;
  min-width: 0;
  border-left: 1px solid #efefef;
}

.ig-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #efefef;
}

.ig-avatar {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #efefef;
}

.ig-user {
  color: #000000;
  font-weight: 400;
  text-decoration: none;
}

.ig-user:hover {
  color: #737373;
}

.ig-dot {
  color: #737373;
}

.ig-follow {
  color: #0095f6;
  font-weight: 400;
  text-decoration: none;
}

.ig-follow:hover {
  color: #00376b;
}

.ig-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
}

.ig-caption {
  display: flex;
  gap: 14px;
}

.ig-caption p {
  margin: 4px 0 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.ig-caption :deep(a:not(.ig-user)) {
  color: #00376b;
  text-decoration: none;
}

.ig-age {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: #737373;
}

.ig-foot {
  padding: 6px 16px 16px;
  border-top: 1px solid #efefef;
}

.ig-actions {
  display: flex;
  gap: 16px;
  padding: 8px 0 6px;
}

.ig-actions a {
  display: inline-flex;
  color: #000000;
}

.ig-actions a:hover {
  color: #737373;
}

.ig-likes {
  margin: 4px 0 0;
  font-weight: 400;
}

.ig-date {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #737373;
}

.ig-view {
  display: block;
  margin-top: 14px;
  padding: 8px 0;
  border-radius: 8px;
  background: #0095f6;
  color: #ffffff;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
}

.ig-view:hover {
  background: #1877f2;
  color: #ffffff;
}

.ig-arrow {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #000000;
  transform: translateY(-50%);
  cursor: pointer;
}

.ig-arrow--prev {
  left: clamp(10px, 2.5vw, 28px);
}

.ig-arrow--next {
  right: clamp(10px, 2.5vw, 28px);
}

@media (max-width: 860px) {
  .ig-post {
    flex-direction: column;
    width: min(520px, calc(100vw - 24px));
    height: auto;
    max-height: calc(100svh - 96px);
    overflow-y: auto;
  }

  .ig-media {
    flex: 0 0 auto;
    aspect-ratio: 4 / 5;
  }

  .ig-side {
    flex: 0 0 auto;
    border-left: 0;
  }

  .ig-body {
    overflow: visible;
  }

  .ig-arrow {
    top: auto;
    bottom: 14px;
    transform: none;
  }
}
</style>
