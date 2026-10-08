<template>
  <div>
    <NuxtLink to="/admin/content" class="wc-back">
      <AdminIcon name="left" :size="15" /> Website content
    </NuxtLink>

    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">{{ page.label }}</h1>
        <p class="adm-page-sub">{{ page.description }}</p>
      </div>
      <a :href="page.path ?? '/'" target="_blank" rel="noopener" class="adm-btn">
        <AdminIcon name="external" :size="16" />
        View on website
      </a>
    </div>

    <p v-if="error" class="adm-error">Could not load this page's content. Refresh to try again.</p>

    <div v-if="data" class="wc-layout">
      <nav v-if="page.sections.length > 2" class="wc-toc" aria-label="Sections">
        <p class="adm-label wc-toc-label">Sections</p>
        <a
          v-for="section in page.sections"
          :key="section.id"
          :href="`#section-${section.id}`"
          class="wc-toc-link"
          :class="{ 'is-active': activeId === section.id }"
          :aria-current="activeId === section.id ? 'location' : undefined"
          @click.prevent="goTo(section.id)"
        >
          {{ section.label }}
          <span v-if="dirtySections.has(section.id)" class="wc-toc-dot" title="Unsaved changes" />
        </a>
      </nav>

      <div class="wc-sections">
        <AdminContentSection
          v-for="section in page.sections"
          :key="section.id"
          :page="page.key"
          :section="section"
          :initial="data.sections[section.id]!"
          @dirty="onDirty"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getContentPage } from '#shared/content'
import type { SectionState } from '~/components/admin/ContentSection.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const found = getContentPage(String(route.params.page))
if (!found) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
const page = found

useHead({ title: `${page.label} · Website content · YANA admin` })

const { data, error } = await useFetch<{ sections: Record<string, SectionState> }>(`/api/admin/content/${page.key}`)

const dirtySections = ref(new Set<string>())
function onDirty(id: string, dirty: boolean) {
  if (dirty) dirtySections.value.add(id)
  else dirtySections.value.delete(id)
}

onBeforeRouteLeave(() => {
  if (dirtySections.value.size && !confirm('Some sections have unsaved changes. Leave anyway?')) return false
})

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (dirtySections.value.size) e.preventDefault()
}

// Highlights the section on screen in the list on the left: the last section
// whose top has passed a line 30% down the window.
const activeId = ref(page.sections[0]?.id ?? '')
// After a click, the list stays on the clicked section while the page glides
// there, instead of flicking through every section it passes.
let followScrollAfter = 0
let frame = 0

function updateActive() {
  frame = 0
  if (Date.now() < followScrollAfter) return
  const line = window.innerHeight * 0.3
  let current = page.sections[0]?.id ?? ''
  for (const section of page.sections) {
    const el = document.getElementById(`section-${section.id}`)
    if (el && el.getBoundingClientRect().top <= line) current = section.id
  }
  // Short sections at the end can never reach the line, so the bottom of the
  // page always means the last one.
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
  activeId.value = atBottom ? page.sections[page.sections.length - 1]!.id : current
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(updateActive)
}

function goTo(id: string) {
  const el = document.getElementById(`section-${id}`)
  if (!el) return
  activeId.value = id
  followScrollAfter = Date.now() + 900
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#section-${id}`)
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  // Opening a link like /admin/content/home#section-bar lands on that section.
  const fromHash = location.hash.replace('#section-', '')
  if (page.sections.some(s => s.id === fromHash)) goTo(fromHash)
  else updateActive()
})
onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
.wc-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--adm-muted);
  text-decoration: none;
}

.wc-back:hover {
  color: var(--adm-primary);
}

.wc-layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.wc-layout:not(:has(.wc-toc)) {
  grid-template-columns: minmax(0, 1fr);
}

.wc-toc {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wc-toc-label {
  margin: 0 0 6px;
}

.wc-toc-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--adm-radius);
  font-size: 13px;
  color: var(--adm-text-3);
  text-decoration: none;
}

.wc-toc-link:hover {
  background: var(--adm-surface-3);
  color: var(--adm-heading);
}

/* Same look as the current page in the sidebar. */
.wc-toc-link.is-active {
  background: var(--adm-primary-50);
  color: var(--adm-primary);
  font-weight: 600;
}

.adm-dark .wc-toc-link.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  bottom: 7px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--adm-accent);
}

.wc-toc-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--adm-accent-dk);
}

.wc-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 820px;
}

@media (max-width: 960px) {
  .wc-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .wc-toc {
    display: none;
  }
}
</style>
