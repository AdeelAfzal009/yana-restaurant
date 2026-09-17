<template>
  <div class="admin-shell">
    <header class="admin-header">
      <NuxtLink to="/admin/reservations" class="admin-brand">
        <img src="/images/yana-logo-gold.svg" alt="YANA" class="admin-logo">
        <span>Admin</span>
      </NuxtLink>
      <div v-if="showLogout" class="admin-user">
        <NuxtLink to="/admin/reservations" class="admin-nav-link">Reservations</NuxtLink>
        <NuxtLink to="/admin/password" class="admin-nav-link">Password</NuxtLink>
        <span v-if="user" class="admin-user-name">{{ user.name }} · {{ user.role }}</span>
        <button type="button" class="admin-logout" @click="logout">Log out</button>
      </div>
    </header>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
interface SessionUser {
  name: string
  email: string
  role: 'manager' | 'host'
}

const route = useRoute()
const showLogout = computed(() => route.path !== '/admin/login')

const { data: session, refresh } = await useFetch<{ authed: boolean, user?: SessionUser }>('/api/admin/session')
const user = computed(() => session.value?.user)

watch(() => route.path, () => refresh())

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #f5f2ec;
  font-family: var(--sans);
  color: var(--ink);
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px clamp(20px, 4vw, 48px);
  background: var(--blue-dk);
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--gold-lt);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.admin-logo {
  height: 20px;
  width: auto;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-nav-link {
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold-lt);
  text-decoration: none;
  transition: opacity 0.3s;
}

.admin-nav-link:hover {
  opacity: 0.7;
}

.admin-nav-link.router-link-active {
  color: #ffffff;
}

.admin-user-name {
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cream-dim);
}

.admin-logout {
  background: none;
  border: 1px solid rgba(217, 182, 144, 0.5);
  color: var(--gold-lt);
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 9px 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.admin-logout:hover {
  background: var(--gold);
  color: var(--blue-dk);
  border-color: var(--gold);
}

.admin-main {
  padding: clamp(24px, 4vw, 48px);
}
</style>
