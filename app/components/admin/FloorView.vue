<template>
  <div class="floor-layout">
    <div class="adm-card floor-main">
      <div class="floor-bar">
        <div class="section-tabs" role="tablist">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            role="tab"
            class="section-tab"
            :class="{ 'is-active': s.id === activeSectionId }"
            :aria-selected="s.id === activeSectionId"
            @click="activeSectionId = s.id!"
          >
            <span class="section-name">{{ s.name }}</span>
            <span class="section-stats adm-num">
              <span title="Reservations"><AdminIcon name="calendar" :size="13" /> {{ sectionCounts[s.id!]?.bookings ?? 0 }}</span>
              <span title="Tables occupied"><AdminIcon name="table" :size="13" /> {{ sectionCounts[s.id!]?.occupied ?? 0 }}/{{ s.tables.length }}</span>
            </span>
          </button>
        </div>
        <label class="at-time">
          <AdminIcon name="clock" :size="15" />
          <span class="adm-muted">Showing</span>
          <select v-model="atTime" class="adm-select">
            <option v-for="t in timeOptions" :key="t" :value="t">{{ formatTime(t) }}</option>
          </select>
        </label>
      </div>

      <p v-if="assigning" class="assign-hint">
        <AdminIcon name="table" :size="15" />
        Pick a table for <strong>{{ guestName(assigning) }}</strong> ({{ assigning.partySize }} guests) — highlighted tables fit the party.
        <button type="button" class="adm-btn adm-btn-sm" @click="assigning = null">Cancel</button>
      </p>

      <div class="canvas-wrap">
        <AdminFloorCanvas
          v-if="activeSection"
          :section="activeSection"
          :states="tableStates"
          :highlight="assignTargets"
          @table-click="onTableClick"
        />
        <p v-else class="adm-empty">No floor plan yet. A manager can draw one in the Floorplan editor.</p>
      </div>

      <div class="legend">
        <span v-for="s in legendStatuses" :key="s" class="legend-item">
          <span class="adm-dot" :style="{ background: STATUS_META[s].color }" /> {{ STATUS_META[s].label }}
        </span>
        <span class="legend-item"><span class="legend-outline" /> Booked later</span>
      </div>
    </div>

    <aside class="adm-card floor-side">
      <div class="side-head">
        <h3>Reservations</h3>
        <span class="adm-muted adm-num">{{ reservations.length }} · {{ totalCovers }} covers</span>
      </div>
      <div class="side-groups">
        <details v-for="g in groups" :key="g.key" class="group" :open="g.key !== 'finished' && g.key !== 'cancelled'">
          <summary>
            <span class="adm-dot" :style="{ background: g.color }" />
            <span class="group-label">{{ g.label }}</span>
            <span class="group-count adm-num">{{ g.items.length }} · <AdminIcon name="users" :size="12" /> {{ g.covers }}</span>
          </summary>
          <p v-if="!g.items.length" class="group-empty">None</p>
          <button
            v-for="r in g.items"
            :key="r.id"
            type="button"
            class="side-res"
            :class="{ 'is-assigning': assigning?.id === r.id }"
            @click="emit('select', r)"
          >
            <span class="side-time adm-num">{{ formatTime(r.time) }}</span>
            <span class="side-name">
              {{ guestName(r) }}
              <AdminIcon v-if="r.guestVip" name="star" :size="12" class="vip-star" />
            </span>
            <span class="side-party adm-num"><AdminIcon name="users" :size="12" /> {{ r.partySize }}</span>
            <span v-if="r.tableName" class="side-table">{{ r.tableName }}</span>
            <span
              v-else-if="ACTIVE_STATUSES.includes(r.status)"
              class="side-assign"
              role="button"
              tabindex="0"
              @click.stop="assigning = r"
              @keydown.enter.stop="assigning = r"
            >Assign</span>
          </button>
        </details>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { TableState } from './FloorCanvas.vue'

const props = defineProps<{
  reservations: AdminReservation[]
  sections: FloorSection[]
  date: string
  shift: ShiftKey
}>()

