<template>
  <div class="pw-wrap">
    <h1 class="page-title">Change Password</h1>
    <p class="page-sub">Signed in as {{ email }}</p>

    <form class="pw-card" @submit.prevent="onSubmit">
      <label class="pw-label">Current password</label>
      <input v-model="currentPassword" class="yana-input" type="password" autocomplete="current-password" required>

      <label class="pw-label">New password</label>
      <input v-model="newPassword" class="yana-input" type="password" autocomplete="new-password" required>
      <p class="pw-hint">At least 12 characters. A phrase like three words and a number works well.</p>

      <label class="pw-label">Confirm new password</label>
      <input v-model="confirmPassword" class="yana-input" type="password" autocomplete="new-password" required>

      <p v-if="error" class="pw-error">{{ error }}</p>
      <p v-if="success" class="pw-success">{{ success }}</p>

      <button type="submit" class="pw-btn" :disabled="saving">
        {{ saving ? 'Saving…' : 'Update Password' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data: session } = await useFetch<{ user?: { email: string } }>('/api/admin/session')
const email = computed(() => session.value?.user?.email ?? '')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const saving = ref(false)

async function onSubmit() {
  error.value = ''
  success.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'The new passwords do not match.'
    return
  }

  saving.value = true
  try {
    await $fetch('/api/admin/password', {
      method: 'POST',
      body: { currentPassword: currentPassword.value, newPassword: newPassword.value }
    })
    success.value = 'Password updated. Use it next time you sign in.'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not update password.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pw-wrap {
  max-width: 460px;
}

.page-title {
  font-family: var(--serif);
  font-size: 30px;
  margin: 0;
}

.page-sub {
  font-size: 13.5px;
  color: var(--ink-dim);
  margin: 6px 0 28px;
}

.pw-card {
  background: #ffffff;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.pw-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-dim);
  margin-top: 18px;
}

.pw-label:first-child {
  margin-top: 0;
}

.pw-hint {
  font-size: 12.5px;
  color: var(--ink-dim);
  margin: 8px 0 0;
}

.pw-error {
  font-size: 13px;
  color: #b3432f;
  margin: 18px 0 0;
}

.pw-success {
  font-size: 13px;
  color: #2f7a4f;
  margin: 18px 0 0;
}

.pw-btn {
  margin-top: 28px;
  background: var(--gold);
  color: #ffffff;
  border: none;
  padding: 15px;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.pw-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
