<template>
  <svg
    ref="svgEl"
    class="floor-svg"
    :class="{ editable }"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    :aria-label="`${section.name} floor plan`"
    @pointermove="onPointerMove"
    @pointerup="endDrag"
    @pointerleave="endDrag"
    @pointerdown.self="emit('select', null)"
  >
    <defs>
      <pattern id="floor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D7DEE8" stroke-width="1" />
      </pattern>
    </defs>
    <rect
      :width="FLOOR_WIDTH"
      :height="FLOOR_HEIGHT"
      :fill="editable ? 'url(#floor-grid)' : 'transparent'"
      @pointerdown="emit('select', null)"
    />

    <!-- Decorations sit under tables so tables stay clickable. -->
    <g
      v-for="(d, i) in section.decor"
      :key="`d${i}`"
      class="decor"
      :class="{ 'is-selected': selectedKey === `d:${i}` }"
      @pointerdown="startDrag($event, `d:${i}`, d)"
    >
      <rect v-if="d.kind === 'wall'" :x="d.x" :y="d.y" :width="d.width" :height="d.height" rx="2" fill="#A2A7AD" />
      <template v-else-if="d.kind === 'bar'">
        <rect :x="d.x" :y="d.y" :width="d.width" :height="d.height" rx="22" fill="#A9AEB4" />
        <text v-if="d.label" :x="d.x + d.width / 2" :y="d.y + d.height / 2 + 5" class="decor-label light">{{ d.label }}</text>
      </template>
      <rect v-else-if="d.kind === 'zone'" :x="d.x" :y="d.y" :width="d.width" :height="d.height" fill="transparent" stroke="#A2A7AD" stroke-width="4" />
      <template v-else-if="d.kind === 'door'">
        <path :d="`M ${d.x} ${d.y} V ${d.y + d.height} H ${d.x + d.width} V ${d.y}`" fill="none" stroke="#A2A7AD" stroke-width="7" />
        <rect :x="d.x" :y="d.y" :width="d.width" :height="d.height" fill="transparent" />
        <text v-if="d.label" :x="d.x + d.width / 2" :y="d.y + d.height + 18" class="decor-label">{{ d.label }}</text>
      </template>
      <g v-else-if="d.kind === 'plant'">
        <rect :x="d.x" :y="d.y" :width="d.width" :height="d.height" fill="transparent" />
        <path
          v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]"
          :key="a"
          :d="leafPath(d)"
          :transform="`rotate(${a} ${d.x + d.width / 2} ${d.y + d.height / 2})`"
          :fill="a % 90 === 0 ? '#2E7D3A' : '#1F5E2A'"
        />
        <circle :cx="d.x + d.width / 2" :cy="d.y + d.height / 2" :r="d.width * 0.1" fill="#3C9A48" />
      </g>
      <text v-else-if="d.kind === 'label'" :x="d.x + d.width / 2" :y="d.y + d.height / 2 + 6" class="decor-label big">{{ d.label || 'Label' }}</text>

      <rect
        v-if="editable && selectedKey === `d:${i}`"
        :x="d.x - 4" :y="d.y - 4" :width="d.width + 8" :height="d.height + 8"
        class="sel-outline"
      />
    </g>

    <g
      v-for="(t, i) in section.tables"
      :key="`t${t.id ?? `new${i}`}`"
      class="table"
      :class="{
        'is-selected': selectedKey === `t:${i}`,
        'is-dim': highlight && t.id != null && !highlight.has(t.id),
        'is-target': highlight && t.id != null && highlight.has(t.id)
      }"
      @pointerdown="startDrag($event, `t:${i}`, t)"
      @click="!editable && emit('tableClick', t)"
    >
      <title>{{ tableTitle(t) }}</title>
      <ellipse
        v-if="t.shape === 'round'"
        :cx="t.x + t.width / 2" :cy="t.y + t.height / 2" :rx="t.width / 2" :ry="t.height / 2"
        :style="tableStyle(t)"
        class="table-body"
      />
      <rect
        v-else
        :x="t.x" :y="t.y" :width="t.width" :height="t.height" rx="6"
        :style="tableStyle(t)"
        class="table-body"
      />
      <text :x="t.x + t.width / 2" :y="t.y + t.height / 2 - 2" class="table-name" :fill="textColor(t)">{{ t.name }}</text>
      <text :x="t.x + t.width / 2" :y="t.y + t.height / 2 + 15" class="table-cap" :fill="textColor(t)">
        {{ stateFor(t)?.occupied ? `${stateFor(t)!.partySize}/${t.maxCovers}` : `(${t.maxCovers})` }}
      </text>

      <template v-if="stateFor(t)">
        <g class="guest-flag">
          <rect :x="t.x + t.width / 2 - 72" :y="t.y - 30" width="144" height="25" rx="4" :fill="stateFor(t)!.occupied ? '#E0ECF7' : '#FFFFFF'" stroke="#C7D3E0" />
          <text :x="t.x + t.width / 2" :y="t.y - 12" class="flag-text">{{ truncate(stateFor(t)!.name, 16) }}</text>
        </g>
        <g>
          <rect :x="t.x + t.width - 8" :y="t.y + t.height / 2 - 12" width="54" height="24" rx="4" :fill="stateFor(t)!.color" />
          <text :x="t.x + t.width + 19" :y="t.y + t.height / 2 + 5" class="time-text">{{ stateFor(t)!.time }}</text>
        </g>
      </template>

      <template v-if="editable && selectedKey === `t:${i}`">
        <rect :x="t.x - 5" :y="t.y - 5" :width="t.width + 10" :height="t.height + 10" class="sel-outline" />
      </template>
    </g>

    <!-- Resize handle for the selected object in the editor. -->
    <rect
      v-if="editable && selectedObject"
      :x="selectedObject.x + selectedObject.width - 7"
      :y="selectedObject.y + selectedObject.height - 7"
      width="14" height="14" rx="3"
      class="resize-handle"
      @pointerdown.stop="startResize($event)"
    />
  </svg>
