<template>
  <div class="adm-card list-card">
    <div v-if="!reservations.length" class="adm-empty">
      <AdminIcon name="calendar" :size="28" />
      <p>{{ emptyText }}</p>
    </div>
    <div v-else class="list-scroll">
      <table class="adm-table">
        <thead>
          <tr>
            <th>
              <button type="button" class="adm-sort" @click="setSort('time')">Time <span class="sort-mark">{{ sortMark('time') }}</span></button>
            </th>
            <th>
              <button type="button" class="adm-sort" @click="setSort('name')">Name <span class="sort-mark">{{ sortMark('name') }}</span></button>
            </th>
            <th class="center">Pre-service</th>
            <th class="center">In-service</th>
            <th class="center">Guests</th>
            <th class="center">Guest notes</th>
            <th>Guest tags</th>
            <th>RSRV notes &amp; tags</th>
            <th class="center">
              <button type="button" class="adm-sort" @click="setSort('table')">Table <span class="sort-mark">{{ sortMark('table') }}</span></button>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(r, i) in sorted" :key="r.id">
            <tr v-if="i === nowIndex" class="now-row" aria-hidden="true">
              <td colspan="9"><span class="now-tag">Now {{ nowLabel }}</span></td>
            </tr>
            <tr
              :class="{ 'is-selected': r.id === selectedId, 'is-done': r.status === 'finished' || r.status === 'cancelled' || r.status === 'no_show' }"
              tabindex="0"
              @click="emit('select', r)"
              @keydown.enter.self="emit('select', r)"
            >
              <td class="time-cell">
                <span v-if="showDate" class="time-date">{{ formatDateShort(r.date) }}</span>
                <span class="time-main adm-num">{{ r.time }}</span>
                <span v-if="r.seatedAt" class="time-seated adm-num" title="Seated at">{{ clockTime(r.seatedAt) }}</span>
              </td>
              <td class="name-cell">
                <span class="guest-name">
                  {{ guestName(r) }}
                  <AdminIcon v-if="r.guestVip" name="star" :size="13" class="vip-star" />
                </span>
                <span v-if="r.guestSalutation" class="guest-line">({{ r.guestSalutation }} {{ guestName(r) }})</span>
                <span v-if="r.phone" class="guest-line">{{ r.phone }}</span>
                <span class="guest-ref">{{ staffInitials(r.createdByName) }} - #{{ r.reference }}</span>
              </td>
              <td class="center">
                <AdminStatusSelect kind="pre" compact :status="r.status" @change="s => emit('status', r, s)" />
              </td>
              <td class="center">
                <AdminStatusSelect kind="in" compact :status="r.status" @change="s => emit('status', r, s)" />
              </td>
              <td class="center">
                <span class="guests-box adm-num" :title="`${r.seatedGuests ?? 0} seated of ${r.partySize}`">
                  {{ r.seatedGuests ?? 0 }} / {{ r.partySize }}
                </span>
              </td>
              <td class="center">
                <span v-if="r.guestNotes || r.internalNotes" class="note-bubble" :title="[r.guestNotes, r.internalNotes && `Staff: ${r.internalNotes}`].filter(Boolean).join('\n')">
                  <AdminIcon name="note" :size="16" />
                </span>
                <span v-else class="adm-faint">—</span>
              </td>
              <td>
                <div class="chips">
                  <span v-if="!r.guestVisits && r.guestId" class="adm-chip chip-new">New Guest</span>
                  <span v-for="t in r.guestTags" :key="t" class="adm-chip adm-chip-guest">{{ t }}</span>
                </div>
              </td>
              <td class="notes-cell">
                <div v-if="r.tags.length" class="chips">
                  <span v-for="t in r.tags" :key="t" class="adm-chip">{{ t }}</span>
                </div>
                <p v-if="r.notes" class="note-line" :title="r.notes">{{ r.notes }}</p>
                <span v-if="!r.tags.length && !r.notes" class="adm-faint">—</span>
              </td>
              <td class="table-cell">
                <template v-if="r.tableName">
                  <span class="table-box">{{ r.tableName }}</span>
                  <span class="table-section">{{ r.sectionName }}</span>
                </template>
                <span v-else class="unassigned">Unassigned</span>
              </td>
            </tr>
          </template>
          <tr v-if="nowIndex === sorted.length" class="now-row" aria-hidden="true">
            <td colspan="9"><span class="now-tag">Now {{ nowLabel }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  reservations: AdminReservation[]
  selectedId?: number | null
  showDate?: boolean
  emptyText?: string
  date?: string
}>()
const emit = defineEmits<{
  select: [AdminReservation]
  status: [AdminReservation, ReservationStatus]
}>()

