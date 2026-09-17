<template>
  <div class="login-wrap">
    <form class="login-card" @submit.prevent="onSubmit">
      <h1 class="login-title">Admin Login</h1>
      <p class="login-sub">Sign in to manage reservations.</p>
      <input v-model.trim="email" class="yana-input" type="email" placeholder="Email address" autocomplete="username" autofocus required>
      <input v-model="password" class="yana-input" type="password" placeholder="Password" autocomplete="current-password" required>
      <p v-if="error" class="login-error">{{ error }}</p>
      <button type="submit" class="login-btn" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign In' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
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
.login-wrap {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  padding: 40px 32px;
  box-shadow: 0 20px 50px rgba(15, 30, 46, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-title {
  font-family: var(--serif);
  font-size: 28px;
  margin: 0;
  color: var(--ink);
}

.login-sub {
  font-size: 13.5px;
  color: var(--ink-dim);
  margin: 0 0 20px;
}

.login-error {
  font-size: 13px;
  color: #b3432f;
  margin: 10px 0 0;
}

.login-btn {
  margin-top: 24px;
  background: var(--gold);
  color: #ffffff;
  border: none;
  padding: 15px;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
