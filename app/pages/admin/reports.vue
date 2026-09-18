<template>
  <div>
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Summary report</h1>
        <p class="adm-page-sub">{{ formatDateLong(from) }} – {{ formatDateLong(to) }}</p>
      </div>
      <button type="button" class="adm-btn" @click="exportCsv">
        <AdminIcon name="download" :size="15" /> Export CSV
      </button>
    </div>

    <div class="filters adm-card">
      <div class="adm-seg">
        <button v-for="p in presets" :key="p.key" type="button" :class="{ 'is-active': preset === p.key }" @click="applyPreset(p.key)">{{ p.label }}</button>
      </div>
      <label class="range">
        <input v-model="from" type="date" class="adm-input" aria-label="From date" @change="preset = 'custom'">
        <span class="adm-muted">to</span>
        <input v-model="to" type="date" class="adm-input" aria-label="To date" @change="preset = 'custom'">
      </label>
      <select v-model="shift" class="adm-select shift" aria-label="Shift">
        <option v-for="s in SHIFTS" :key="s.key" :value="s.key">{{ s.key === 'all' ? 'All shifts' : s.label }}</option>
      </select>
    </div>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <div class="kpis">
      <div v-for="k in kpis" :key="k.label" class="adm-card kpi">
        <span class="kpi-label"><AdminIcon :name="k.icon" :size="15" /> {{ k.label }}</span>
        <span class="kpi-value">{{ k.value }}</span>
        <span v-if="k.sub" class="kpi-sub">{{ k.sub }}</span>
      </div>
    </div>

    <div class="charts">
      <section class="adm-card chart-card wide">
        <header class="chart-head">
          <h2>Covers by day</h2>
          <p class="adm-muted">Guests seated or booked, excluding cancellations and no-shows</p>
        </header>
        <AdminBarChart :data="byDay" label="Covers by day" axis-label="Date" />
      </section>

      <section class="adm-card chart-card">
        <header class="chart-head">
          <h2>Busiest hours</h2>
          <p class="adm-muted">Covers by booking time across the period</p>
        </header>
        <AdminBarChart :data="byHour" label="Covers by hour" axis-label="Hour" :height="200" />
      </section>

      <section class="adm-card chart-card">
        <header class="chart-head">
          <h2>Booking channels</h2>
          <p class="adm-muted">Where reservations came from</p>
        </header>
        <ul class="hbars">
          <li v-for="s in bySource" :key="s.label">
            <span class="hbar-label">{{ s.label }}</span>
            <span class="hbar-track"><span class="hbar-fill" :style="{ width: `${s.pct}%` }" /></span>
            <span class="hbar-value adm-num">{{ s.value }} <span class="adm-muted">· {{ s.pct }}%</span></span>
          </li>
        </ul>

        <h3 class="sub-head">Outcomes</h3>
        <ul class="hbars">
          <li v-for="s in byStatus" :key="s.status">
            <span class="hbar-label"><span class="adm-dot" :style="{ background: STATUS_META[s.status].color }" /> {{ STATUS_META[s.status].label }}</span>
            <span class="hbar-track"><span class="hbar-fill neutral" :style="{ width: `${s.pct}%` }" /></span>
            <span class="hbar-value adm-num">{{ s.value }} <span class="adm-muted">· {{ s.pct }}%</span></span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BarDatum } from '~/components/admin/BarChart.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Reports · YANA Admin' })

interface Row {
  date: string
  hour: number
  status: ReservationStatus
  source: ReservationSource
  reservations: number
  covers: number
}

const presets = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' }
] as const
type PresetKey = (typeof presets)[number]['key'] | 'custom'

const preset = ref<PresetKey>('7d')
const from = ref(addDays(todayIso(), -6))
const to = ref(todayIso())
const shift = ref<ShiftKey>('all')

function applyPreset(key: PresetKey) {
  preset.value = key
  const today = todayIso()
  to.value = today
  if (key === 'today') from.value = today
  if (key === '7d') from.value = addDays(today, -6)
  if (key === '30d') from.value = addDays(today, -29)
  if (key === 'month') from.value = `${today.slice(0, 8)}01`
}

const rows = ref<Row[]>([])
const error = ref('')

async function load() {
  if (!from.value || !to.value) return
  try {
    const res = await $fetch<{ rows: Row[] }>('/api/admin/reports/summary', { query: { from: from.value, to: to.value, shift: shift.value } })
    rows.value = res.rows
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err, 'Could not load the report.')
  }
}

watch([from, to, shift], load)
onMounted(load)

const LOST: ReservationStatus[] = ['cancelled', 'no_show']
const SEATED: ReservationStatus[] = ['seated', 'finished']

const sum = (list: Row[], key: 'reservations' | 'covers') => list.reduce((n, r) => n + r[key], 0)

