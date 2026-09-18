<template>
  <div>
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="adm-seg" role="tablist" aria-label="View">
        <button v-for="v in views" :key="v.key" type="button" :class="{ 'is-active': view === v.key }" :title="v.label" @click="view = v.key">
          <AdminIcon :name="v.icon" :size="15" />
          <span class="seg-text">{{ v.label }}</span>
        </button>
      </div>

      <div class="date-nav">
        <button type="button" class="adm-btn adm-btn-icon" aria-label="Previous day" @click="date = addDays(date, -1)">
          <AdminIcon name="left" :size="16" />
        </button>
        <label class="date-pill">
          <AdminIcon name="calendar" :size="15" />
          <span>{{ formatDateLong(date) }}</span>
          <input v-model="date" type="date" class="date-input" aria-label="Choose date" required>
        </label>
        <button type="button" class="adm-btn adm-btn-icon" aria-label="Next day" @click="date = addDays(date, 1)">
          <AdminIcon name="right" :size="16" />
        </button>
        <button type="button" class="adm-btn" :class="{ 'is-today': date === todayIso() }" :disabled="date === todayIso()" @click="date = todayIso()">Today</button>
      </div>

      <select v-model="shift" class="adm-select shift-select" aria-label="Shift">
        <option v-for="s in SHIFTS" :key="s.key" :value="s.key" :title="`${formatTime(s.start)}–${formatTime(s.end)}`">{{ s.label }}</option>
      </select>

      <div class="search">
        <AdminIcon name="search" :size="15" class="search-icon" />
        <input v-model="search" type="search" class="adm-input" placeholder="Search all reservations" aria-label="Search reservations">
      </div>

      <div class="toolbar-actions">
        <button type="button" class="adm-btn adm-btn-icon" title="Export CSV" aria-label="Export CSV" @click="exportCsv">
          <AdminIcon name="download" :size="16" />
        </button>
        <button type="button" class="adm-btn" @click="openForm({ mode: 'walk_in' })">
          <AdminIcon name="walkin" :size="16" /> Walk-in
        </button>
        <button type="button" class="adm-btn adm-btn-accent" @click="openForm({ mode: 'reservation', date })">
          <AdminIcon name="plus" :size="16" /> Reservation
        </button>
      </div>
    </div>

    <!-- Status tabs -->
    <div v-if="!searching" class="status-tabs" role="tablist" aria-label="Status">
      <button
        v-for="g in groupStats"
        :key="g.key"
        type="button"
        role="tab"
        class="status-tab"
        :class="{ 'is-active': tab === g.key }"
        :aria-selected="tab === g.key"
        @click="tab = g.key"
      >
        <span class="tab-label">{{ g.label }} <strong class="adm-num">{{ g.count }}</strong></span>
        <span class="tab-covers adm-num"><AdminIcon name="users" :size="13" /> {{ g.covers }} covers</span>
      </button>
    </div>
    <div v-else class="search-banner">
      <AdminIcon name="search" :size="15" />
      {{ searchResults.length }} {{ searchResults.length === 1 ? 'match' : 'matches' }} for “{{ search.trim() }}” across all dates
      <button type="button" class="adm-btn adm-btn-sm" @click="search = ''">Clear search</button>
    </div>

    <p v-if="error" class="adm-error page-error">{{ error }}</p>

    <div v-if="loading && !reservations.length" class="adm-card adm-empty">Loading reservations…</div>

    <template v-else>
      <AdminReservationList
        v-if="view === 'list' || searching"
        :reservations="searching ? searchResults : tabReservations"
        :selected-id="selected?.id"
        :show-date="searching"
        :date="date"
        :empty-text="searching ? 'No reservations match that search.' : `No ${tabLabel.toLowerCase()} for ${formatDateLong(date)}.`"
        @select="select"
        @status="(r, status) => quickPatch(r, { status })"
      />
      <AdminFloorView
        v-else-if="view === 'floor'"
        :reservations="shiftReservations"
        :sections="sections"
        :date="date"
        :shift="shift"
        @select="select"
        @assign="(r, tableId) => quickPatch(r, { tableId })"
      />
      <AdminTimelineView
        v-else
        :reservations="shiftReservations"
        :sections="sections"
        :date="date"
        :shift="shift"
        @select="select"
        @move="(r, tableId, time) => quickPatch(r, { tableId, time })"
        @create="(tableId, time) => openForm({ mode: 'reservation', date, time, tableId })"
      />
    </template>

    <AdminReservationDrawer :reservation="selected" :sections="sections" @close="selected = null" @updated="onUpdated" />
    <AdminReservationForm
      :open="formOpen"
      :preset="formPreset"
      :sections="sections"
      :reservations="reservations"
      @close="formOpen = false"
      @created="onCreated"
    />

    <Transition name="adm-fade">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ReservationFormPreset } from '~/components/admin/ReservationForm.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Reservations · YANA Admin' })

