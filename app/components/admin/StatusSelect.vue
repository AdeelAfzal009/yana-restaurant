<template>
  <label class="ss" :class="{ compact, empty: !current }" @click.stop>
    <span class="ss-icon" :style="{ background: current ? STATUS_META[current].color : 'transparent', borderColor: current ? STATUS_META[current].color : 'var(--adm-line-strong)' }">
      <AdminIcon v-if="current" :name="iconFor(current)" :size="compact ? 12 : 13" />
    </span>
    <span class="ss-label">{{ current ? STATUS_META[current].label : emptyLabel }}</span>
    <span class="ss-caret" aria-hidden="true">▾</span>
    <select class="ss-native" :value="current ?? ''" :disabled="disabled" :aria-label="kind === 'pre' ? 'Pre-service status' : 'In-service status'" @change="onChange">
      <option v-if="kind === 'in'" value="">Not arrived</option>
      <option v-for="s in options" :key="s" :value="s">{{ STATUS_META[s].label }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: ReservationStatus
  kind: 'pre' | 'in'
  compact?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [ReservationStatus] }>()

const options = computed(() => props.kind === 'pre' ? PRE_SERVICE_STATUSES : IN_SERVICE_STATUSES)
const current = computed(() => props.kind === 'pre' ? preServiceOf(props.status) : inServiceOf(props.status))
const emptyLabel = 'Not arrived'

function iconFor(s: ReservationStatus) {
  if (s === 'cancelled' || s === 'no_show') return 'close'
  if (s === 'waitlist' || s === 'pending') return 'clock'
  if (s === 'arrived') return 'walkin'
  if (s === 'seated') return 'table'
  if (s === 'finished') return 'logout'
  return 'check'
}

function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  // Clearing the in-service status puts the party back to "expected".
  const next = (value || 'confirmed') as ReservationStatus
  if (next !== props.status) emit('change', next)
}
</script>

<style scoped>
.ss {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
  font-size: 13.5px;
  cursor: pointer;
}

.ss:focus-within {
  border-color: var(--adm-primary);
  box-shadow: 0 0 0 3px rgba(18, 66, 109, 0.12);
}

.ss.compact {
  flex-direction: column;
  gap: 3px;
  width: auto;
  height: auto;
  padding: 4px 6px;
  border-color: transparent;
  background: transparent;
  font-size: 12.5px;
}

.ss.compact:hover {
  border-color: var(--adm-line);
  background: var(--adm-surface);
}

.ss-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1.5px dashed;
  border-radius: 50%;
  color: #fff;
}

.ss:not(.empty) .ss-icon {
  border-style: solid;
}

.ss-label {
  flex: 1;
  white-space: nowrap;
}

.ss.empty .ss-label {
  color: var(--adm-faint);
}

.ss-caret {
  font-size: 11px;
  color: var(--adm-muted);
}

.ss.compact .ss-caret {
  position: absolute;
  top: 6px;
  right: -6px;
}

.ss-native {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
