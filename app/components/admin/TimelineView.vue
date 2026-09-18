<template>
  <div class="adm-card tl-card">
    <div ref="scroller" class="tl-scroll">
      <div class="tl-grid" :style="{ '--cols': slots.length, '--col-w': `${COL_W}px` }">
        <!-- Header -->
        <div class="tl-corner">
          <span>Table</span>
          <span class="adm-muted">Covers booked</span>
        </div>
        <div class="tl-head">
          <div v-for="(slot, i) in slots" :key="slot" class="tl-head-cell" :class="{ hour: slot.endsWith(':00') }">
            <span class="tl-head-time">{{ slot.endsWith(':00') ? formatTime(slot) : `:${slot.slice(3)}` }}</span>
            <span class="tl-head-covers adm-num" :class="{ hot: slotCovers[i]! > 0 }">{{ slotCovers[i] }}</span>
          </div>
          <div v-if="nowX !== null" class="tl-now-tag" :style="{ left: `${nowX}px` }">{{ formatTime(fromMinutes(currentMinutes)) }}</div>
        </div>

        <!-- Unassigned lanes -->
        <div class="tl-group-label">
          Unassigned
          <span class="adm-muted adm-num">{{ unassigned.length }}</span>
        </div>
        <div class="tl-group-fill" />
        <template v-for="(lane, li) in unassignedLanes" :key="`u${li}`">
          <div class="tl-row-label unassigned-label">—</div>
          <div class="tl-track" @dragover.prevent @drop="onDrop($event, null)" @click="onTrackClick($event, null)">
            <TimelineBlock v-for="r in lane" :key="r.id" :r="r" :style="blockStyle(r)" @pick="emit('select', r)" @dragstart="onDragStart" />
          </div>
        </template>

        <!-- Sections & tables -->
        <template v-for="section in sections" :key="section.id">
          <div class="tl-group-label">
            {{ section.name }}
            <span class="adm-muted adm-num">{{ section.tables.length }} tables</span>
          </div>
          <div class="tl-group-fill" />
          <template v-for="t in section.tables" :key="t.id">
            <div class="tl-row-label">
              <span class="tl-table-name"><AdminIcon name="table" :size="14" /> {{ t.name }}</span>
              <span class="adm-muted adm-num">{{ t.minCovers }}–{{ t.maxCovers }}</span>
            </div>
            <div
              class="tl-track"
              :class="{ 'drop-ok': dragging && dragging.partySize <= t.maxCovers }"
              @dragover.prevent
              @drop="onDrop($event, t.id!)"
              @click="onTrackClick($event, t.id!)"
            >
              <TimelineBlock
                v-for="r in byTable[t.id!] ?? []"
                :key="r.id"
                :r="r"
                :conflict="conflicts.has(r.id)"
                :style="blockStyle(r)"
                @pick="emit('select', r)"
                @dragstart="onDragStart"
              />
            </div>
          </template>
        </template>

        <div v-if="nowX !== null" class="tl-now-line" :style="{ left: `calc(var(--label-w) + ${nowX}px)` }" />
      </div>
    </div>
    <p class="tl-hint adm-muted">Drag a booking to move it to another table or time. Click an empty slot to book it.</p>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'

const props = defineProps<{
  reservations: AdminReservation[]
  sections: FloorSection[]
  date: string
  shift: ShiftKey
}>()

const emit = defineEmits<{
  select: [AdminReservation]
  move: [reservation: AdminReservation, tableId: number | null, time: string]
  create: [tableId: number | null, time: string]
}>()

const COL_W = 58
const SLOT = 15

const shiftDef = computed(() => SHIFTS.find(s => s.key === props.shift) ?? SHIFTS[0])
const startMin = computed(() => toMinutes(shiftDef.value.start))
const endMin = computed(() => toMinutes(shiftDef.value.end))
const slots = computed(() => {
  const out: string[] = []
  for (let m = startMin.value; m < endMin.value; m += SLOT) out.push(fromMinutes(m))
  return out
})

// Cancelled and no-show bookings don't hold a table, so they're left off the grid.
const visible = computed(() => props.reservations.filter(r => r.status !== 'cancelled' && r.status !== 'no_show' && r.status !== 'waitlist'))

const byTable = computed(() => {
  const map: Record<number, AdminReservation[]> = {}
  for (const r of visible.value) if (r.tableId) (map[r.tableId] ??= []).push(r)
  return map
})

// Two live bookings overlapping on one table are flagged so the host can move one.
const conflicts = computed(() => {
  const ids = new Set<number>()
  for (const list of Object.values(byTable.value)) {
    const live = list.filter(r => r.status !== 'finished')
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i]!
        const b = live[j]!
        const aS = toMinutes(a.time)
        const bS = toMinutes(b.time)
        if (aS < bS + b.durationMinutes && bS < aS + a.durationMinutes) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
  }
  return ids
})