</template>

<script setup lang="ts">
export interface TableState {
  reservationId: number
  name: string
  time: string
  partySize: number
  color: string
  occupied: boolean
}

type Box = { x: number, y: number, width: number, height: number }

const props = defineProps<{
  section: FloorSection
  states?: Record<number, TableState>
  highlight?: Set<number> | null
  editable?: boolean
  selectedKey?: string | null
}>()

const emit = defineEmits<{
  tableClick: [FloorTable]
  select: [string | null]
  move: [key: string, x: number, y: number]
  resize: [key: string, width: number, height: number]
}>()

const svgEl = ref<SVGSVGElement | null>(null)

// The live view zooms to the drawn area so tables read at a useful size;
// the editor keeps the full canvas so there's room to add things.
const viewBox = computed(() => {
  const boxes: Box[] = [...props.section.tables, ...props.section.decor]
  if (props.editable || !boxes.length) return `0 0 ${FLOOR_WIDTH} ${FLOOR_HEIGHT}`
  const pad = 50
  const minX = Math.max(0, Math.min(...boxes.map(b => b.x)) - pad)
  const minY = Math.max(0, Math.min(...boxes.map(b => b.y)) - pad)
  const maxX = Math.min(FLOOR_WIDTH + pad, Math.max(...boxes.map(b => b.x + b.width)) + pad)
  const maxY = Math.min(FLOOR_HEIGHT + pad, Math.max(...boxes.map(b => b.y + b.height)) + pad)
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
})
const SNAP = 5

function stateFor(t: FloorTable) {
  return t.id != null ? props.states?.[t.id] : undefined
}

function tableStyle(t: FloorTable) {
  const s = stateFor(t)
  if (s?.occupied) return { fill: s.color, stroke: s.color }
  if (s) return { fill: '#FFFFFF', stroke: s.color, strokeWidth: 3 }
  return { fill: props.editable ? '#C9CDD2' : '#FFFFFF', stroke: props.editable ? '#B5BAC0' : '#B9BEC4' }
}

function textColor(t: FloorTable) {
  return stateFor(t)?.occupied ? '#FFFFFF' : '#3A4550'
}

function tableTitle(t: FloorTable) {
  const s = stateFor(t)
  const base = `Table ${t.name} · ${t.minCovers}–${t.maxCovers} covers`
  return s ? `${base}\n${s.name} · ${s.partySize} guests · ${s.time}` : base
}

