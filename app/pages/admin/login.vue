<template>
  <div class="login">
    <!-- Brand side -->
    <aside class="login-brand" aria-hidden="true">
      <div class="brand-photo" />
      <div class="brand-scrim" />
      <div class="brand-pattern" />
      <div class="brand-inner">
        <img src="/images/yana-logo-gold.svg" alt="" class="brand-logo">
        <div class="brand-copy">
          <span class="brand-eyebrow"><span class="brand-rule" />Al Saadiyat Island · Abu Dhabi</span>
          <p class="brand-title">Every table,<br>every evening.</p>
          <p class="brand-sub">Reservations, guests and the floor, all in one place.</p>
        </div>
        <ul class="brand-points">
          <li><AdminIcon name="calendar" :size="16" /> Live bookings &amp; timeline</li>
          <li><AdminIcon name="guests" :size="16" /> Guest profiles &amp; history</li>
          <li><AdminIcon name="floor" :size="16" /> Floorplan &amp; seating</li>
        </ul>
      </div>
    </aside>

    <!-- Form side -->
    <main class="login-main">
      <div class="login-panel">
        <img src="/images/yana-logo-gold.svg" alt="YANA" class="login-logo">

        <span class="login-eyebrow">Staff portal</span>
        <h1 class="login-title">Welcome back</h1>
        <p class="login-sub">Sign in to manage today's service.</p>

        <form class="login-form" novalidate @submit.prevent="onSubmit">
          <label class="field">
            <span class="field-label">Email address</span>
            <span class="field-control">
              <AdminIcon name="mail" :size="17" class="field-icon" />
              <input
                v-model.trim="email"
                class="field-input"
                type="email"
                placeholder="you@yanarestaurants.com"
                autocomplete="username"
                autofocus
                required
                :aria-invalid="!!error"
              >
            </span>
          </label>

          <label class="field">
            <span class="field-label">Password</span>
            <span class="field-control">
              <AdminIcon name="key" :size="17" class="field-icon" />
              <input
                v-model="password"
                class="field-input"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Your password"
                autocomplete="current-password"
                required
                :aria-invalid="!!error"
              >
              <button
                type="button"
                class="field-toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
              </button>
            </span>
          </label>

          <Transition name="login-err">
            <p v-if="error" class="login-error" role="alert">
              <AdminIcon name="alert" :size="16" />
              {{ error }}
            </p>
          </Transition>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="login-spinner" aria-hidden="true" />
            {{ loading ? 'Signing in…' : 'Sign in' }}
            <svg v-if="!loading" width="20" height="10" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" /></svg>
          </button>
        </form>

        <p class="login-help">Forgotten your password? Ask a manager to reset it.</p>

        <a href="/" class="login-back">
          <svg width="16" height="8" viewBox="0 0 22 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M21 6H1M6 1 1 6l5 5" /></svg>
          Back to website
        </a>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Sign in · YANA admin' })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function onSubmit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Enter your email and password.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await navigateTo('/admin/reservations')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  min-height: 100vh;
  min-height: 100dvh;
  font-family: var(--sans);
}

/* ---------- Brand side ---------- */
.login-brand {
  position: relative;
  overflow: hidden;
  background: #08172a;
  color: #ffffff;
}

.brand-photo {
  position: absolute;
  inset: 0;
  background: url('/images/carousel/yana-01.jpg') center/cover no-repeat;
  transform: scale(1.04);
  animation: brandDrift 26s ease-in-out infinite alternate;
}

@keyframes brandDrift {
  to { transform: scale(1.12) translate(-1.5%, -1%); }
}

.brand-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(8, 23, 42, 0.72) 0%, rgba(8, 23, 42, 0.45) 40%, rgba(8, 23, 42, 0.92) 100%),
    radial-gradient(70% 60% at 30% 70%, rgba(52, 106, 170, 0.35), transparent 70%);
}

.brand-pattern {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  opacity: 0.12;
  mix-blend-mode: screen;
}

.brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: clamp(36px, 5vw, 64px);
}

.brand-logo {
  width: 104px;
  height: auto;
}

.brand-copy {
  max-width: 460px;
}

.brand-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #D9B690;
}

.brand-rule {
  width: 34px;
  height: 1px;
  background: #D9B690;
}