const unassigned = computed(() => visible.value.filter(r => !r.tableId))

// Greedy lane packing so overlapping unassigned bookings don't stack.
const unassignedLanes = computed(() => {
  const lanes: AdminReservation[][] = []
  const sorted = [...unassigned.value].sort((a, b) => a.time.localeCompare(b.time))
  for (const r of sorted) {
    const start = toMinutes(r.time)
    const lane = lanes.find((l) => {
      const last = l[l.length - 1]!
      return toMinutes(last.time) + last.durationMinutes <= start
    })
    if (lane) lane.push(r)
    else lanes.push([r])
  }
  return lanes.length ? lanes : [[]]
})

const slotCovers = computed(() => slots.value.map((slot) => {
  const m = toMinutes(slot)
  return visible.value
    .filter(r => r.status !== 'finished')
    .filter(r => m >= toMinutes(r.time) && m < toMinutes(r.time) + r.durationMinutes)
    .reduce((n, r) => n + r.partySize, 0)
}))

function blockStyle(r: AdminReservation) {
  const start = toMinutes(r.time)
  const left = ((start - startMin.value) / SLOT) * COL_W
  const width = (r.durationMinutes / SLOT) * COL_W
  return { left: `${left + 2}px`, width: `${width - 4}px` }
}

// ---- Now line ----
const currentMinutes = ref(nowMinutes())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => { currentMinutes.value = nowMinutes() }, 30_000)
  scrollToNow()
})
onBeforeUnmount(() => clearInterval(timer))

const nowX = computed(() => {
  if (props.date !== todayIso()) return null
  const m = currentMinutes.value
  if (m < startMin.value || m >= endMin.value) return null
  return ((m - startMin.value) / SLOT) * COL_W
})

const scroller = ref<HTMLElement | null>(null)
function scrollToNow() {
  if (nowX.value !== null && scroller.value) scroller.value.scrollLeft = Math.max(0, nowX.value - 240)
}
watch(() => [props.date, props.shift], () => nextTick(scrollToNow))

// ---- Drag & drop ----
const dragging = ref<AdminReservation | null>(null)
let grabOffset = 0

function onDragStart(e: DragEvent, r: AdminReservation) {
  dragging.value = r
  grabOffset = e.offsetX
  e.dataTransfer?.setData('text/plain', String(r.id))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function minuteAt(e: MouseEvent, offset = 0) {
  const track = e.currentTarget as HTMLElement
  const x = e.clientX - track.getBoundingClientRect().left - offset
  const slot = Math.round(x / COL_W)
  return Math.min(endMin.value - SLOT, Math.max(startMin.value, startMin.value + slot * SLOT))
}

function onDrop(e: DragEvent, tableId: number | null) {
  const r = dragging.value
  dragging.value = null
  if (!r) return
  const time = fromMinutes(minuteAt(e, grabOffset))
  if (time === r.time && tableId === r.tableId) return
  emit('move', r, tableId, time)
}

function onTrackClick(e: MouseEvent, tableId: number | null) {
  if ((e.target as HTMLElement).closest('.tl-block')) return
  const track = e.currentTarget as HTMLElement
  const x = e.clientX - track.getBoundingClientRect().left
  emit('create', tableId, fromMinutes(startMin.value + Math.floor(x / COL_W) * SLOT))
}

// One booking bar on the grid.
const TimelineBlock = defineComponent({
  props: {
    r: { type: Object as () => AdminReservation, required: true },
    conflict: Boolean
  },
  emits: ['pick', 'dragstart'],
  setup(p, { emit: blockEmit }) {
    return () => {
      const r = p.r
      const color = STATUS_META[r.status].color
      return h('div', {
        class: ['tl-block', { conflict: p.conflict, done: r.status === 'finished' }],
        draggable: r.status !== 'finished',
        title: `${guestName(r)} · ${r.partySize} guests · ${formatTime(r.time)} (${r.durationMinutes} min) · ${STATUS_META[r.status].label}`,
        onClick: () => blockEmit('pick'),
        onDragstart: (e: DragEvent) => blockEmit('dragstart', e, r)
      }, [
        h('span', { class: 'tl-block-party', style: { background: color } }, String(r.partySize)),
        h('span', { class: 'tl-block-body' }, [
          h('span', { class: 'tl-block-name' }, [
            guestName(r),
            r.guestVip ? h('span', { class: 'tl-vip', 'aria-label': 'VIP' }, '★') : null
          ]),
          h('span', { class: 'tl-block-sub' }, `${formatTime(r.time)} · #${r.reference}`)
        ]),
        r.notes || r.tags.length ? h('span', { class: 'tl-block-note', title: [r.tags.join(', '), r.notes].filter(Boolean).join(' — ') }, '✎') : null,
        h('span', { class: 'tl-block-edge', style: { background: color } })
      ])
    }
  }
})
</script>

<style scoped>
.tl-card {
  overflow: hidden;
}

.tl-scroll {
  max-height: calc(100vh - 262px);
  min-height: 320px;
  overflow: auto;
}

.tl-grid {
  --label-w: 150px;
  position: relative;
  display: grid;
  grid-template-columns: var(--label-w) calc(var(--cols) * var(--col-w));
  width: max-content;
}

.tl-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  padding: 10px 12px;
  background: var(--adm-surface-2);
  border-right: 1px solid var(--adm-line);
  border-bottom: 1px solid var(--adm-line-strong);
  font-size: 12px;
  font-weight: 500;
}

