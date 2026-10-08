<template>
  <div class="pw-wrap">
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">{{ mustChange ? 'Set your password' : 'Change password' }}</h1>
        <p class="adm-page-sub">Signed in as {{ email }}</p>
      </div>
    </div>

    <p v-if="mustChange" class="pw-first">
      <AdminIcon name="key" :size="18" />
      <span>Welcome! Your account was set up with a temporary password. Choose your own password to start using the dashboard.</span>
    </p>

    <form class="adm-card pw-card" @submit.prevent="onSubmit">
      <label class="adm-field">
        <span class="adm-label">{{ mustChange ? 'Temporary password' : 'Current password' }}</span>
        <input v-model="currentPassword" class="adm-input" type="password" autocomplete="current-password" required>
      </label>

      <label class="adm-field">
        <span class="adm-label">New password</span>
        <input v-model="newPassword" class="adm-input" type="password" autocomplete="new-password" required>
        <span class="pw-hint">At least 12 characters. A phrase like three words and a number works well.</span>
      </label>

      <label class="adm-field">
        <span class="adm-label">Confirm new password</span>
        <input v-model="confirmPassword" class="adm-input" type="password" autocomplete="new-password" required>
      </label>

      <p v-if="error" class="adm-error">{{ error }}</p>
      <p v-if="success" class="pw-success">{{ success }}</p>

      <button type="submit" class="adm-btn adm-btn-primary pw-btn" :disabled="saving">
        {{ saving ? 'Saving…' : mustChange ? 'Set password & continue' : 'Update password' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data: session } = await useFetch<{ user?: { email: string, mustChangePassword?: boolean } }>('/api/admin/session')
const email = computed(() => session.value?.user?.email ?? '')
// Locked to the first value so the banner doesn't vanish mid-submit.
const mustChange = ref(!!session.value?.user?.mustChangePassword)

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
    if (mustChange.value) {
      // /admin forwards to the first area this user can open.
      await navigateTo('/admin')
      return
    }
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
  max-width: 480px;
}

.pw-first {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 0 0 16px;
  padding: 12px 14px;
  border: 1px solid var(--adm-primary-100);
  border-radius: var(--adm-radius);
  background: var(--adm-primary-50);
  font-size: 14px;
  line-height: 1.5;
  color: var(--adm-primary);
}

.pw-first :deep(svg) {
  flex-shrink: 0;
  margin-top: 1px;
}

.pw-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
}

.pw-hint {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.pw-success {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid var(--adm-success-line);
  border-radius: var(--adm-radius);
  background: var(--adm-success-bg);
  font-size: 13px;
  color: var(--adm-success-strong);
}

.pw-btn {
  width: 100%;
  margin-top: 4px;
}
</style>