.brand-title {
  margin: 22px 0 0;
  font-family: var(--serif);
  font-size: clamp(36px, 4vw, 54px);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.01em;
}

.brand-sub {
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.72);
}

.brand-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.brand-points li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid rgba(217, 182, 144, 0.35);
  border-radius: 999px;
  background: rgba(8, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.85);
}

.brand-points li :deep(svg) {
  color: #D9B690;
}

/* ---------- Form side ---------- */
.login-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 6vw, 72px) clamp(20px, 5vw, 64px);
  background: #F3ECE1;
  overflow: hidden;
}

/* Same faint line-drawing texture as the website's cream panels. */
.login-main::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-square.jpeg') center/cover no-repeat;
  filter: invert(1) saturate(0.2) contrast(1.05);
  opacity: 0.22;
  pointer-events: none;
}

.login-panel {
  position: relative;
  width: 100%;
  max-width: 400px;
  animation: panelIn 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(14px); }
}

.login-logo {
  display: none;
  width: 92px;
  margin-bottom: 30px;
}

.login-eyebrow {
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-weight: 600;
  color: #8A6B45;
}

.login-title {
  margin: 12px 0 0;
  font-family: var(--serif);
  font-size: clamp(32px, 3vw, 40px);
  font-weight: 400;
  line-height: 1.1;
  color: #0F1E2E;
}

.login-sub {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(15, 30, 46, 0.62);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 34px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: rgba(15, 30, 46, 0.7);
}

.field-control {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 15px;
  color: #8A6B45;
  pointer-events: none;
}

.field-input {
  width: 100%;
  height: 52px;
  padding: 0 46px 0 46px;
  border: 1px solid rgba(138, 107, 69, 0.35);
  border-radius: 8px;
  background: #ffffff;
  font-family: inherit;
  font-size: 15px;
  color: #0F1E2E;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input::placeholder {
  color: rgba(15, 30, 46, 0.35);
}

.field-input:focus {
  outline: none;
  border-color: #8A6B45;
  box-shadow: 0 0 0 4px rgba(217, 182, 144, 0.28);
}

.field-input[aria-invalid='true'] {
  border-color: rgba(194, 65, 45, 0.6);
}

.field-toggle {
  position: absolute;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: none;
  color: rgba(15, 30, 46, 0.5);
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.field-toggle:hover {
  color: #0F1E2E;
  background: rgba(217, 182, 144, 0.18);
}

.login-error {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  padding: 11px 14px;
  border: 1px solid rgba(194, 65, 45, 0.25);
  border-radius: 8px;
  background: rgba(194, 65, 45, 0.07);
  font-size: 13px;
  color: #a5361f;
}

.login-err-enter-active,
.login-err-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.login-err-enter-from,
.login-err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 54px;
  margin-top: 6px;
  border: 1px solid #0F1E2E;
  border-radius: 8px;
  background: #0F1E2E;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 600;
  color: #D9B690;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border-color 0.3s, transform 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #D9B690;
  border-color: #D9B690;
  color: #0F1E2E;
}

.login-btn:hover:not(:disabled) svg {
  transform: translateX(3px);
}

.login-btn svg {
  transition: transform 0.3s;
}

.login-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.login-btn:disabled {
  opacity: 0.75;
  cursor: wait;
}

.login-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(217, 182, 144, 0.35);
  border-top-color: #D9B690;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-help {
  margin: 22px 0 0;
  font-size: 13px;
  color: rgba(15, 30, 46, 0.55);
}

.login-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid rgba(138, 107, 69, 0.22);
  width: 100%;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: #8A6B45;
  text-decoration: none;
  transition: color 0.2s;
}

.login-back:hover {
  color: #0F1E2E;
}

@media (prefers-reduced-motion: reduce) {
  .brand-photo,
  .login-panel {
    animation: none;
  }
}

/* Tablet: shorter brand band on top. */
@media (max-width: 960px) {
  .login {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .login-brand {
    min-height: 260px;
  }

  .brand-inner {
    gap: 28px;
  }

  .brand-points {
    display: none;
  }

  .brand-title {
    font-size: 34px;
  }
}

/* Phone: drop the photo band and keep the logo above the form. */
@media (max-width: 560px) {
  .login {
    grid-template-rows: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-logo {
    display: block;
  }

  .login-main {
    align-items: flex-start;
    padding-top: 56px;
  }
}
</style>
