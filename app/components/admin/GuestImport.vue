<template>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-backdrop" @click="close" />
  </Transition>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-modal gi" role="dialog" aria-modal="true" aria-label="Import guests">
      <header class="adm-panel-head">
        <div>
          <h2 class="gi-title">Import guests</h2>
          <p class="adm-page-sub">Bring over the guest list exported from your previous booking system (Excel .xlsx or .csv).</p>
        </div>
        <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" :disabled="!!busy" @click="close">
          <AdminIcon name="close" />
        </button>
      </header>

      <div class="adm-panel-body">
        <!-- 1. Choose a file -->
        <label
          v-if="!preview && !busy"
          class="gi-drop"
          :class="{ 'is-over': dragging }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
        >
          <AdminIcon name="upload" :size="26" />
          <strong>Choose a file or drag it here</strong>
          <span>Excel (.xlsx) or CSV, up to 10 MB. Nothing is saved until you confirm.</span>
          <input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" @change="onPick">
        </label>
        <p v-if="!preview && !busy" class="gi-sample">
          Making a guest list by hand? <a href="/api/admin/import-samples/guests" download>Download the sample sheet</a> to see the columns and formats.
        </p>

        <p v-if="busy" class="gi-busy">{{ busy === 'import' ? `Importing ${fmt(toImport)} guests…` : 'Reading the file…' }}</p>
        <p v-if="error" class="adm-error">{{ error }}</p>

        <!-- 2. Preview / 3. Done -->
        <template v-if="preview && !busy">
          <div v-if="done" class="gi-done">
            <AdminIcon name="check" :size="22" />
            <div>
              <strong>Import finished</strong>
              <p>{{ fmt(done.created) }} new {{ done.created === 1 ? 'guest' : 'guests' }} added and {{ fmt(done.updated) }} existing {{ done.updated === 1 ? 'profile' : 'profiles' }} filled in.</p>
            </div>
          </div>

          <p class="gi-file">
            <AdminIcon name="file" :size="15" />
            <strong>{{ fileName }}</strong>
            <span>{{ fmt(preview.totalRows) }} rows{{ preview.source !== 'Import' ? ` · exported from ${preview.source}` : '' }}</span>
          </p>

          <div class="gi-counts">
            <div class="gi-count is-new"><strong>{{ fmt(preview.counts.create) }}</strong><span>New guests</span></div>
            <div class="gi-count"><strong>{{ fmt(preview.counts.update) }}</strong><span>Existing guests filled in</span></div>
            <div class="gi-count"><strong>{{ fmt(preview.counts.unchanged) }}</strong><span>Already up to date</span></div>
            <div class="gi-count" :class="{ 'is-warn': preview.counts.skipped }"><strong>{{ fmt(preview.counts.skipped) }}</strong><span>Skipped</span></div>
          </div>

          <ul class="gi-notes">
            <li v-if="preview.counts.withHistory">
              Visit history (visits, no-shows, cancellations, last visit) is kept for {{ fmt(preview.counts.withHistory) }} guests and counted in their profiles.
            </li>
            <li v-if="preview.counts.merged">{{ fmt(preview.counts.merged) }} people listed twice in the file are combined into one guest each.</li>
            <li v-if="preview.counts.update">Existing guests only get missing details filled in and new tags added. Nothing they already have is overwritten.</li>
            <li v-if="droppedTags.length">
              Left out the automatic tags {{ droppedTags.map(([t, n]) => `"${t}" (${fmt(n)})`).join(' and ') }}: the dashboard works out new and returning guests from visits itself.
            </li>
          </ul>

          <details class="gi-more">
            <summary>Columns read from the file ({{ preview.columns.length }})</summary>
            <ul class="gi-cols">
              <li v-for="c in preview.columns" :key="c.header"><span>{{ c.header }}</span> → {{ c.label }}</li>
            </ul>
            <p v-if="preview.ignoredHeaders.length" class="gi-muted">Not imported: {{ preview.ignoredHeaders.join(', ') }}</p>
          </details>

          <details v-if="preview.sample.length" class="gi-more" open>
            <summary>First new guests</summary>
            <div class="gi-table-wrap">
              <table class="adm-table gi-table">
                <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Tags</th><th>Visits</th></tr></thead>
                <tbody>
                  <tr v-for="s in preview.sample" :key="s.row">
                    <td>{{ s.name }}</td>
                    <td class="adm-num">{{ s.phone ?? '—' }}</td>
                    <td>{{ s.email ?? '—' }}</td>
                    <td>{{ s.tags.join(', ') || '—' }}</td>
                    <td class="adm-num">{{ s.visits }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          <details v-if="preview.updates.length" class="gi-more">
            <summary>Existing guests that will be filled in ({{ fmt(preview.counts.update) }})</summary>
            <ul class="gi-issues">
              <li v-for="(u, i) in preview.updates" :key="i"><strong>{{ u.name }}</strong> — {{ u.fields.map(fieldLabel).join(', ') }}</li>
            </ul>
          </details>

          <details v-if="preview.skipped.length" class="gi-more">
            <summary>Skipped rows ({{ fmt(preview.counts.skipped) }})</summary>
            <ul class="gi-issues">
              <li v-for="s in preview.skipped" :key="s.row"><span class="gi-row">Row {{ s.row }}</span> <strong>{{ s.name }}</strong> — {{ s.message }}</li>
            </ul>
          </details>

          <details v-if="preview.warnings.length" class="gi-more">
            <summary>Imported with a note ({{ fmt(preview.warnings.length) }})</summary>
            <ul class="gi-issues">
              <li v-for="w in preview.warnings" :key="w.row"><span class="gi-row">Row {{ w.row }}</span> <strong>{{ w.name }}</strong> — {{ w.message }}</li>
            </ul>
          </details>
        </template>
      </div>

      <footer class="adm-panel-foot">
        <template v-if="done">
          <button type="button" class="adm-btn adm-btn-primary" @click="close">Done</button>
        </template>
        <template v-else>
          <button v-if="preview" type="button" class="adm-btn" :disabled="!!busy" @click="reset">Choose another file</button>
          <button v-else type="button" class="adm-btn" :disabled="!!busy" @click="close">Cancel</button>
          <button v-if="preview" type="button" class="adm-btn adm-btn-primary" :disabled="!!busy || !toImport" @click="runImport">
            <AdminIcon name="upload" :size="16" />
            {{ toImport ? `Import ${fmt(toImport)} ${toImport === 1 ? 'guest' : 'guests'}` : 'Nothing to import' }}
          </button>
        </template>
      </footer>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Issue { row: number, name: string, message: string }
interface ImportSummary {
  totalRows: number
  source: string
  columns: { label: string, header: string }[]
  ignoredHeaders: string[]
  counts: { create: number, update: number, unchanged: number, merged: number, skipped: number, withHistory: number }
  updates: { name: string, fields: string[] }[]
  skipped: Issue[]
  warnings: Issue[]
  droppedTags: Record<string, number>
  sample: { row: number, name: string, phone: string | null, email: string | null, tags: string[], visits: number }[]
  result?: { created: number, updated: number }
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], imported: [] }>()

