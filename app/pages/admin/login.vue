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

    <!-- Form side (Aura style, follows light/dark) -->
    <main class="login-main">
      <div class="login-glow" aria-hidden="true" />
      <AdminThemeToggle compact class="login-theme" />

      <div class="login-panel">
        <span class="login-mark">
          <img src="/images/yana-logo-gold.svg" alt="YANA" class="login-mark-logo">
        </span>
        <h1 class="login-title">Welcome back</h1>
        <p class="login-sub">Sign in to manage reservations and today's service</p>

        <form class="login-form" novalidate @submit.prevent="onSubmit">
          <div class="adm-field">
            <label for="login-email" class="login-label">Email</label>
            <div class="login-control">
              <AdminIcon name="mail" :size="17" class="login-icon" />
              <input
                id="login-email"
                v-model.trim="email"
                class="adm-input login-input"
                type="email"
                placeholder="you@yanarestaurants.com"
                autocomplete="username"
                autofocus
                required
                :aria-invalid="!!error"
              >
            </div>
          </div>

          <div class="adm-field">
            <label for="login-password" class="login-label">Password</label>
            <div class="login-control">
              <AdminIcon name="key" :size="17" class="login-icon" />
              <input
                id="login-password"
                v-model="password"
                class="adm-input login-input login-input--pw"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Your password"
                autocomplete="current-password"
                required
                :aria-invalid="!!error"
              >
              <button
                type="button"
                class="login-toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.9 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
              </button>
            </div>
          </div>

          <p class="login-help">Forgot your password? Ask a manager to reset it.</p>

          <Transition name="login-err">
            <p v-if="error" class="adm-error login-error" role="alert">
              <AdminIcon name="alert" :size="16" />
              {{ error }}
            </p>
          </Transition>

          <button type="submit" class="adm-btn adm-btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="login-spinner" aria-hidden="true" />
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <a href="/" class="login-back">
          <AdminIcon name="left" :size="15" />
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
    const res = await $fetch<{ mustChangePassword?: boolean, home?: string }>('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await navigateTo(res.mustChangePassword ? '/admin/password' : res.home ?? '/admin')
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
  grid-template-columns: minmax(0, 1.05fr) minmax(440px, 0.95fr);
  min-height: 100vh;
  min-height: 100dvh;
}

/* ---------- Brand side (same in light and dark) ---------- */
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
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #D9B690;
}

.brand-rule {
  width: 34px;
  height: 1px;
  background: #D9B690;
}

.brand-title {
  margin: 20px 0 0;
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.brand-sub {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
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
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
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
  background: var(--adm-surface);
  overflow: hidden;
}

.login-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(45% 40% at 85% 8%, var(--adm-primary-50), transparent 70%),
    radial-gradient(40% 35% at 10% 95%, var(--adm-warm-50), transparent 70%);
  pointer-events: none;
}

.login-theme {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.login-panel {
  position: relative;
  width: 100%;
  max-width: 400px;
  animation: panelIn 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(12px); }
}

.login-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 24px;
  border-radius: 14px;
  background: var(--adm-nav);
  box-shadow: 0 0 0 5px var(--adm-primary-50);
}

.login-mark-logo {
  width: 34px;
  height: auto;
}

.login-title {
  margin: 0;
  font-size: clamp(26px, 2.6vw, 30px);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--adm-heading);
}

.login-sub {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--adm-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 32px;
}

.login-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--adm-heading);
}

.login-control {
  position: relative;
  display: flex;
  align-items: center;
}

.login-icon {
  position: absolute;
  left: 13px;
  color: var(--adm-faint);
  pointer-events: none;
}

.login-input {
  height: 46px;
  padding-left: 40px;
  font-size: 15px;
}

.login-input--pw {
  padding-right: 46px;
}

.login-input[aria-invalid='true'] {
  border-color: var(--adm-danger);
}

.login-toggle {
  position: absolute;
  right: 6px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--adm-radius);
  background: none;
  color: var(--adm-faint);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.login-toggle:hover {
  background: var(--adm-surface-3);
  color: var(--adm-text);
}

.login-help {
  margin: -4px 0 0;
  font-size: 13.5px;
  color: var(--adm-muted);
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.login-err-enter-active,
.login-err-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.login-err-enter-from,
.login-err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.login-btn {
  width: 100%;
  height: 46px;
  margin-top: 4px;
  font-size: 15px;
}

.login-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(127, 127, 127, 0.4);
  border-top-color: var(--adm-on-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--adm-line);
  font-size: 14px;
  font-weight: 500;
  color: var(--adm-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.login-back:hover {
  color: var(--adm-primary);
}

@media (prefers-reduced-motion: reduce) {
  .brand-photo,
  .login-panel {
    animation: none;
  }
}

/* Tablet: photo becomes a band on top. */
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

/* Phone: form only. */
@media (max-width: 560px) {
  .login {
    grid-template-rows: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-main {
    align-items: flex-start;
    padding-top: 72px;
  }
}
</style>