const kpis = computed(() => {
  const booked = rows.value.filter(r => r.status !== 'waitlist')
  const kept = booked.filter(r => !LOST.includes(r.status))
  const seated = booked.filter(r => SEATED.includes(r.status))
  const cancelled = booked.filter(r => r.status === 'cancelled')
  const noShows = booked.filter(r => r.status === 'no_show')
  const walkIns = booked.filter(r => r.source === 'walk_in')
  const totalRes = sum(booked, 'reservations')
  const pct = (n: number) => (totalRes ? `${Math.round((n / totalRes) * 100)}% of bookings` : '')
  return [
    { label: 'Reservations', icon: 'calendar', value: totalRes.toLocaleString(), sub: `${sum(kept, 'reservations')} kept` },
    { label: 'Covers', icon: 'users', value: sum(kept, 'covers').toLocaleString(), sub: `avg party ${sum(kept, 'reservations') ? (sum(kept, 'covers') / sum(kept, 'reservations')).toFixed(1) : '0'}` },
    { label: 'Seated covers', icon: 'check', value: sum(seated, 'covers').toLocaleString(), sub: `${sum(seated, 'reservations')} tables` },
    { label: 'Walk-ins', icon: 'walkin', value: sum(walkIns, 'reservations').toLocaleString(), sub: `${sum(walkIns, 'covers')} covers` },
    { label: 'Cancellations', icon: 'close', value: sum(cancelled, 'reservations').toLocaleString(), sub: pct(sum(cancelled, 'reservations')) },
    { label: 'No-shows', icon: 'alert', value: sum(noShows, 'reservations').toLocaleString(), sub: pct(sum(noShows, 'reservations')) }
  ] as const
})

const byDay = computed<BarDatum[]>(() => {
  const days: BarDatum[] = []
  if (!from.value || !to.value || from.value > to.value) return days
  for (let d = from.value; d <= to.value && days.length < 370; d = addDays(d, 1)) {
    const list = rows.value.filter(r => r.date === d && r.status !== 'waitlist' && !LOST.includes(r.status))
    days.push({
      label: formatDateShort(d),
      tooltip: formatDateLong(d),
      value: sum(list, 'covers'),
      sub: `${sum(list, 'reservations')} reservations`
    })
  }
  return days
})

const byHour = computed<BarDatum[]>(() => {
  const def = SHIFTS.find(s => s.key === shift.value)!
  const out: BarDatum[] = []
  for (let h = toMinutes(def.start) / 60; h < toMinutes(def.end) / 60; h++) {
    const list = rows.value.filter(r => r.hour === h && r.status !== 'waitlist' && !LOST.includes(r.status))
    const label = formatTime(fromMinutes(h * 60)).replace(':00', '')
    out.push({ label, tooltip: `${label} – ${formatTime(fromMinutes((h + 1) * 60)).replace(':00', '')}`, value: sum(list, 'covers'), sub: `${sum(list, 'reservations')} reservations` })
  }
  return out
})

const bySource = computed(() => {
  const total = sum(rows.value, 'reservations')
  return RESERVATION_SOURCES.map((s) => {
    const value = sum(rows.value.filter(r => r.source === s), 'reservations')
    return { label: SOURCE_LABELS[s], value, pct: total ? Math.round((value / total) * 100) : 0 }
  }).sort((a, b) => b.value - a.value)
})

const byStatus = computed(() => {
  const total = sum(rows.value, 'reservations')
  return RESERVATION_STATUSES.map((status) => {
    const value = sum(rows.value.filter(r => r.status === status), 'reservations')
    return { status, value, pct: total ? Math.round((value / total) * 100) : 0 }
  }).filter(s => s.value > 0)
})

function exportCsv() {
  downloadCsv(`yana-report-${from.value}-to-${to.value}.csv`, [
    ['Date', 'Hour', 'Status', 'Source', 'Reservations', 'Covers'],
    ...rows.value
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
      .map(r => [r.date, `${String(r.hour).padStart(2, '0')}:00`, STATUS_META[r.status].label, SOURCE_LABELS[r.source], r.reservations, r.covers])
  ])
}
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
}

.range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range .adm-input {
  width: 150px;
}

.shift {
  width: auto;
}

.adm-error {
  margin-bottom: 16px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
}

.kpi-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--adm-muted);
}

.kpi-value {
  font-size: 28px;
  font-weight: 500;
  line-height: 1.1;
}

.kpi-sub {
  font-size: 12px;
  color: var(--adm-faint);
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  padding: 16px 18px 18px;
}

.chart-card.wide {
  grid-column: 1 / -1;
}

.chart-head {
  margin-bottom: 20px;
}

.chart-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.chart-head p {
  margin: 3px 0 0;
  font-size: 12.5px;
}

.sub-head {
  margin: 22px 0 10px;
  font-size: 13px;
  font-weight: 500;
}

.hbars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hbars li {
  display: grid;
  grid-template-columns: 120px 1fr 90px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.hbar-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hbar-track {
  height: 10px;
  border-radius: 5px;
  background: #EEF1F4;
  overflow: hidden;
}

.hbar-fill {
  display: block;
  height: 100%;
  border-radius: 5px;
  background: var(--adm-primary);
}

.hbar-fill.neutral {
  background: #8A97A5;
}

.hbar-value {
  text-align: right;
}

@media (max-width: 960px) {
  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
