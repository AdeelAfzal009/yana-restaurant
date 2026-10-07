<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ 'is-compact': compact }"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Light mode' : 'Dark mode'"
    @click="toggleTheme"
  >
    <span class="theme-icon" aria-hidden="true">
      <svg v-if="isDark" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" /></svg>
    </span>
    <span v-if="!compact" class="theme-text">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ compact?: boolean }>()
const { isDark, toggleTheme } = useAdminTheme()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--adm-radius);
  background: transparent;
  color: var(--adm-text-3);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.theme-toggle:hover {
  background: var(--adm-surface-3);
  color: var(--adm-heading);
}

.theme-icon {
  display: inline-flex;
  color: var(--adm-faint);
  transition: color 0.2s, transform 0.4s ease;
}

.theme-toggle:hover .theme-icon {
  color: var(--adm-accent-dk);
  transform: rotate(-20deg);
}

.theme-toggle.is-compact {
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--adm-line);
  border-radius: 50%;
  background: var(--adm-surface);
  box-shadow: var(--adm-shadow);
}
</style>