const route = useRoute()
const router = useRouter()

const views = [
  { key: 'list', label: 'List', icon: 'list' },
  { key: 'floor', label: 'Floor', icon: 'floor' },
  { key: 'timeline', label: 'Timeline', icon: 'timeline' }
] as const
type ViewKey = (typeof views)[number]['key']

// View, date and shift live in the URL so a refresh or shared link keeps them.
const view = ref<ViewKey>(views.some(v => v.key === route.query.view) ? route.query.view as ViewKey : 'list')
const date = ref(typeof route.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(route.query.date) ? route.query.date : todayIso())
const shift = ref<ShiftKey>(SHIFTS.some(s => s.key === route.query.shift) ? route.query.shift as ShiftKey : 'all')
const tab = ref<string>('all')
const search = ref('')

watch([view, date, shift], () => {
  router.replace({ query: { ...route.query, view: view.value, date: date.value, shift: shift.value } })
})

const reservations = ref<AdminReservation[]>([])
const sections = ref<FloorSection[]>([])
const loading = ref(true)
const error = ref('')
const selected = ref<AdminReservation | null>(null)

async function load(silent = false) {
  if (!date.value) return
  if (!silent) loading.value = true
  try {
    reservations.value = await $fetch<AdminReservation[]>('/api/reservations', { query: { date: date.value } })
    error.value = ''
    // Keep the open drawer in sync with background refreshes.
    if (selected.value) {
      const fresh = reservations.value.find(r => r.id === selected.value!.id)
      if (fresh && fresh.date === date.value) selected.value = fresh
    }
  } catch (err) {
    error.value = errorMessage(err, 'Could not load reservations.')
  } finally {
    loading.value = false
  }
}

async function loadFloor() {
  try {
    sections.value = await $fetch<FloorSection[]>('/api/admin/floor')
  } catch (err) {
    error.value = errorMessage(err, 'Could not load the floor plan.')
  }
}

watch(date, () => load())

// Live service: refresh quietly every 45 seconds while the tab is visible.
let poll: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  load()
  loadFloor()
  poll = setInterval(() => {
    if (document.visibilityState === 'visible') load(true)
  }, 45_000)
})
onBeforeUnmount(() => clearInterval(poll))

const shiftReservations = computed(() => {
  const def = SHIFTS.find(s => s.key === shift.value)!
  if (def.key === 'all') return reservations.value
  const start = toMinutes(def.start)
  const end = toMinutes(def.end)
  return reservations.value.filter(r => toMinutes(r.time) >= start && toMinutes(r.time) < end)
})

const groupStats = computed(() => STATUS_GROUPS.map((g) => {
  const items = shiftReservations.value.filter(r => (g.statuses as readonly string[]).includes(r.status))
  return { key: g.key, label: g.label, count: items.length, covers: items.reduce((n, r) => n + r.partySize, 0), items }
}))

const tabReservations = computed(() => groupStats.value.find(g => g.key === tab.value)?.items ?? [])
const tabLabel = computed(() => STATUS_GROUPS.find(g => g.key === tab.value)?.label ?? 'reservations')

// ---- Search (all dates) ----
const searchResults = ref<AdminReservation[]>([])
const searching = computed(() => search.value.trim().length >= 2)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  if (!searching.value) return
  searchTimer = setTimeout(async () => {
    try {
      searchResults.value = await $fetch<AdminReservation[]>('/api/reservations', { query: { q: search.value.trim() } })
    } catch (err) {
      error.value = errorMessage(err, 'Search failed.')
    }
  }, 250)
})

function select(r: AdminReservation) {
  selected.value = r
}

function replaceLocal(updated: AdminReservation) {
  const i = reservations.value.findIndex(r => r.id === updated.id)
  if (updated.date !== date.value) {
    if (i >= 0) reservations.value.splice(i, 1)
  } else if (i >= 0) {
    reservations.value[i] = updated
  } else {
    reservations.value.push(updated)
  }
  const si = searchResults.value.findIndex(r => r.id === updated.id)
  if (si >= 0) searchResults.value[si] = updated
}

