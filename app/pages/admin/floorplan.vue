<template>
  <div>
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Floorplan editor</h1>
        <p class="adm-page-sub">Drag to move, use the corner handle to resize. Changes go live when you save.</p>
      </div>
      <div class="head-actions">
        <span v-if="dirty" class="dirty-note">Unsaved changes</span>
        <button type="button" class="adm-btn" :disabled="!dirty || saving" @click="load">Discard</button>
        <button type="button" class="adm-btn adm-btn-primary" :disabled="!dirty || saving || !isManager" @click="save">
          <AdminIcon name="save" :size="15" /> {{ saving ? 'Saving…' : 'Save floorplan' }}
        </button>
      </div>
    </div>

    <p v-if="!isManager" class="adm-error">Only managers can change the floorplan. You can look, but saving is disabled.</p>
    <p v-if="error" class="adm-error">{{ error }}</p>
    <p v-if="saved" class="saved-note"><AdminIcon name="check" :size="15" /> Floorplan saved.</p>

    <div class="editor">
      <div class="adm-card canvas-card">
        <div class="section-bar">
          <div class="section-tabs">
            <button
              v-for="(s, i) in sections"
              :key="i"
              type="button"
              class="section-tab"
              :class="{ 'is-active': i === activeIndex }"
              @click="activeIndex = i; selectedKey = null"
            >
              {{ s.name || 'Untitled' }}
              <span class="adm-muted adm-num">{{ s.tables.length }}</span>
            </button>
          </div>
          <button type="button" class="adm-btn adm-btn-sm" @click="addSection"><AdminIcon name="plus" :size="14" /> Add section</button>
        </div>
        <div class="canvas-wrap">
          <AdminFloorCanvas
            v-if="active"
            :section="active"
            editable
            :selected-key="selectedKey"
            @select="selectedKey = $event"
            @move="onMove"
            @resize="onResize"
          />
        </div>
        <div class="canvas-foot adm-muted">
          {{ active?.tables.length ?? 0 }} tables · {{ activeCovers }} seats in {{ active?.name }} · {{ totalCovers }} seats across the restaurant
        </div>
      </div>

      <aside class="panel">
        <template v-if="selectedTable">
          <div class="panel-head">
            <h2>Table {{ selectedTable.name }}</h2>
            <button type="button" class="panel-x" aria-label="Deselect" @click="selectedKey = null"><AdminIcon name="close" :size="16" /></button>
          </div>
          <div class="panel-body">
            <label class="adm-field">
              <span class="adm-label">Name</span>
              <input v-model="selectedTable.name" class="adm-input" maxlength="12">
            </label>
            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="adm-label">Min covers</span>
                <input v-model.number="selectedTable.minCovers" type="number" min="1" max="50" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="adm-label">Max covers</span>
                <input v-model.number="selectedTable.maxCovers" type="number" min="1" max="50" class="adm-input">
              </label>
            </div>
            <div class="adm-field">
              <span class="adm-label">Shape</span>
              <div class="adm-seg">
                <button v-for="sh in shapes" :key="sh" type="button" :class="{ 'is-active': selectedTable.shape === sh }" @click="setShape(sh)">{{ sh }}</button>
              </div>
            </div>
            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="adm-label">Width</span>
                <input v-model.number="selectedTable.width" type="number" min="20" max="600" step="5" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="adm-label">Height</span>
                <input v-model.number="selectedTable.height" type="number" min="20" max="600" step="5" class="adm-input">
              </label>
            </div>
            <label v-if="sections.length > 1" class="adm-field">
              <span class="adm-label">Section</span>
              <select class="adm-select" :value="activeIndex" @change="moveToSection(Number(($event.target as HTMLSelectElement).value))">
                <option v-for="(s, i) in sections" :key="i" :value="i">{{ s.name }}</option>
              </select>
            </label>
            <div class="panel-actions">
              <button type="button" class="adm-btn adm-btn-sm" @click="duplicate"><AdminIcon name="plus" :size="14" /> Duplicate</button>
              <button type="button" class="adm-btn adm-btn-sm adm-btn-danger" @click="removeSelected"><AdminIcon name="trash" :size="14" /> Delete</button>
            </div>
            <p v-if="selectedTable.id" class="hint adm-muted">Deleting a table unassigns any bookings on it.</p>
          </div>
        </template>

        <template v-else-if="selectedDecor">
          <div class="panel-head">
            <h2>{{ decorLabels[selectedDecor.kind] }}</h2>
            <button type="button" class="panel-x" aria-label="Deselect" @click="selectedKey = null"><AdminIcon name="close" :size="16" /></button>
          </div>
          <div class="panel-body">
            <label v-if="selectedDecor.kind !== 'wall' && selectedDecor.kind !== 'plant' && selectedDecor.kind !== 'zone'" class="adm-field">
              <span class="adm-label">Label</span>
              <input v-model="selectedDecor.label" class="adm-input" maxlength="30">
            </label>
            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="adm-label">Width</span>
                <input v-model.number="selectedDecor.width" type="number" min="4" max="1400" step="5" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="adm-label">Height</span>
                <input v-model.number="selectedDecor.height" type="number" min="4" max="800" step="5" class="adm-input">
              </label>
            </div>
            <div class="panel-actions">
              <button type="button" class="adm-btn adm-btn-sm" @click="duplicate"><AdminIcon name="plus" :size="14" /> Duplicate</button>
              <button type="button" class="adm-btn adm-btn-sm adm-btn-danger" @click="removeSelected"><AdminIcon name="trash" :size="14" /> Delete</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="panel-head"><h2>Objects library</h2></div>
          <div class="panel-body">
            <p class="lib-title">Tables</p>
            <div class="lib-grid">
              <button type="button" class="lib-item" @click="addTable('square')">
                <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="8" width="24" height="24" rx="3" /></svg>
                Square
              </button>
              <button type="button" class="lib-item" @click="addTable('round')">
                <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="13" /></svg>
                Round
              </button>
              <button type="button" class="lib-item" @click="addTable('rect')">
                <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="12" width="32" height="16" rx="3" /></svg>
                Long
              </button>
            </div>

            <p class="lib-title">Walls, shapes &amp; decor</p>
            <div class="lib-grid">
              <button v-for="k in decorKinds" :key="k" type="button" class="lib-item" @click="addDecor(k)">
                <svg viewBox="0 0 40 40" aria-hidden="true" v-html="decorIcons[k]" />
                {{ decorLabels[k] }}
              </button>
            </div>

            <p class="lib-title">Section</p>
            <label class="adm-field">
              <span class="adm-label">Name</span>
              <input v-if="active" v-model="active.name" class="adm-input" maxlength="30">
            </label>
            <button type="button" class="adm-btn adm-btn-sm adm-btn-danger section-del" :disabled="sections.length <= 1" @click="removeSection">
              <AdminIcon name="trash" :size="14" /> Delete section
            </button>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Floorplan editor · YANA Admin' })

