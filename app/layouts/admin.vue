<template>
  <div class="adm" :class="{ 'adm-bare': isLogin }">
    <template v-if="isLogin">
      <slot />
    </template>

    <div v-else class="adm-shell" :class="{ 'is-collapsed': collapsed, 'is-mobile-open': mobileOpen }">
      <aside class="adm-side">
        <div class="side-brand">
          <NuxtLink to="/admin/reservations" class="side-logo-link" aria-label="YANA admin home">
            <img src="/images/yana-logo-gold.svg" alt="YANA" class="side-logo">
          </NuxtLink>
          <button type="button" class="side-collapse" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="toggleCollapsed">
            <AdminIcon :name="collapsed ? 'right' : 'left'" :size="16" />
          </button>
        </div>

        <nav class="side-nav">
          <p class="side-group">Service</p>
          <NuxtLink v-for="item in serviceNav" :key="item.to" :to="item.to" class="side-link" :title="item.label" @click="mobileOpen = false">
            <AdminIcon :name="item.icon" />
            <span class="side-text">{{ item.label }}</span>
          </NuxtLink>

          <p class="side-group">Insights</p>
          <NuxtLink v-for="item in insightNav" :key="item.to" :to="item.to" class="side-link" :title="item.label" @click="mobileOpen = false">
            <AdminIcon :name="item.icon" />
            <span class="side-text">{{ item.label }}</span>
          </NuxtLink>

          <template v-if="user?.role === 'manager'">
            <p class="side-group">Setup</p>
            <NuxtLink to="/admin/floorplan" class="side-link" title="Floorplan editor" @click="mobileOpen = false">
              <AdminIcon name="editor" />
              <span class="side-text">Floorplan editor</span>
            </NuxtLink>
          </template>
        </nav>

        <div class="side-foot">
          <a href="/" target="_blank" rel="noopener" class="side-link" title="View website">
            <AdminIcon name="home" />
            <span class="side-text">View website</span>
          </a>
          <NuxtLink to="/admin/password" class="side-link" title="Change password" @click="mobileOpen = false">
            <AdminIcon name="key" />
            <span class="side-text">Password</span>
          </NuxtLink>
          <div v-if="user" class="side-user">
            <span class="side-avatar">{{ userInitials }}</span>
            <span class="side-text side-user-meta">
              <span class="side-user-name">{{ user.name }}</span>
              <span class="side-user-role">{{ user.role }}</span>
            </span>
            <button type="button" class="side-logout" title="Log out" aria-label="Log out" @click="logout">
              <AdminIcon name="logout" :size="17" />
            </button>
          </div>
        </div>
      </aside>

      <div class="adm-scrim" @click="mobileOpen = false" />

      <div class="adm-content">
        <div class="adm-mobile-bar">
          <button type="button" class="adm-btn adm-btn-icon" aria-label="Open menu" @click="mobileOpen = true">
            <AdminIcon name="menu" />
          </button>
          <img src="/images/yana-logo-gold.svg" alt="YANA" class="mobile-logo">
        </div>
        <main class="adm-main">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/admin.css'

interface SessionUser {
  name: string
  email: string
  role: 'manager' | 'host'
}

const route = useRoute()
const isLogin = computed(() => route.path === '/admin/login')

const { data: session, refresh } = await useFetch<{ authed: boolean, user?: SessionUser }>('/api/admin/session')
const user = computed(() => session.value?.user)
const userInitials = computed(() => (user.value?.name ?? '').split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase())

watch(() => route.path, () => refresh())

const serviceNav = [
  { to: '/admin/reservations', label: 'Reservations', icon: 'calendar' },
  { to: '/admin/guests', label: 'Guests', icon: 'guests' }
] as const

const insightNav = [
  { to: '/admin/reports', label: 'Reports', icon: 'reports' }
] as const

const collapsed = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
  try {
    collapsed.value = localStorage.getItem('yana-admin-sidebar') === 'collapsed'
  } catch {}
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  try {
    localStorage.setItem('yana-admin-sidebar', collapsed.value ? 'collapsed' : 'open')
  } catch {}
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.adm {
  min-height: 100vh;
}

.adm-shell {
  --side-w: 232px;
  display: flex;
  min-height: 100vh;
}

.adm-shell.is-collapsed {
  --side-w: 68px;
}

.adm-side {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--side-w);
  height: 100vh;
  background: var(--adm-nav);
  color: rgba(255, 255, 255, 0.72);
  transition: width 0.2s ease;
  overflow: hidden;
  z-index: 40;
}

.side-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 64px;
  padding: 0 14px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.side-logo {
  display: block;
  height: 20px;
  width: auto;
}

.side-collapse {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.side-collapse:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.is-collapsed .side-brand {
  flex-direction: column;
  justify-content: center;
  padding: 0;
}

.is-collapsed .side-logo-link {
  display: none;
}

.side-nav {
  flex: 1;
  padding: 10px 10px;
  overflow-y: auto;
}

.side-group {
  margin: 16px 10px 6px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}

.is-collapsed .side-group {
  height: 1px;
  margin: 14px 8px;
  background: rgba(255, 255, 255, 0.08);
  color: transparent;
  overflow: hidden;
}

.side-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 0 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 13.5px;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.side-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.side-link.router-link-active {
  background: var(--adm-nav-2);
  color: var(--adm-accent);
}

.side-link.router-link-active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--adm-accent);
}

.side-link :deep(.adm-icon) {
  flex-shrink: 0;
}

.is-collapsed .side-link {
  justify-content: center;
  padding: 0;
}

.is-collapsed .side-text {
  display: none;
}

.side-foot {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.side-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px 4px 6px;
}

.is-collapsed .side-user {
  flex-direction: column;
  padding: 8px 0 0;
}

.side-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--adm-accent);
  color: var(--adm-nav);
  font-size: 12px;
  font-weight: 500;
}

.side-user-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.side-user-name {
  overflow: hidden;
  font-size: 13px;
  color: #fff;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side-user-role {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.side-logout {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
}

.side-logout:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.adm-content {
  flex: 1;
  min-width: 0;
}

.adm-main {
  padding: 22px clamp(16px, 2.2vw, 32px) 40px;
}

.adm-mobile-bar,
.adm-scrim {
  display: none;
}

@media (max-width: 900px) {
  .adm-shell,
  .adm-shell.is-collapsed {
    --side-w: 248px;
  }

  .adm-side {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
    transition: transform 0.22s ease;
  }

  .is-mobile-open .adm-side {
    transform: none;
  }

  .is-mobile-open .adm-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 39;
    background: rgba(15, 30, 46, 0.4);
  }

  .side-collapse {
    display: none;
  }

  .is-collapsed .side-logo-link {
    display: block;
  }

  .is-collapsed .side-text {
    display: inline;
  }

  .is-collapsed .side-link {
    justify-content: flex-start;
    padding: 0 12px;
  }

  .adm-mobile-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    padding: 0 16px;
    background: var(--adm-nav);
  }

  .adm-mobile-bar .adm-btn {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .mobile-logo {
    height: 18px;
  }

  .adm-main {
    padding: 16px 16px 32px;
  }
}
</style>