const emit = defineEmits<{
  select: [AdminReservation]
  assign: [reservation: AdminReservation, tableId: number]
}>()

const activeSectionId = ref<number | null>(props.sections[0]?.id ?? null)
watch(() => props.sections, (list) => {
  if (!list.some(s => s.id === activeSectionId.value)) activeSectionId.value = list[0]?.id ?? null
})
const activeSection = computed(() => props.sections.find(s => s.id === activeSectionId.value))

const shiftDef = computed(() => SHIFTS.find(s => s.key === props.shift) ?? SHIFTS[0])
const timeOptions = computed(() => {
  const out: string[] = []
  for (let m = toMinutes(shiftDef.value.start); m < toMinutes(shiftDef.value.end); m += 15) out.push(fromMinutes(m))
  return out
})

// Default to the current quarter-hour on today's date, otherwise the shift start.
function defaultTime() {
  const opts = timeOptions.value
  if (props.date === todayIso()) {
    const now = Math.floor(nowMinutes() / 15) * 15
    const match = opts.find(t => toMinutes(t) >= now)
    if (match) return match
  }
  return opts[0] ?? '12:00'
}
const atTime = ref(defaultTime())
watch([() => props.date, () => props.shift], () => { atTime.value = defaultTime() })

// A table shows the party in service at it; failing that, the booking that
// covers the chosen time; failing that, the next booking due within three hours.
const tableStates = computed(() => {
  const at = toMinutes(atTime.value)
  const isToday = props.date === todayIso()
  const byTable = new Map<number, AdminReservation[]>()
  for (const r of props.reservations) {
    if (!r.tableId || !ACTIVE_STATUSES.includes(r.status)) continue
    byTable.set(r.tableId, [...(byTable.get(r.tableId) ?? []), r])
  }

  const states: Record<number, TableState> = {}
  for (const [tableId, list] of byTable) {
    const covers = (r: AdminReservation) => at >= toMinutes(r.time) && at < toMinutes(r.time) + r.durationMinutes
    const inService = list.find(r => (r.status === 'arrived' || r.status === 'seated') && (isToday || covers(r)))
    const pick = inService
      ?? list.find(covers)
      ?? list
        .filter(r => toMinutes(r.time) > at && toMinutes(r.time) - at <= 180)
        .sort((a, b) => a.time.localeCompare(b.time))[0]
    if (!pick) continue
    states[tableId] = {
      reservationId: pick.id,
      name: guestName(pick),
      time: formatTime(pick.time).replace(/(am|pm)$/, ''),
      partySize: pick.partySize,
      color: STATUS_META[pick.status].color,
      occupied: pick === inService
    }
  }
  return states
})

const sectionCounts = computed(() => {
  const out: Record<number, { bookings: number, occupied: number }> = {}
  for (const s of props.sections) {
    const ids = new Set(s.tables.map(t => t.id))
    out[s.id!] = {
      bookings: props.reservations.filter(r => r.tableId && ids.has(r.tableId) && r.status !== 'cancelled' && r.status !== 'no_show').length,
      occupied: s.tables.filter(t => t.id != null && tableStates.value[t.id]?.occupied).length
    }
  }
  return out
})

const assigning = ref<AdminReservation | null>(null)
const assignTargets = computed(() => {
  const r = assigning.value
  if (!r) return null
  return new Set(props.sections.flatMap(s => s.tables)
    .filter(t => t.id != null && r.partySize <= t.maxCovers && r.partySize >= t.minCovers)
    .map(t => t.id!))
})

function onTableClick(table: FloorTable) {
  if (assigning.value && table.id != null) {
    emit('assign', assigning.value, table.id)
    assigning.value = null
    return
  }
  const state = table.id != null ? tableStates.value[table.id] : undefined
  const r = state && props.reservations.find(x => x.id === state.reservationId)
  if (r) emit('select', r)
}

const legendStatuses: ReservationStatus[] = ['confirmed', 'arrived', 'seated']