const { data: session } = await useFetch<{ user?: { role: string } }>('/api/admin/session')
const isManager = computed(() => session.value?.user?.role === 'manager')

const sections = ref<FloorSection[]>([])
const original = ref('')
const activeIndex = ref(0)
const selectedKey = ref<string | null>(null)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const shapes = ['square', 'round', 'rect'] as const
const decorKinds = ['wall', 'bar', 'zone', 'door', 'plant', 'label'] as const
const decorLabels: Record<FloorDecor['kind'], string> = {
  wall: 'Wall',
  bar: 'Bar counter',
  zone: 'Zone outline',
  door: 'Door',
  plant: 'Plant',
  label: 'Text label'
}
const decorIcons: Record<FloorDecor['kind'], string> = {
  wall: '<rect x="4" y="17" width="32" height="6" rx="1" />',
  bar: '<rect x="4" y="12" width="32" height="16" rx="8" />',
  zone: '<rect x="6" y="8" width="28" height="24" style="fill:none" stroke-width="3" />',
  door: '<path d="M8 12 V28 H32 V12" style="fill:none" stroke-width="4" />',
  plant: '<circle cx="20" cy="20" r="11" />',
  label: '<text x="20" y="26" text-anchor="middle" font-size="16" font-weight="600" style="stroke:none">Aa</text>'
}

const active = computed(() => sections.value[activeIndex.value])

function parseKey() {
  const [kind, idx] = (selectedKey.value ?? '').split(':')
  return { kind, idx: Number(idx) }
}
const selectedTable = computed(() => {
  const { kind, idx } = parseKey()
  return kind === 't' ? active.value?.tables[idx] : undefined
})
const selectedDecor = computed(() => {
  const { kind, idx } = parseKey()
  return kind === 'd' ? active.value?.decor[idx] : undefined
})

