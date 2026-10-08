<template>
  <nav class="yana-nav" :class="{ 'is-scrolled': isScrolled }">
    <div class="yana-nav-left">
      <button class="nav-menu-btn" aria-label="Open menu" @click="isMenuOpen = true">
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" stroke-width="1.3">
          <line x1="0.5" y1="1.5" x2="25.5" y2="1.5" />
          <line x1="0.5" y1="10.5" x2="17" y2="10.5" />
        </svg>
        <span class="nav-menu-label">Menu</span>
      </button>
    </div>

    <NuxtLink to="/" class="yana-nav-logo">
      <img src="/images/yana-logo-gold.svg" alt="YANA" class="yana-nav-logo-img">
    </NuxtLink>

    <div class="yana-nav-right">
      <NuxtLink to="/#location" class="yana-locale">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span><span v-if="layout.header.locationArea" class="yana-locale-area">{{ layout.header.locationArea }}{{ layout.header.locationCity ? ', ' : '' }}</span>{{ layout.header.locationCity }}</span>
      </NuxtLink>
      <NuxtLink to="/reservation" class="yana-nav-book nav-book-btn">{{ layout.header.bookLabel }}</NuxtLink>
    </div>
  </nav>

  <div class="yana-mobile-menu" :class="{ 'is-open': isMenuOpen }" :aria-hidden="!isMenuOpen">
    <div class="yana-menu-backdrop" @click="isMenuOpen = false" />
    <aside class="yana-menu-panel" role="dialog" aria-modal="true" aria-label="Site menu">
      <div aria-hidden="true" class="yana-menu-pattern" />
      <div class="yana-mobile-top">
        <button class="nav-close-btn" aria-label="Close menu" @click="isMenuOpen = false">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </div>
      <nav class="yana-mobile-links">
        <NuxtLink
          v-for="(item, i) in navItems"
          :key="item.key"
          :to="item.to"
          class="yana-mobile-link"
          :class="{ 'is-active': active === item.key }"
          :style="{ '--i': i }"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="yana-menu-foot">
        <NuxtLink to="/reservation" class="yana-mobile-reserve" @click="isMenuOpen = false">{{ layout.menu.reserveLabel }}</NuxtLink>
        <div class="yana-menu-social">
          <a v-if="site.social.instagramUrl" :href="site.social.instagramUrl" target="_blank" rel="noopener" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
          </a>
          <a :href="whatsappHref(site.contact.whatsapp)" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.3-1.6-2.8-2.8l1-1-1-2z" /></svg>
          </a>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { whatsappHref } from '#shared/content/site'

const props = defineProps<{
  active?: 'home' | 'menu' | 'about' | 'gallery' | 'contact' | 'reservation'
}>()

const navItems = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'menu', label: 'Menu', to: '/menu' },
  { key: 'reservation', label: 'Reservation', to: '/reservation' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'gallery', label: 'Gallery', to: '/gallery' },
  { key: 'contact', label: 'Reach Us', to: '/contact' }
]

const site = useContent('site')
const layout = useContent('layout')

const isScrolled = ref(false)
const isMenuOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 36
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') isMenuOpen.value = false
}

watch(isMenuOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.yana-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 22px clamp(18px, 5vw, 56px);
  transition: all 0.5s ease;
  background: transparent;
  border-bottom: 1px solid transparent;
  color: #ffffff;
  font-family: var(--sans);
  font-weight: 300;
}

.yana-nav.is-scrolled {
  background: var(--panel);
  border-bottom-color: rgba(217, 182, 144, 0.28);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--ink);
  padding-top: 13px;
  padding-bottom: 13px;
}

.yana-nav-left {
  justify-self: start;
}

.nav-menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 6px 2px;
  transition: opacity 0.3s;
}

.nav-menu-btn:hover {
  opacity: 0.65;
}

.nav-menu-label {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 600;
}

