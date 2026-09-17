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
      <span class="yana-locale">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Abu Dhabi
      </span>
      <NuxtLink to="/reservation" class="yana-nav-book nav-book-btn">Book A Table</NuxtLink>
    </div>
  </nav>

  <div class="yana-mobile-menu" :class="{ 'is-open': isMenuOpen }">
    <div class="yana-mobile-top">
      <img src="/images/yana-logo-gold.svg" alt="YANA" class="yana-mobile-logo-img">
      <button class="nav-close-btn" aria-label="Close menu" @click="isMenuOpen = false">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>
    </div>
    <div class="yana-mobile-links">
      <NuxtLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="yana-mobile-link"
        :class="{ 'is-active': active === item.key }"
        @click="isMenuOpen = false"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
    <NuxtLink to="/reservation" class="yana-mobile-reserve" @click="isMenuOpen = false">Reserve a Table</NuxtLink>
  </div>
</template>

<script setup lang="ts">
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

const isScrolled = ref(false)
const isMenuOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 36
}

watch(isMenuOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
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
  background: rgba(255, 255, 255, 0.94);
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
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 400;
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
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.72;
}

.nav-book-btn {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
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

.yana-mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(217, 182, 144, 0.3);
  transform: translateY(-100%);
  transition: transform 0.6s cubic-bezier(0.6, 0.05, 0.2, 1);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  padding: 34px clamp(24px, 7vw, 54px);
  font-family: var(--sans);
}

.yana-mobile-menu.is-open {
  transform: translateY(0);
  pointer-events: auto;
}

.yana-mobile-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.yana-mobile-logo-img {
  display: block;
  height: 24px;
  width: auto;
}

.nav-close-btn {
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  padding: 4px;
}

.yana-mobile-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.yana-mobile-link {
  font-family: var(--serif);
  font-size: clamp(30px, 9vw, 42px);
  color: var(--ink);
  text-decoration: none;
  font-weight: 400;
  padding: 8px 0;
}

.yana-mobile-link.is-active {
  color: var(--gold-dk);
  font-style: italic;
}

.yana-mobile-reserve {
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--blue-dk);
  background: var(--gold);
  padding: 18px;
  text-decoration: none;
}
</style>