const dirty = computed(() => JSON.stringify(sections.value) !== original.value)
const activeCovers = computed(() => active.value?.tables.reduce((n, t) => n + (Number(t.maxCovers) || 0), 0) ?? 0)
const totalCovers = computed(() => sections.value.reduce((n, s) => n + s.tables.reduce((m, t) => m + (Number(t.maxCovers) || 0), 0), 0))

async function load() {
  error.value = ''
  try {
    const data = await $fetch<FloorSection[]>('/api/admin/floor')
    // Strip server-only fields so "dirty" compares what the editor controls.
    sections.value = data.map(s => ({
      id: s.id,
      name: s.name,
      tables: s.tables.map(({ id, name, minCovers, maxCovers, shape, x, y, width, height }) => ({ id, name, minCovers, maxCovers, shape, x, y, width, height })),
      decor: s.decor.map(({ kind, label, x, y, width, height }) => ({ kind, label, x, y, width, height }))
    }))
    if (!sections.value.length) sections.value = [{ name: 'Main', tables: [], decor: [] }]
    original.value = JSON.stringify(sections.value)
    activeIndex.value = Math.min(activeIndex.value, sections.value.length - 1)
    selectedKey.value = null
  } catch (err) {
    error.value = errorMessage(err, 'Could not load the floorplan.')
  }
}
onMounted(load)

function onMove(key: string, x: number, y: number) {
  const obj = objectFor(key)
  if (obj) Object.assign(obj, { x, y })
}

function onResize(key: string, width: number, height: number) {
  const obj = objectFor(key)
  if (!obj) return
  // Round tables stay circular unless deliberately stretched in the panel.
  if (key.startsWith('t:') && (obj as FloorTable).shape === 'round') height = width
  Object.assign(obj, { width: Math.min(width, key.startsWith('t:') ? 600 : 1400), height })
}

function objectFor(key: string) {
  const [kind, idx] = key.split(':')
  const list = kind === 't' ? active.value?.tables : active.value?.decor
  return list?.[Number(idx)]
}

// New objects drop near the canvas centre, nudged so repeated adds don't stack.
function dropPoint(w: number, h: number) {
  const n = (active.value?.tables.length ?? 0) + (active.value?.decor.length ?? 0)
  return { x: FLOOR_WIDTH / 2 - w / 2 + (n % 5) * 20, y: FLOOR_HEIGHT / 2 - h / 2 + (n % 5) * 20 }
}

function nextTableName() {
  const names = new Set(sections.value.flatMap(s => s.tables.map(t => t.name.toLowerCase())))
  let n = 1
  while (names.has(String(n))) n++
  return String(n)
}

function addTable(shape: FloorTable['shape']) {
  if (!active.value) return
  const size = shape === 'round' ? { width: 90, height: 90 } : shape === 'rect' ? { width: 140, height: 60 } : { width: 78, height: 70 }
  active.value.tables.push({ name: nextTableName(), minCovers: 1, maxCovers: shape === 'rect' ? 6 : 4, shape, ...size, ...dropPoint(size.width, size.height) })
  selectedKey.value = `t:${active.value.tables.length - 1}`
}

function addDecor(kind: FloorDecor['kind']) {
  if (!active.value) return
  const sizes: Record<FloorDecor['kind'], { width: number, height: number }> = {
    wall: { width: 200, height: 10 },
    bar: { width: 300, height: 70 },
    zone: { width: 300, height: 180 },
    door: { width: 80, height: 28 },
    plant: { width: 60, height: 60 },
    label: { width: 160, height: 30 }
  }
  const size = sizes[kind]
  active.value.decor.push({ kind, label: kind === 'label' ? 'Label' : kind === 'bar' ? 'Bar' : null, ...size, ...dropPoint(size.width, size.height) })
  selectedKey.value = `d:${active.value.decor.length - 1}`
}

function setShape(shape: FloorTable['shape']) {
  const t = selectedTable.value
  if (!t) return
  t.shape = shape
  if (shape === 'round') t.height = t.width
}

function duplicate() {
  if (!active.value) return
  if (selectedTable.value) {
    const { id: _id, ...copy } = selectedTable.value
    active.value.tables.push({ ...copy, name: nextTableName(), x: copy.x + 30, y: copy.y + 30 })
    selectedKey.value = `t:${active.value.tables.length - 1}`
  } else if (selectedDecor.value) {
    const d = selectedDecor.value
    active.value.decor.push({ ...d, x: d.x + 30, y: d.y + 30 })
    selectedKey.value = `d:${active.value.decor.length - 1}`
  }
}

