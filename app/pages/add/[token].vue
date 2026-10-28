<template>
  <div class="add">
    <main class="add-inner">
      <img src="/honors/wordmark-gold.png" alt="YANA" class="add-logo">

      <template v-if="card">
        <h1 class="add-title">Welcome to Yana Honors</h1>
        <p class="add-sub">Add your membership card to your phone and show it to our team on your next visit.</p>

        <div class="add-card">
          <HonorsCard :tier="card.tier" :name="card.name" :member-number="card.memberNumber" />
        </div>

        <p v-if="problemText" class="add-problem" role="alert">{{ problemText }}</p>

        <div v-if="buttons.length" class="add-actions">
          <a
            v-for="b in buttons"
            :key="b.key"
            :href="`/api/honors/${token}/${b.key}`"
            class="add-btn"
            :class="{ 'is-secondary': b.secondary }"
            rel="nofollow"
          >
            <svg v-if="b.key === 'apple'" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.17-1.53 2.65-.39 6.58 1.1 8.73.73 1.05 1.6 2.23 2.73 2.19 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.3-3.48ZM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22Z" /></svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M3 10h18" stroke="currentColor" stroke-width="1.8" /></svg>
            {{ b.label }}
          </a>
        </div>
        <p v-else class="add-note">Adding the card to a phone wallet is being set up. Our team will let you know as soon as it's ready.</p>

        <p class="add-note">This link is just for you. Please don't share it.</p>
      </template>

      <template v-else>
        <h1 class="add-title">This link has expired</h1>
        <p class="add-sub">
          For your security, card links only work for a short time. Ask our team for a new one, or call us on
          <a :href="telHref(site.contact.phone)">{{ site.contact.phone }}</a>.
        </p>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { telHref } from '#shared/content/site'
import type { HonorsTier } from '#shared/utils/honors'

// Opened from the QR code at reception or the link in the welcome email.
definePageMeta({ layout: false })

const route = useRoute()
const token = String(route.params.token)
const site = useContent('site')

useHead({ title: 'Yana Honors · YANA Restaurant' })
useSeoMeta({ robots: 'noindex, nofollow', referrer: 'no-referrer' })

interface HonorsLinkCard {
  name: string
  tier: HonorsTier
  memberNumber: string
  wallets: { google: boolean, apple: boolean }
}

const { data: card } = await useFetch<HonorsLinkCard>(`/api/honors/${encodeURIComponent(token)}`)

// Worked out in the browser, so the server's first render shows both buttons.
const platform = ref<'ios' | 'android' | 'other'>('other')
onMounted(() => {
  const ua = navigator.userAgent
  // iPads report themselves as a Mac with a touch screen.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) platform.value = 'ios'
  else if (/Android/.test(ua)) platform.value = 'android'
})

// The phone's own wallet first; the other one stays as a fallback.
const buttons = computed(() => {
  const w = card.value?.wallets
  if (!w) return []
  const list = [
    ...(w.apple ? [{ key: 'apple', label: 'Add to Apple Wallet' }] : []),
    ...(w.google ? [{ key: 'google', label: 'Add to Google Wallet' }] : [])
  ]
  if (platform.value !== 'ios') list.reverse()
  return list.map((b, i) => ({ ...b, secondary: i > 0 && platform.value !== 'other' }))
})

const problemText = computed(() => ({
  expired: 'This link has just expired. Ask our team for a new one.',
  google: 'Google Wallet isn\'t available right now. Please try again in a few minutes, or ask our team.',
  apple: 'Apple Wallet isn\'t available right now. Please try again in a few minutes, or ask our team.'
} as Record<string, string>)[String(route.query.problem ?? '')] ?? '')
</script>

<style scoped>
.add {
  min-height: 100vh;
  min-height: 100dvh;
  background: #0F1E2E;
  color: #EAB77A;
  font-family: Montserrat, sans-serif;
}

.add-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 420px;
  margin: 0 auto;
  padding: 36px 20px 48px;
  text-align: center;
}

.add-logo {
  width: 92px;
  opacity: 0.9;
}

.add-title {
  margin: 28px 0 8px;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}

.add-sub {
  margin: 0;
  max-width: 330px;
  font-size: 14px;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(243, 236, 225, 0.78);
}

.add-sub a {
  color: #EAB77A;
}

.add-card {
  width: min(280px, 100%);
  margin: 28px 0 26px;
}

.add-problem {
  margin: 0 0 16px;
  padding: 10px 14px;
  border: 1px solid rgba(232, 189, 115, 0.45);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: #F3ECE1;
}

.add-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(320px, 100%);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  border-radius: 12px;
  background: #000;
  border: 1px solid #000;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.add-btn.is-secondary {
  background: transparent;
  border-color: rgba(243, 236, 225, 0.35);
  color: #F3ECE1;
}

.add-note {
  margin: 18px 0 0;
  max-width: 300px;
  font-size: 12px;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(243, 236, 225, 0.6);
}
</style>