function onUpdated(updated: AdminReservation) {
  replaceLocal(updated)
  selected.value = updated
  showToast(updated.date !== date.value ? `Moved to ${formatDateLong(updated.date)}` : 'Reservation saved')
}

async function quickPatch(r: AdminReservation, body: Record<string, unknown>) {
  try {
    const updated = await $fetch<AdminReservation>(`/api/reservations/${r.id}`, { method: 'PATCH', body })
    replaceLocal(updated)
    if (selected.value?.id === updated.id) selected.value = updated
    if ('status' in body) {
      showToast(`${guestName(updated)} · ${STATUS_META[updated.status].label}`)
    } else {
      const table = updated.tableName ? `table ${updated.tableName}` : 'unassigned'
      showToast(`${guestName(updated)} → ${table} at ${formatTime(updated.time)}`)
    }
  } catch (err) {
    error.value = errorMessage(err, 'Could not update the reservation.')
  }
}

// ---- New booking ----
const formOpen = ref(false)
const formPreset = ref<ReservationFormPreset>({})

function openForm(preset: ReservationFormPreset) {
  formPreset.value = preset
  formOpen.value = true
}

async function onCreated(created: { reference: string, date: string }) {
  formOpen.value = false
  if (created.date !== date.value) date.value = created.date
  else await load(true)
  showToast(`Booking #${created.reference} created`)
}

// ---- Export ----
function exportCsv() {
  const rows = searching.value ? searchResults.value : tabReservations.value
  downloadCsv(`yana-reservations-${date.value}.csv`, [
    ['Reference', 'Date', 'Time', 'Guest', 'Party', 'Table', 'Status', 'Source', 'Phone', 'Email', 'Tags', 'Guest request', 'Internal notes'],
    ...rows.map(r => [
      r.reference, r.date, r.time, guestName(r), r.partySize, r.tableName, STATUS_META[r.status].label,
      SOURCE_LABELS[r.source], r.phone, r.email, r.tags.join('; '), r.notes, r.internalNotes
    ])
  ])
}

// ---- Toast ----
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2600)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  min-width: 176px;
  padding: 0 12px;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.date-input {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.shift-select {
  width: auto;
}

.search {
  position: relative;
  flex: 1 1 180px;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--adm-faint);
}

.search .adm-input {
  padding-left: 34px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.status-tabs {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  margin-bottom: 14px;
  overflow-x: auto;
  border: 1px solid var(--adm-line);
  border-radius: 10px;
  background: var(--adm-surface);
  box-shadow: var(--adm-shadow);
}

.status-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 16px;
  border: 0;
  border-right: 1px solid var(--adm-line);
  background: transparent;
  font-family: inherit;
  text-align: left;
  color: var(--adm-muted);
  cursor: pointer;
}

.status-tab:last-child {
  border-right: 0;
}

.status-tab:hover {
  background: var(--adm-surface-2);
}

.status-tab.is-active {
  color: var(--adm-text);
  background: #FBF7F0;
}

.status-tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--adm-accent);
}

.tab-label {
  font-size: 13px;
  white-space: nowrap;
}

.tab-label strong {
  margin-left: 4px;
  font-size: 15px;
  font-weight: 500;
  color: var(--adm-text);
}

.tab-covers {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--adm-faint);
}

.search-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #EDF2F7;
  color: var(--adm-primary);
  font-size: 13px;
}

.search-banner .adm-btn {
  margin-left: auto;
}

.page-error {
  margin-bottom: 14px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 80;
  padding: 11px 18px;
  border-radius: 8px;
  background: var(--adm-nav);
  color: #fff;
  font-size: 13.5px;
  box-shadow: var(--adm-shadow-lg);
  transform: translateX(-50%);
}

@media (max-width: 1560px) {
  .seg-text {
    display: none;
  }
}

@media (max-width: 720px) {
  .date-pill {
    min-width: 0;
    flex: 1;
  }

  .date-nav {
    width: 100%;
  }

  .shift-select,
  .search {
    flex: 1 1 100%;
    max-width: none;
  }

  .toolbar-actions {
    width: 100%;
  }

  .toolbar-actions .adm-btn:not(.adm-btn-icon) {
    flex: 1;
  }
}
</style>
