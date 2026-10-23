<template>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-backdrop" @click="close" />
  </Transition>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-modal bi" role="dialog" aria-modal="true" aria-label="Import bookings">
      <header class="adm-panel-head">
        <div>
          <h2 class="bi-title">Import bookings</h2>
          <p class="adm-page-sub">Bring over past and upcoming bookings from ServMe's reservations report (Excel). You can choose several files, e.g. one per year.</p>
        </div>
        <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" :disabled="!!busy" @click="close">
          <AdminIcon name="close" />
        </button>
      </header>

      <div class="adm-panel-body">
        <label
          v-if="!preview && !busy"
          class="bi-drop"
          :class="{ 'is-over': dragging }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
        >
          <AdminIcon name="upload" :size="26" />
          <strong>Choose files or drag them here</strong>
          <span>ServMe reservations reports (.xlsx). Nothing is saved until you confirm, and no emails are sent to guests.</span>
          <input type="file" accept=".xlsx,.csv" multiple @change="onPick">
        </label>
        <p v-if="!preview && !busy" class="bi-sample">
          Filling a sheet by hand? <a href="/api/admin/import-samples/bookings" download>Download the sample sheet</a> to see the columns and formats.
        </p>

        <p v-if="busy" class="bi-busy">{{ busy === 'import' ? `Importing ${fmt(preview?.counts.create ?? 0)} bookings…` : 'Reading the files…' }}</p>
        <p v-if="error" class="adm-error">{{ error }}</p>

        <template v-if="preview && !busy">
          <div v-if="done" class="bi-done">
            <AdminIcon name="check" :size="22" />
            <div>
              <strong>Import finished</strong>
              <p>{{ fmt(done.created) }} bookings added<template v-if="done.newGuests">, plus {{ fmt(done.newGuests) }} new guest profiles</template>. Reports now include them.</p>
            </div>
          </div>

          <ul class="bi-files">
            <li v-for="f in preview.files" :key="f.name">
              <AdminIcon name="file" :size="15" />
              <strong>{{ f.name }}</strong>
              <span>{{ fmt(f.rows) }} bookings{{ f.period ? ` · ${f.period}` : '' }}</span>
              <span v-if="f.reportTotal !== null" class="bi-check" :class="{ 'is-off': f.reportTotal !== f.rows }">
                {{ f.reportTotal === f.rows ? '✓ matches the report total' : `report says ${fmt(f.reportTotal)}` }}
              </span>
            </li>
          </ul>

          <div class="bi-counts">
            <div class="bi-count is-new"><strong>{{ fmt(preview.counts.create) }}</strong><span>Bookings to add</span></div>
            <div class="bi-count"><strong>{{ fmt(preview.counts.covers) }}</strong><span>Covers</span></div>
            <div class="bi-count"><strong>{{ fmt(preview.counts.alreadyImported) }}</strong><span>Already imported</span></div>
            <div class="bi-count" :class="{ 'is-warn': preview.counts.skipped }"><strong>{{ fmt(preview.counts.skipped) }}</strong><span>Skipped</span></div>
          </div>

          <ul class="bi-notes">
            <li v-if="preview.from">Bookings from {{ formatDateLong(preview.from) }} to {{ formatDateLong(preview.to!) }}.</li>
            <li>
              <template v-for="(s, i) in statusList" :key="s.key">{{ i ? ', ' : '' }}{{ fmt(s.count) }} {{ s.label.toLowerCase() }}</template>.
            </li>
            <li>
              {{ fmt(preview.counts.linkedToExistingGuests) }} linked to guests already here,
              {{ fmt(preview.counts.linkedToNewGuests) }} to {{ fmt(preview.counts.newGuestProfiles) }} new guest profiles,
              {{ fmt(preview.counts.withoutGuest) }} without contact details (mostly walk-ins) stay unlinked.
            </li>
            <li>{{ fmt(preview.counts.onTables) }} placed on your floor plan's tables.<template v-if="unmatched.length"> Not on the floor plan (kept in the booking's staff notes): {{ unmatched.map(([t, n]) => `${t} (${n})`).join(', ') }}.</template></li>
            <li v-if="preview.counts.duplicatesInFiles">{{ fmt(preview.counts.duplicatesInFiles) }} bookings appearing in more than one file are added once.</li>
            <li>Guests whose bookings come in here stop using the totals from the guest book import, so visits aren't counted twice.</li>
          </ul>

          <details v-if="preview.sample.length" class="bi-more" open>
            <summary>First bookings</summary>
            <div class="bi-table-wrap">
              <table class="adm-table bi-table">
                <thead><tr><th>Ref</th><th>Date</th><th>Guest</th><th class="num">Covers</th><th>Status</th><th>Table</th></tr></thead>
                <tbody>
                  <tr v-for="s in preview.sample" :key="s.reference">
                    <td class="adm-num">#{{ s.reference }}</td>
                    <td class="adm-num">{{ formatDateShort(s.date) }} {{ formatTime(s.time) }}</td>
                    <td>{{ s.name }}</td>
                    <td class="num adm-num">{{ s.partySize }}</td>
                    <td>{{ STATUS_META[s.status]?.label ?? s.status }}</td>
                    <td>{{ s.table ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          <details v-if="preview.skipped.length" class="bi-more">
            <summary>Skipped rows ({{ fmt(preview.counts.skipped) }})</summary>
            <ul class="bi-issues">
              <li v-for="s in preview.skipped" :key="`${s.file}-${s.row}`"><span class="bi-row">{{ s.file }} · row {{ s.row }}</span> {{ s.message }}</li>
            </ul>
          </details>
        </template>
      </div>

      <footer class="adm-panel-foot">
        <button v-if="done" type="button" class="adm-btn adm-btn-primary" @click="close">Done</button>
        <template v-else>
          <button v-if="preview" type="button" class="adm-btn" :disabled="!!busy" @click="reset">Choose other files</button>
          <button v-else type="button" class="adm-btn" :disabled="!!busy" @click="close">Cancel</button>
          <button v-if="preview" type="button" class="adm-btn adm-btn-primary" :disabled="!!busy || !preview.counts.create" @click="runImport">
            <AdminIcon name="upload" :size="16" />
            {{ preview.counts.create ? `Import ${fmt(preview.counts.create)} bookings` : 'Nothing new to import' }}
          </button>
        </template>
      </footer>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { STATUS_META } from '#shared/utils/reservation-meta'

interface BookingSummary {
  files: { name: string, period: string | null, rows: number, reportTotal: number | null }[]
  counts: {
    create: number, alreadyImported: number, duplicatesInFiles: number, skipped: number,
    linkedToExistingGuests: number, linkedToNewGuests: number, newGuestProfiles: number, withoutGuest: number,
    walkIns: number, covers: number, onTables: number
  }
  byStatus: Record<string, number>
  from: string | null
  to: string | null
  unmatchedTables: Record<string, number>
  skipped: { file: string, row: number, message: string }[]
  sample: { reference: string, date: string, time: string, name: string, partySize: number, status: keyof typeof STATUS_META, source: string, table: string | null }[]
  result?: { created: number, newGuests: number, guestsLinked: number }
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], imported: [] }>()

const files = ref<File[]>([])
const preview = ref<BookingSummary | null>(null)
const done = ref<BookingSummary['result'] | null>(null)
const busy = ref<'' | 'preview' | 'import'>('')
const error = ref('')
const dragging = ref(false)

const fmt = (n: number) => n.toLocaleString('en-GB')
const unmatched = computed(() => Object.entries(preview.value?.unmatchedTables ?? {}).sort((a, b) => b[1] - a[1]))
const statusList = computed(() => Object.entries(preview.value?.byStatus ?? {})
  .sort((a, b) => b[1] - a[1])
  .map(([key, count]) => ({ key, count, label: STATUS_META[key as keyof typeof STATUS_META]?.label ?? key })))

async function send(mode: 'preview' | 'import') {
  const body = new FormData()
  for (const f of files.value) body.append('file', f)
  body.append('mode', mode)
  return $fetch<BookingSummary>('/api/admin/reservations/import', { method: 'POST', body })
}

async function choose(list: File[]) {
  if (!list.length) return
  files.value = list
  error.value = ''
  busy.value = 'preview'
  try {
    preview.value = await send('preview')
  } catch (err) {
    error.value = errorMessage(err, 'Those files could not be read.')
    files.value = []
  } finally {
    busy.value = ''
  }
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  choose([...(input.files ?? [])])
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  choose([...(e.dataTransfer?.files ?? [])])
}

async function runImport() {
  error.value = ''
  busy.value = 'import'
  try {
    done.value = (await send('import')).result ?? null
    emit('imported')
  } catch (err) {
    error.value = errorMessage(err, 'The import didn\'t finish. Nothing was saved; try again.')
  } finally {
    busy.value = ''
  }
}

function reset() {
  files.value = []
  preview.value = null
  done.value = null
  error.value = ''
}

function close() {
  if (busy.value) return
  reset()
  emit('close')
}
</script>

<style scoped>
.bi {
  width: min(840px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
}

.bi-title {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 600;
  color: var(--adm-heading);
}

.bi-drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 40px 20px;
  border: 2px dashed var(--adm-line-strong);
  border-radius: var(--adm-radius-lg);
  text-align: center;
  color: var(--adm-muted);
  cursor: pointer;
}

.bi-drop strong {
  font-size: 14.5px;
  color: var(--adm-heading);
}

.bi-drop:hover,
.bi-drop.is-over {
  border-color: var(--adm-primary);
  background: var(--adm-primary-50);
}

.bi-drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.bi-busy {
  padding: 30px 0;
  text-align: center;
  color: var(--adm-muted);
}

.bi-done {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--adm-success-line);
  border-radius: var(--adm-radius);
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
}

