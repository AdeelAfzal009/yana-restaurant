<template>
  <figure class="chart" :aria-label="label">
    <div class="plot" :style="{ height: `${height}px` }">
      <div class="grid">
        <div v-for="t in ticks" :key="t" class="gridline" :style="{ bottom: `${(t / scaleMax) * 100}%` }">
          <span class="tick adm-num">{{ t.toLocaleString() }}</span>
        </div>
      </div>
      <div class="bars">
        <div
          v-for="(d, i) in data"
          :key="d.label"
          class="col"
          tabindex="0"
          :aria-label="`${d.label}: ${d.value} ${unit}`"
          @mouseenter="hover = i"
          @mouseleave="hover = null"
          @focus="hover = i"
          @blur="hover = null"
        >
          <span v-if="i === peakIndex && d.value > 0" class="peak adm-num" :style="{ bottom: `calc(${(d.value / scaleMax) * 100}% + 4px)` }">{{ d.value }}</span>
          <div class="bar" :class="{ dim: hover !== null && hover !== i }" :style="{ height: `${(d.value / scaleMax) * 100}%`, background: color }" />
          <div v-if="hover === i" class="tip" :class="{ flip: i > data.length * 0.66 }">
            <strong>{{ d.tooltip ?? d.label }}</strong>
            <span class="adm-num">{{ d.value.toLocaleString() }} {{ unit }}</span>
            <span v-if="d.sub" class="adm-muted">{{ d.sub }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="x-axis">
      <span v-for="(d, i) in data" :key="d.label" class="x-label" :class="{ hidden: i % labelEvery !== 0 }">{{ d.label }}</span>
    </div>
    <details class="table-view">
      <summary>View as table</summary>
      <table class="adm-table">
        <thead><tr><th>{{ axisLabel }}</th><th>{{ unit }}</th></tr></thead>
        <tbody>
          <tr v-for="d in data" :key="d.label"><td>{{ d.tooltip ?? d.label }}</td><td class="adm-num">{{ d.value }}</td></tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<script setup lang="ts">
export interface BarDatum {
  label: string
  value: number
  tooltip?: string
  sub?: string
}

const props = withDefaults(defineProps<{
  data: BarDatum[]
  label: string
  unit?: string
  axisLabel?: string
  color?: string
  height?: number
}>(), { unit: 'covers', axisLabel: 'Period', color: '#12426D', height: 220 })

const hover = ref<number | null>(null)

// Clean tick steps (1, 2, 5 × 10ⁿ) so the axis reads in round numbers.
const step = computed(() => {
  const max = Math.max(1, ...props.data.map(d => d.value))
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
})
const scaleMax = computed(() => Math.max(step.value, Math.ceil(Math.max(1, ...props.data.map(d => d.value)) / step.value) * step.value))
const ticks = computed(() => {
  const out: number[] = []
  for (let t = 0; t <= scaleMax.value; t += step.value) out.push(t)
  return out
})

const peakIndex = computed(() => {
  let best = -1
  props.data.forEach((d, i) => { if (best < 0 || d.value > props.data[best]!.value) best = i })
  return best
})

const labelEvery = computed(() => Math.max(1, Math.ceil(props.data.length / 12)))
</script>

<style scoped>
.chart {
  margin: 0;
}

.plot {
  position: relative;
  margin-left: 36px;
}

.grid {
  position: absolute;
  inset: 0;
}

.gridline {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--adm-line);
}

.tick {
  position: absolute;
  right: calc(100% + 8px);
  top: -8px;
  font-size: 11px;
  color: var(--adm-faint);
}

.bars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
}

.col {
  position: relative;
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  outline: none;
  cursor: default;
}

.col:hover,
.col:focus-visible {
  background: rgba(18, 66, 109, 0.04);
}

.bar {
  width: min(24px, 64%);
  border-radius: 4px 4px 0 0;
  transition: opacity 0.15s;
}

.bar.dim {
  opacity: 0.45;
}

.peak {
  position: absolute;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--adm-text);
}

.tip {
  position: absolute;
  bottom: calc(100% - 20px);
  left: 50%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 130px;
  padding: 8px 10px;
  border: 1px solid var(--adm-line);
  border-radius: 6px;
  background: var(--adm-surface);
  box-shadow: 0 6px 20px rgba(15, 30, 46, 0.14);
  font-size: 12px;
  white-space: nowrap;
  transform: translateX(-10%);
  pointer-events: none;
}

.tip.flip {
  transform: translateX(-90%);
}

.tip strong {
  font-weight: 500;
}

.x-axis {
  display: flex;
  margin: 6px 0 0 36px;
  border-top: 1px solid var(--adm-line-strong);
  padding-top: 6px;
}

.x-label {
  flex: 1;
  font-size: 11px;
  color: var(--adm-muted);
  text-align: center;
  white-space: nowrap;
}

.x-label.hidden {
  visibility: hidden;
}

.table-view {
  margin-top: 10px;
  font-size: 12px;
}

.table-view summary {
  color: var(--adm-muted);
  cursor: pointer;
}

.table-view .adm-table {
  margin-top: 8px;
  font-size: 12.5px;
}

.table-view .adm-table tbody tr {
  cursor: default;
}
</style>
