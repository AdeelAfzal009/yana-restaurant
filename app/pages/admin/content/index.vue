<template>
  <div>
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Website content</h1>
        <p class="adm-page-sub">Change the text, images and buttons on the website. Each page is split into the sections you see on the site; changes go live as soon as you save.</p>
      </div>
    </div>

    <p v-if="error" class="adm-error">Could not load the pages. If you just updated the site, restart the server so the database is up to date.</p>

    <div v-if="data" class="wc-grid">
      <NuxtLink v-for="page in data.pages" :key="page.key" :to="`/admin/content/${page.key}`" class="adm-card wc-card">
        <span class="wc-icon"><AdminIcon :name="page.key === 'site' ? 'phone' : page.key === 'layout' ? 'menu' : 'layout'" :size="18" /></span>
        <span class="wc-body">
          <span class="wc-title">{{ page.label }}</span>
          <span class="wc-desc">{{ page.description }}</span>
          <span class="wc-meta">
            {{ page.sectionCount }} {{ page.sectionCount === 1 ? 'section' : 'sections' }}
            <template v-if="page.updatedAt"> · Updated {{ formatWhen(page.updatedAt) }}</template>
            <template v-else> · Original content</template>
          </span>
        </span>
        <AdminIcon name="right" :size="16" class="wc-arrow" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Website content · YANA admin' })

interface PagesResponse {
  pages: { key: string, label: string, description: string, sectionCount: number, updatedAt: string | null }[]
}

const { data, error } = await useFetch<PagesResponse>('/api/admin/content')

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.wc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.wc-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

a.wc-card:hover {
  border-color: var(--adm-line-strong);
  box-shadow: var(--adm-shadow-md);
}

.wc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--adm-radius);
  background: var(--adm-primary-50);
  color: var(--adm-primary);
}

.wc-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.wc-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--adm-heading);
}

.wc-desc {
  font-size: 13px;
  color: var(--adm-text-3);
}

.wc-meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--adm-muted);
}

.wc-arrow {
  align-self: center;
  color: var(--adm-faint);
}
</style>