.tl-corner .adm-muted {
  font-size: 11px;
  font-weight: 400;
}

.tl-head {
  position: sticky;
  top: 0;
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--col-w));
  background: var(--adm-surface-2);
  border-bottom: 1px solid var(--adm-line-strong);
}

.tl-head-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 6px 8px;
  border-left: 1px solid var(--adm-line);
}

.tl-head-cell.hour {
  border-left-color: var(--adm-line-strong);
}

.tl-head-time {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tl-head-cell:not(.hour) .tl-head-time {
  color: var(--adm-muted);
  font-weight: 400;
}

.tl-head-covers {
  font-size: 11.5px;
  color: var(--adm-faint);
}

.tl-head-covers.hot {
  color: var(--adm-primary);
  font-weight: 500;
}

.tl-now-tag {
  position: absolute;
  bottom: -11px;
  z-index: 6;
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--adm-success);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  transform: translateX(-50%);
  white-space: nowrap;
}

.tl-now-line {
  position: absolute;
  top: 52px;
  bottom: 0;
  z-index: 3;
  width: 2px;
  background: var(--adm-success);
  pointer-events: none;
}

.tl-group-label {
  position: sticky;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  background: #EEEAE3;
  border-right: 1px solid var(--adm-line);
  border-bottom: 1px solid var(--adm-line);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tl-group-label .adm-muted {
  font-size: 11px;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 400;
}

.tl-group-fill {
  background: #EEEAE3;
  border-bottom: 1px solid var(--adm-line);
}

.tl-row-label {
  position: sticky;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 12px;
  background: var(--adm-surface);
  border-right: 1px solid var(--adm-line);
  border-bottom: 1px solid var(--adm-line);
  font-size: 13px;
}

.unassigned-label {
  color: var(--adm-faint);
}

.tl-table-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.tl-track {
  position: relative;
  height: 52px;
  border-bottom: 1px solid var(--adm-line);
  background-image: repeating-linear-gradient(
    to right,
    var(--adm-line) 0 1px,
    transparent 1px var(--col-w)
  );
  cursor: cell;
}

.tl-track.drop-ok {
  background-color: #FBF7EF;
}

.tl-track :deep(.tl-block) {
  position: absolute;
  top: 5px;
  bottom: 5px;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--adm-line-strong);
  border-radius: 6px;
  background: var(--adm-surface);
  box-shadow: var(--adm-shadow);
  cursor: grab;
  transition: box-shadow 0.15s;
}

.tl-track :deep(.tl-block:hover) {
  box-shadow: 0 4px 12px rgba(15, 30, 46, 0.14);
  z-index: 1;
}

.tl-track :deep(.tl-block.conflict) {
  border-color: var(--adm-danger);
  box-shadow: 0 0 0 2px rgba(194, 65, 45, 0.25);
}

.tl-track :deep(.tl-block.done) {
  opacity: 0.55;
  cursor: pointer;
}

.tl-track :deep(.tl-block-party) {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.tl-track :deep(.tl-block-body) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0 8px;
}

.tl-track :deep(.tl-block-name) {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tl-track :deep(.tl-vip) {
  margin-left: 4px;
  color: var(--adm-accent-dk);
}

.tl-track :deep(.tl-block-sub) {
  overflow: hidden;
  font-size: 11.5px;
  color: var(--adm-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tl-track :deep(.tl-block-note) {
  margin: 5px 8px 0 auto;
  font-size: 12px;
  color: var(--adm-muted);
}

.tl-track :deep(.tl-block-edge) {
  flex-shrink: 0;
  width: 4px;
  margin-left: auto;
}

.tl-track :deep(.tl-block-note + .tl-block-edge) {
  margin-left: 0;
}

.tl-hint {
  margin: 0;
  padding: 9px 14px;
  border-top: 1px solid var(--adm-line);
  font-size: 12px;
}
</style>