const groups = computed(() => {
  const defs = [
    { key: 'upcoming', label: 'Upcoming', statuses: ['pending', 'confirmed'], color: STATUS_META.confirmed.color },
    { key: 'in_service', label: 'Arrived / Seated', statuses: ['arrived', 'seated'], color: STATUS_META.seated.color },
    { key: 'waitlist', label: 'Waitlist', statuses: ['waitlist'], color: STATUS_META.waitlist.color },
    { key: 'finished', label: 'Finished', statuses: ['finished'], color: STATUS_META.finished.color },
    { key: 'cancelled', label: 'Cancelled / No-show', statuses: ['cancelled', 'no_show'], color: STATUS_META.cancelled.color }
  ]
  return defs.map((d) => {
    const items = props.reservations.filter(r => d.statuses.includes(r.status))
    return { ...d, items, covers: items.reduce((n, r) => n + r.partySize, 0) }
  })
})

const totalCovers = computed(() => props.reservations
  .filter(r => r.status !== 'cancelled' && r.status !== 'no_show')
  .reduce((n, r) => n + r.partySize, 0))
</script>

<style scoped>
.floor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.floor-main {
  overflow: hidden;
}

.floor-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 14px 0 0;
  background: var(--adm-nav);
}

.section-tabs {
  display: flex;
  overflow-x: auto;
}

.section-tab {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 11px 22px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.section-tab.is-active {
  border-bottom-color: var(--adm-accent);
  background: var(--adm-nav-2);
  color: var(--adm-accent);
}

.section-name {
  font-size: 14px;
  font-weight: 500;
}

.section-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.section-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.at-time {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.at-time .adm-muted {
  color: rgba(255, 255, 255, 0.55);
}

.at-time .adm-select {
  width: auto;
  height: 32px;
}

.assign-hint {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 10px 16px;
  background: #FBF4E8;
  border-bottom: 1px solid #EFDFC4;
  font-size: 13px;
  color: var(--adm-accent-dk);
}

.assign-hint .adm-btn {
  margin-left: auto;
}

.canvas-wrap {
  padding: 18px;
  background: #ECEAE5;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--adm-line);
  font-size: 12.5px;
  color: var(--adm-muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-outline {
  width: 12px;
  height: 12px;
  border: 2px solid var(--adm-primary);
  border-radius: 3px;
}

.floor-side {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 220px);
  overflow: hidden;
}

.side-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--adm-line);
}

.side-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.side-head span {
  font-size: 12.5px;
}

.side-groups {
  overflow-y: auto;
}

.group {
  border-bottom: 1px solid var(--adm-line);
}

.group summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  cursor: pointer;
  list-style: none;
  font-size: 13px;
  font-weight: 500;
  background: var(--adm-surface-2);
}

.group summary::-webkit-details-marker {
  display: none;
}

.group-label {
  flex: 1;
}

.group-count {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 400;
  color: var(--adm-muted);
}

.group-empty {
  margin: 0;
  padding: 10px 16px;
  font-size: 12.5px;
  color: var(--adm-faint);
}

.side-res {
  display: grid;
  grid-template-columns: 58px 1fr auto auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: 0;
  border-top: 1px solid var(--adm-line);
  background: var(--adm-surface);
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  color: var(--adm-text);
  cursor: pointer;
}

.side-res:hover {
  background: #FBF8F3;
}

.side-res.is-assigning {
  background: #FBF4E8;
  box-shadow: inset 3px 0 0 var(--adm-accent);
}

.side-time {
  font-weight: 500;
  font-size: 12.5px;
}

.side-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.vip-star {
  flex-shrink: 0;
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.side-party {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--adm-muted);
}

.side-table {
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--adm-nav);
  color: #fff;
  font-size: 11.5px;
  font-weight: 500;
}

.side-assign {
  padding: 2px 8px;
  border: 1px dashed var(--adm-accent-dk);
  border-radius: 4px;
  color: var(--adm-accent-dk);
  font-size: 11.5px;
  font-weight: 500;
}

.side-assign:hover {
  background: #FBF4E8;
}

@media (max-width: 1180px) {
  .floor-layout {
    grid-template-columns: 1fr;
  }

  .floor-side {
    position: static;
    max-height: none;
  }
}
</style>