// Today's list gets a "Now" divider between past and upcoming bookings.
const currentMinutes = ref(nowMinutes())
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => { clock = setInterval(() => { currentMinutes.value = nowMinutes() }, 30_000) })
onBeforeUnmount(() => clearInterval(clock))

const nowLabel = computed(() => fromMinutes(currentMinutes.value))
const nowIndex = computed(() => {
  if (props.showDate || props.date !== todayIso() || sortKey.value !== 'time' || sortDir.value !== 1) return -1
  const i = sorted.value.findIndex(r => toMinutes(r.time) > currentMinutes.value)
  return i === -1 ? sorted.value.length : i
})

type SortKey = 'time' | 'name' | 'table'
const sortKey = ref<SortKey>('time')
const sortDir = ref<1 | -1>(1)

function setSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 1 ? -1 : 1
  else {
    sortKey.value = key
    sortDir.value = 1
  }
}

function sortMark(key: SortKey) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 1 ? '↑' : '↓'
}

const sorted = computed(() => {
  const value = (r: AdminReservation) => {
    if (sortKey.value === 'name') return guestName(r).toLowerCase()
    if (sortKey.value === 'table') return r.tableName ?? '￿'
    return `${r.date} ${r.time}`
  }
  return [...props.reservations].sort((a, b) => {
    const va = value(a)
    const vb = value(b)
    const cmp = sortKey.value === 'table' ? va.localeCompare(vb, undefined, { numeric: true }) : va < vb ? -1 : va > vb ? 1 : 0
    return cmp * sortDir.value
  })
})
</script>

<style scoped>
.list-card {
  overflow: hidden;
}

.list-scroll {
  max-height: calc(100vh - 230px);
  min-height: 240px;
  overflow: auto;
}

.adm-table {
  min-width: 1180px;
}

.adm-table td {
  vertical-align: top;
  padding-top: 14px;
  padding-bottom: 14px;
}

.center {
  text-align: center;
}

th.center .adm-sort {
  justify-content: center;
}

.sort-mark {
  font-size: 11px;
  color: var(--adm-faint);
}

.adm-faint {
  color: var(--adm-faint);
}

tr.is-done td {
  background: #F7F6F3;
}

.time-cell {
  white-space: nowrap;
}

.time-cell span {
  display: block;
  line-height: 1.5;
}

.time-main {
  font-size: 14px;
}

.time-seated {
  font-size: 13px;
  color: var(--adm-faint);
}

.time-date {
  font-size: 12px;
  font-weight: 500;
  color: var(--adm-accent-dk);
}

.name-cell {
  min-width: 200px;
}

.name-cell > span {
  display: block;
}

.guest-name {
  display: inline-flex !important;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  white-space: nowrap;
}

.vip-star {
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.guest-line {
  font-size: 13px;
  color: var(--adm-text);
  white-space: nowrap;
}

.guest-ref {
  margin-top: 2px;
  font-size: 12.5px;
  font-style: italic;
  color: var(--adm-muted);
}

.guests-box {
  display: inline-block;
  min-width: 72px;
  padding: 8px 10px;
  border: 1px solid var(--adm-line-strong);
  border-radius: 6px;
  background: var(--adm-surface);
  font-size: 13px;
  color: var(--adm-muted);
}

.note-bubble {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E6EDF4;
  color: var(--adm-primary);
  cursor: help;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip-new {
  background: #3F8F6B;
  color: #fff;
  border-radius: 999px;
  padding: 4px 11px;
}

.notes-cell {
  max-width: 300px;
}

.note-line {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--adm-text);
}

.table-cell {
  width: 110px;
  text-align: center;
  border-left: 1px solid var(--adm-line);
}

.table-box {
  display: block;
  padding: 8px 6px;
  border-radius: 6px;
  background: #E3EAF2;
  color: var(--adm-primary);
  font-size: 15px;
  font-weight: 500;
}

.table-section {
  display: block;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--adm-muted);
}

.unassigned {
  font-size: 12.5px;
  font-style: italic;
  color: var(--adm-muted);
}

.now-row td {
  position: relative;
  height: 0;
  padding: 0 !important;
  border-bottom: 2px solid var(--adm-success);
  cursor: default;
}

.now-row:hover {
  background: none !important;
}

.now-tag {
  position: absolute;
  left: 14px;
  top: -11px;
  z-index: 1;
  padding: 2px 9px;
  border-radius: 4px;
  background: var(--adm-success);
  color: #fff;
  font-size: 11.5px;
  font-weight: 500;
}

.adm-empty p {
  margin: 10px 0 0;
}
</style>