const file = ref<File | null>(null)
const preview = ref<ImportSummary | null>(null)
const done = ref<ImportSummary['result'] | null>(null)
const busy = ref<'' | 'preview' | 'import'>('')
const error = ref('')
const dragging = ref(false)

const fileName = computed(() => file.value?.name ?? '')
const toImport = computed(() => (preview.value?.counts.create ?? 0) + (preview.value?.counts.update ?? 0))
const droppedTags = computed(() => Object.entries(preview.value?.droppedTags ?? {}))
const fmt = (n: number) => n.toLocaleString('en-GB')

const FIELD_LABELS: Record<string, string> = {
  salutation: 'salutation', lastName: 'last name', email: 'email', phone: 'phone', gender: 'gender',
  notes: 'notes', tags: 'tags', vip: 'VIP', marketingOptIn: 'marketing opt-in', birthDay: 'birthday',
  anniversaryDay: 'anniversary', priorVisits: 'visits', priorNoShows: 'no-shows', priorCancellations: 'cancellations',
  priorLastVisit: 'last visit', membershipId: 'membership', city: 'city', country: 'country'
}
const fieldLabel = (f: string) => FIELD_LABELS[f] ?? null
// Hide the companion fields (birthMonth etc.) that always travel with a shown one.
const shownFields = new Set(Object.keys(FIELD_LABELS))