.yana-nav-logo {
  justify-self: center;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.yana-nav-logo-img {
  display: block;
  height: clamp(20px, 2.8vw, 26px);
  width: auto;
}

.yana-nav-right {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 22px;
}

.yana-locale {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
  color: inherit;
  opacity: 0.92;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.yana-locale:hover {
  opacity: 1;
  text-decoration: underline;
  text-underline-offset: 4px;
}

@media (max-width: 1100px) {
  .yana-locale-area {
    display: none;
  }
}

.nav-book-btn {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--blue-dk);
  background: var(--gold);
  padding: 13px 24px;
  text-decoration: none;
  transition: all 0.4s ease;
  border: 1px solid var(--gold);
  white-space: nowrap;
}

.nav-book-btn:hover {
  background: transparent;
  color: var(--gold);
}

/* Menu: a cream panel with the YANA line-drawing pattern slides in from
   the left, and the page behind it dims. */
.yana-mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: none;
  font-family: var(--sans);
}

.yana-mobile-menu.is-open {
  pointer-events: auto;
}

.yana-menu-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 14, 24, 0.68);
  opacity: 0;
  transition: opacity 0.6s ease;
  cursor: pointer;
}

.yana-mobile-menu.is-open .yana-menu-backdrop {
  opacity: 1;
}

.yana-menu-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: clamp(320px, 32vw, 560px);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  padding: clamp(34px, 5vh, 60px) clamp(28px, 4vw, 64px);
  background: var(--panel);
  overflow: hidden auto;
  transform: translateX(-100%);
  transition: transform 0.7s cubic-bezier(0.6, 0.05, 0.2, 1);
  box-shadow: 24px 0 60px -30px rgba(6, 14, 24, 0.5);
}

.yana-mobile-menu.is-open .yana-menu-panel {
  transform: translateX(0);
}

/* Same treatment as the split and visit panels: the navy pattern inverted
   into a faint line drawing on cream. */
.yana-menu-pattern {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.2) contrast(1.05);
  opacity: 0.3;
  pointer-events: none;
}

.yana-mobile-top,
.yana-mobile-links,
.yana-menu-foot {
  position: relative;
}

.nav-close-btn {
  background: none;
  border: none;
  color: var(--gold-dk);
  cursor: pointer;
  padding: 4px;
  margin-left: -4px;
  transition: transform 0.4s ease, color 0.3s;
}

.nav-close-btn:hover {
  color: var(--ink);
  transform: rotate(90deg);
}

.yana-mobile-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(18px, 3.6vh, 34px);
  padding: 40px 0;
}

.yana-mobile-link {
  position: relative;
  align-self: flex-start;
  font-size: clamp(20px, 1.9vw, 27px);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 400;
  color: var(--gold-dk);
  text-decoration: none;
  transition: opacity 0.4s ease, color 0.3s;
}

/* Links drift in one after another each time the menu opens. */
.yana-mobile-menu.is-open .yana-mobile-link {
  animation: yanaMenuLinkIn 0.55s ease backwards;
  animation-delay: calc(0.18s + var(--i) * 0.06s);
}

@keyframes yanaMenuLinkIn {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }
}

/* Hovering one link fades the rest back, as on Gigi's menu. */
.yana-mobile-links:has(.yana-mobile-link:hover) .yana-mobile-link:not(:hover) {
  opacity: 0.28;
}

.yana-mobile-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.45s ease;
}

.yana-mobile-link.is-active::after {
  width: 42px;
}

.yana-menu-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.yana-mobile-reserve {
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--blue-dk);
  background: var(--gold);
  border: 1px solid var(--gold);
  padding: 16px 26px;
  text-decoration: none;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
}

.yana-mobile-reserve:hover {
  background: transparent;
  border-color: var(--gold-dk);
  color: var(--gold-dk);
}

.yana-menu-social {
  display: flex;
  gap: 16px;
}

.yana-menu-social a {
  color: var(--gold-dk);
  display: inline-flex;
  transition: color 0.3s;
}

.yana-menu-social a:hover {
  color: var(--ink);
}

@media (max-width: 520px) {
  .yana-menu-panel {
    width: 100%;
  }
}
</style>
