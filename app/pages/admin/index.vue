<template>
  <div class="noaccess">
    <AdminIcon name="key" :size="28" />
    <h1 class="adm-page-title">No access yet</h1>
    <p class="adm-page-sub">Your account doesn't have any areas of the dashboard switched on. Ask a manager to give you access on the Users page.</p>
  </div>
</template>

<script setup lang="ts">
import { homePathFor } from '#shared/utils/permissions'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'YANA admin' })

// /admin opens the first area this user can use.
const { ready, user } = useAdminAccess()
await ready
const home = homePathFor(user.value?.permissions ?? [])
if (home !== '/admin') await navigateTo(home, { replace: true })
</script>

<style scoped>
.noaccess {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 420px;
  margin: 12vh auto 0;
  text-align: center;
  color: var(--adm-muted);
}
</style>