async function send(mode: 'preview' | 'import') {
  if (!file.value) return null
  const body = new FormData()
  body.append('file', file.value)
  body.append('mode', mode)
  return $fetch<ImportSummary>('/api/admin/guests/import', { method: 'POST', body })
}

async function choose(f: File | undefined) {
  if (!f) return
  file.value = f
  error.value = ''
  busy.value = 'preview'
  try {
    const res = await send('preview')
    if (res) res.updates = res.updates.map(u => ({ ...u, fields: u.fields.filter(x => shownFields.has(x)) }))
    preview.value = res
  } catch (err) {
    error.value = errorMessage(err, 'That file could not be read.')
    file.value = null
  } finally {
    busy.value = ''
  }
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  choose(input.files?.[0])
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  choose(e.dataTransfer?.files?.[0])
}

async function runImport() {
  error.value = ''
  busy.value = 'import'
  try {
    const res = await send('import')
    done.value = res?.result ?? null
    emit('imported')
  } catch (err) {
    error.value = errorMessage(err, 'The import didn\'t finish. Nothing was saved; try again.')
  } finally {
    busy.value = ''
  }
}

function reset() {
  file.value = null
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
.gi {
  width: min(820px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
}

.gi-title {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 600;
  color: var(--adm-heading);
}

.gi-drop {
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
  transition: border-color 0.15s, background 0.15s;
}

.gi-drop strong {
  font-size: 14.5px;
  color: var(--adm-heading);
}

.gi-drop:hover,
.gi-drop.is-over {
  border-color: var(--adm-primary);
  background: var(--adm-primary-50);
}

.gi-drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.gi-busy {
  padding: 30px 0;
  text-align: center;
  color: var(--adm-muted);
}

.gi-done {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--adm-success-line);
  border-radius: var(--adm-radius);
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
}

.gi-done p {
  margin: 2px 0 0;
  color: var(--adm-text-2);
}

.gi-file {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 13.5px;
  color: var(--adm-muted);
}

.gi-file strong {
  color: var(--adm-heading);
  overflow-wrap: anywhere;
}

.gi-counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.gi-count {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.gi-count strong {
  font-size: 22px;
  font-weight: 600;
  color: var(--adm-heading);
}

.gi-count span {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.gi-count.is-new strong {
  color: var(--adm-success-strong);
}

.gi-count.is-warn strong {
  color: var(--adm-accent-dk);
}

.gi-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 14px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--adm-text-2);
}

.gi-more {
  margin-top: 10px;
  padding: 10px 14px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
}

.gi-more summary {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--adm-heading);
  cursor: pointer;
}

.gi-cols {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.gi-cols li {
  padding: 3px 9px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-3);
  font-size: 12px;
  color: var(--adm-text-3);
}

.gi-cols span {
  font-weight: 600;
  color: var(--adm-text-2);
}

.gi-muted {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--adm-muted);
}

.gi-table-wrap {
  margin-top: 10px;
  overflow-x: auto;
}

.gi-table {
  font-size: 12.5px;
}

.gi-issues {
  max-height: 220px;
  margin: 10px 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  font-size: 12.5px;
  color: var(--adm-text-3);
}

.gi-issues li {
  padding: 5px 0;
  border-bottom: 1px solid var(--adm-line);
}

.gi-issues li:last-child {
  border-bottom: none;
}

.gi-row {
  display: inline-block;
  min-width: 64px;
  color: var(--adm-faint);
}

@media (max-width: 640px) {
  .gi-counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gi-sample {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--adm-muted);
}

.gi-sample a {
  color: var(--adm-accent-dk);
  font-weight: 500;
}
</style>