function truncate(text: string, n: number) {
  return text.length > n ? `${text.slice(0, n - 1)}…` : text
}

function leafPath(d: Box) {
  const cx = d.x + d.width / 2
  const cy = d.y + d.height / 2
  const r = d.width / 2
  return `M ${cx} ${cy} Q ${cx + r * 0.22} ${cy - r * 0.5} ${cx} ${cy - r} Q ${cx - r * 0.22} ${cy - r * 0.5} ${cx} ${cy} Z`
}

const selectedObject = computed<Box | null>(() => {
  const key = props.selectedKey
  if (!key) return null
  const [kind, idx] = key.split(':')
  const list = kind === 't' ? props.section.tables : props.section.decor
  return list[Number(idx)] ?? null
})

// ---- Editor dragging (SVG units, snapped) ----
let drag: { key: string, mode: 'move' | 'resize', startX: number, startY: number, box: Box } | null = null

function toSvgPoint(e: PointerEvent) {
  const svg = svgEl.value!
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  return pt.matrixTransform(svg.getScreenCTM()!.inverse())
}

function startDrag(e: PointerEvent, key: string, box: Box) {
  if (!props.editable) return
  e.stopPropagation()
  emit('select', key)
  const p = toSvgPoint(e)
  drag = { key, mode: 'move', startX: p.x, startY: p.y, box: { ...box } }
  svgEl.value?.setPointerCapture(e.pointerId)
}

function startResize(e: PointerEvent) {
  if (!props.selectedKey || !selectedObject.value) return
  const p = toSvgPoint(e)
  drag = { key: props.selectedKey, mode: 'resize', startX: p.x, startY: p.y, box: { ...selectedObject.value } }
  svgEl.value?.setPointerCapture(e.pointerId)
}

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP
}

function onPointerMove(e: PointerEvent) {
  if (!drag) return
  const p = toSvgPoint(e)
  const dx = p.x - drag.startX
  const dy = p.y - drag.startY
  if (drag.mode === 'move') {
    const x = Math.min(FLOOR_WIDTH - drag.box.width, Math.max(0, snap(drag.box.x + dx)))
    const y = Math.min(FLOOR_HEIGHT - drag.box.height, Math.max(0, snap(drag.box.y + dy)))
    emit('move', drag.key, x, y)
  } else {
    emit('resize', drag.key, Math.max(10, snap(drag.box.width + dx)), Math.max(6, snap(drag.box.height + dy)))
  }
}

function endDrag() {
  drag = null
}
</script>

<style scoped>
.floor-svg {
  display: block;
  overflow: visible;
  width: 100%;
  height: auto;
  user-select: none;
  touch-action: none;
}

.table {
  cursor: pointer;
  transition: opacity 0.15s;
}

.table-body {
  transition: fill 0.2s, stroke 0.2s;
}

.table:hover .table-body {
  filter: brightness(0.97);
}

.table.is-dim {
  opacity: 0.3;
}

.table.is-target .table-body {
  stroke: #D9B690;
  stroke-width: 4;
  stroke-dasharray: 8 5;
}

.editable .table,
.editable .decor {
  cursor: move;
}

.table-name {
  font-family: var(--sans);
  font-size: 19px;
  font-weight: 500;
  text-anchor: middle;
  pointer-events: none;
}

.table-cap {
  font-family: var(--sans);
  font-size: 15px;
  text-anchor: middle;
  pointer-events: none;
}

.flag-text {
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 500;
  fill: #12426D;
  text-anchor: middle;
  pointer-events: none;
}

.time-text {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  fill: #FFFFFF;
  text-anchor: middle;
  pointer-events: none;
}

.decor-label {
  font-family: var(--sans);
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: #6B7480;
  text-anchor: middle;
  pointer-events: none;
}

.decor-label.light {
  fill: #FFFFFF;
}

.decor-label.big {
  font-size: 20px;
}

.sel-outline {
  fill: none;
  stroke: #12426D;
  stroke-width: 2.5;
  stroke-dasharray: 6 4;
  pointer-events: none;
}

.resize-handle {
  fill: #FFFFFF;
  stroke: #12426D;
  stroke-width: 2.5;
  cursor: nwse-resize;
}
</style>