.bi-done p {
  margin: 2px 0 0;
  color: var(--adm-text-2);
}

.bi-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.bi-files li {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--adm-muted);
}

.bi-files strong {
  color: var(--adm-heading);
}

.bi-check {
  font-size: 12px;
  font-weight: 500;
  color: var(--adm-success-strong);
}

.bi-check.is-off {
  color: var(--adm-accent-dk);
}

.bi-counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.bi-count {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.bi-count strong {
  font-size: 22px;
  font-weight: 600;
  color: var(--adm-heading);
}

.bi-count span {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.bi-count.is-new strong {
  color: var(--adm-success-strong);
}

.bi-count.is-warn strong {
  color: var(--adm-accent-dk);
}

.bi-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 14px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--adm-text-2);
}

.bi-more {
  margin-top: 10px;
  padding: 10px 14px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
}

.bi-more summary {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--adm-heading);
  cursor: pointer;
}

.bi-table-wrap {
  margin-top: 10px;
  overflow-x: auto;
}

.bi-table {
  font-size: 12.5px;
}

.bi-issues {
  max-height: 220px;
  margin: 10px 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  font-size: 12.5px;
  color: var(--adm-text-3);
}

.bi-issues li {
  padding: 5px 0;
  border-bottom: 1px solid var(--adm-line);
}

.bi-row {
  color: var(--adm-faint);
}

@media (max-width: 640px) {
  .bi-counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.bi-sample {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--adm-muted);
}

.bi-sample a {
  color: var(--adm-accent-dk);
  font-weight: 500;
}
</style>