function removeSelected() {
  if (!active.value) return
  const { kind, idx } = parseKey()
  if (kind === 't') active.value.tables.splice(idx, 1)
  if (kind === 'd') active.value.decor.splice(idx, 1)
  selectedKey.value = null
}

function moveToSection(target: number) {
  const { idx } = parseKey()
  const t = selectedTable.value
  const dest = sections.value[target]
  if (!t || !dest || target === activeIndex.value) return
  active.value!.tables.splice(idx, 1)
  dest.tables.push(t)
  activeIndex.value = target
  selectedKey.value = `t:${dest.tables.length - 1}`
}

function addSection() {
  sections.value.push({ name: `Section ${sections.value.length + 1}`, tables: [], decor: [] })
  activeIndex.value = sections.value.length - 1
  selectedKey.value = null
}

function removeSection() {
  const s = active.value
  if (!s || sections.value.length <= 1) return
  if (s.tables.length && !confirm(`Delete ${s.name} and its ${s.tables.length} tables? Bookings on them will be unassigned.`)) return
  sections.value.splice(activeIndex.value, 1)
  activeIndex.value = Math.max(0, activeIndex.value - 1)
}

function onKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.closest('input, textarea, select')) return
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedKey.value) {
    e.preventDefault()
    removeSelected()
  }
  if (e.key === 'Escape') selectedKey.value = null
}

function beforeUnload(e: BeforeUnloadEvent) {
  if (dirty.value) e.preventDefault()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('beforeunload', beforeUnload)
})

onBeforeRouteLeave(() => {
  if (dirty.value && !confirm('You have unsaved floorplan changes. Leave without saving?')) return false
})

async function save() {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    await $fetch('/api/admin/floor', { method: 'PUT', body: { sections: sections.value } })
    await load()
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (err) {
    error.value = errorMessage(err, 'Could not save the floorplan.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dirty-note {
  font-size: 12.5px;
  color: var(--adm-accent-dk);
}

.adm-error,
.saved-note {
  margin-bottom: 14px;
}

.saved-note {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: var(--adm-radius);
  background: #E7F4EC;
  color: var(--adm-success);
  font-size: 13px;
}

.editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: start;
}

.canvas-card {
  overflow: hidden;
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px 0 0;
  border-bottom: 1px solid var(--adm-line);
}

.section-tabs {
  display: flex;
  overflow-x: auto;
}

.section-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: var(--adm-muted);
  cursor: pointer;
  white-space: nowrap;
}

.section-tab.is-active {
  border-bottom-color: var(--adm-accent);
  color: var(--adm-text);
  font-weight: 500;
}

.canvas-wrap {
  background: #EEF2F7;
}

.canvas-foot {
  padding: 9px 14px;
  border-top: 1px solid var(--adm-line);
  font-size: 12.5px;
}

.panel {
  position: sticky;
  top: 16px;
  overflow: hidden;
  border-radius: 10px;
  background: var(--adm-nav);
  color: #fff;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.panel-x {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.panel-x:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px 20px;
}

.panel .adm-label {
  color: rgba(255, 255, 255, 0.55);
}

.panel .adm-input,
.panel .adm-select {
  border-color: rgba(255, 255, 255, 0.16);
  background: var(--adm-nav-2);
  color: #fff;
}

.panel .adm-seg {
  align-self: flex-start;
  border-color: rgba(255, 255, 255, 0.16);
  background: var(--adm-nav-2);
}

.panel .adm-seg button {
  color: rgba(255, 255, 255, 0.65);
  text-transform: capitalize;
}

.panel .adm-seg button.is-active {
  background: var(--adm-accent);
  color: var(--adm-nav);
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel .adm-btn {
  border-color: rgba(255, 255, 255, 0.18);
  background: transparent;
  color: #fff;
}

.panel .adm-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.panel .adm-btn-danger {
  color: #F2A194;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.lib-title {
  margin: 4px 0 -4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.lib-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.lib-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: var(--adm-nav-2);
  color: rgba(255, 255, 255, 0.8);
  font-family: inherit;
  font-size: 11.5px;
  cursor: pointer;
}

.lib-item:hover {
  border-color: var(--adm-accent);
  color: #fff;
}

.lib-item svg {
  width: 34px;
  height: 34px;
  fill: #9AA3AD;
  stroke: #9AA3AD;
}

.section-del {
  align-self: flex-start;
}

@media (max-width: 1100px) {
  .editor {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
  }
}
</style>
