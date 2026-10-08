<template>
  <div class="lg-page">
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Activity log</h1>
        <p class="adm-page-sub">Who signed in, what changed in the dashboard and on the website, every booking change and every email. Newest first; kept for a year.</p>
      </div>
      <button type="button" class="adm-btn" :disabled="loading" @click="reload">
        <AdminIcon name="history" :size="16" /> Refresh
      </button>
    </div>

    <!-- Last 7 days -->
    <div v-if="summary" class="lg-summary">
      <button type="button" class="adm-card lg-stat" :class="{ 'is-alert': summary.failedSignIns }" @click="jump('signins', true)">
        <span class="lg-stat-num">{{ summary.failedSignIns }}</span>
        <span class="lg-stat-label">Failed sign-ins</span>
      </button>
      <button type="button" class="adm-card lg-stat" :class="{ 'is-alert': summary.failedEmails }" @click="jump('emails', true)">
        <span class="lg-stat-num">{{ summary.failedEmails }}</span>
        <span class="lg-stat-label">Emails that failed</span>
      </button>
      <button type="button" class="adm-card lg-stat" @click="jump('content', false)">
        <span class="lg-stat-num">{{ summary.contentChanges }}</span>
        <span class="lg-stat-label">Website changes</span>
      </button>
      <button type="button" class="adm-card lg-stat" @click="jump('reservations', false)">
        <span class="lg-stat-num">{{ summary.newBookings }}</span>
        <span class="lg-stat-label">New bookings</span>
      </button>
      <p class="lg-summary-note">Last {{ summary.days }} days</p>
    </div>

    <!-- Filters -->
    <div class="lg-filters">
      <div class="lg-cats" role="tablist" aria-label="Show">
        <button
          v-for="c in CATEGORIES"
          :key="c.key"
          type="button"
          role="tab"
          class="lg-cat"
          :class="{ 'is-active': category === c.key }"
          :aria-selected="category === c.key"
          @click="category = c.key"
        >
          {{ c.label }}
        </button>
      </div>
      <div class="lg-filter-row">
        <select v-model="staffId" class="adm-select lg-person" aria-label="Person">
          <option :value="0">Everyone</option>
          <option v-for="p in people" :key="p.id" :value="p.id">{{ p.name }}{{ p.active ? '' : ' (deactivated)' }}</option>
        </select>
        <label class="adm-switch">
          <input v-model="problemsOnly" type="checkbox">
          <span class="adm-switch-track" />
          <span>Problems only</span>
        </label>
      </div>
    </div>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <!-- Timeline -->
    <div class="adm-card lg-card">
      <template v-for="day in days" :key="day.label">
        <h2 class="lg-day">{{ day.label }}</h2>
        <ul class="lg-list">
          <li v-for="e in day.entries" :key="e.key" class="lg-row" :class="`is-${e.tone}`">
            <span class="lg-icon"><AdminIcon :name="CATEGORY_ICON[e.category]" :size="16" /></span>
            <div class="lg-body">
              <p class="lg-line">
                <strong class="lg-who">{{ e.who ?? (e.category === 'emails' ? 'System' : e.category === 'reservations' ? 'Website' : 'Someone') }}</strong>
                <span class="lg-title">{{ lowerFirst(e.title) }}</span>
                <span v-if="e.target" class="lg-target">{{ e.target }}</span>
              </p>
              <p v-for="(d, i) in e.details" :key="i" class="lg-detail">{{ d }}</p>
              <ul v-if="e.changes.length" class="lg-changes">
                <li v-for="(c, i) in e.changes" :key="i">
                  <span class="lg-field">{{ c.field }}</span>
                  <template v-if="c.from !== undefined">
                    <span class="lg-from">{{ show(c.from) }}</span>
                    <span aria-hidden="true">→</span>
                  </template>
                  <span class="lg-to">{{ show(c.to) }}</span>
                </li>
              </ul>
            </div>
            <div class="lg-meta">
              <time :datetime="e.at" :title="new Date(e.at).toLocaleString('en-GB')">{{ clock(e.at) }}</time>
              <span v-if="e.ip" class="lg-ip" title="IP address">{{ e.ip }}</span>
            </div>
          </li>
        </ul>
      </template>

      <p v-if="!loading && !entries.length" class="adm-empty lg-empty">
        Nothing here{{ problemsOnly ? ' — no problems recorded' : '' }}.
      </p>
      <div v-if="nextCursor || loading" class="lg-more">
        <button type="button" class="adm-btn" :disabled="loading" @click="loadMore">
          {{ loading ? 'Loading…' : 'Load older entries' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Activity log · YANA admin' })

type Category = 'signins' | 'users' | 'content' | 'setup' | 'reservations' | 'guests' | 'emails'

interface LogEntry {
  key: string
  at: string
  category: Category
  tone: 'default' | 'success' | 'warning' | 'danger'
  title: string
  who: string | null
  target: string | null
  details: string[]
  changes: { field: string, from?: unknown, to?: unknown }[]
  ip: string | null
}

interface LogsResponse {
  entries: LogEntry[]
  nextCursor: string | null
  summary?: { days: number, failedSignIns: number, contentChanges: number, failedEmails: number, newBookings: number }
  people?: { id: number, name: string, active: boolean }[]
}

const CATEGORIES: { key: Category | '', label: string }[] = [
  { key: '', label: 'Everything' },
  { key: 'signins', label: 'Sign-ins' },
  { key: 'users', label: 'Users & access' },
  { key: 'content', label: 'Website content' },
  { key: 'setup', label: 'Setup' },
  { key: 'reservations', label: 'Bookings' },
  { key: 'guests', label: 'Guests' },
  { key: 'emails', label: 'Emails' }
]

const CATEGORY_ICON = {
  signins: 'key',
  users: 'users',
  content: 'layout',
  setup: 'editor',
  reservations: 'calendar',
  guests: 'guests',
  emails: 'mail'
} as const

const category = ref<Category | ''>('')
const staffId = ref(0)
const problemsOnly = ref(false)

const entries = ref<LogEntry[]>([])
const nextCursor = ref<string | null>(null)
const summary = ref<LogsResponse['summary'] | null>(null)
const people = ref<NonNullable<LogsResponse['people']>>([])
const loading = ref(false)
const error = ref('')

const query = computed(() => ({
  category: category.value || undefined,
  staffId: staffId.value || undefined,
  problems: problemsOnly.value ? '1' : undefined
}))

// First page, rendered on the server.
const { data: first, error: firstError } = await useFetch<LogsResponse>('/api/admin/logs', { query, watch: false })
function apply(res: LogsResponse) {
  entries.value = res.entries
  nextCursor.value = res.nextCursor
  if (res.summary) summary.value = res.summary
  if (res.people) people.value = res.people
}
if (first.value) apply(first.value)
if (firstError.value) error.value = errorMessage(firstError.value, 'Could not load the log.')

async function reload() {
  loading.value = true
  error.value = ''
  try {
    apply(await $fetch<LogsResponse>('/api/admin/logs', { query: query.value }))
  } catch (err) {
    error.value = errorMessage(err, 'Could not load the log.')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!nextCursor.value) return
  loading.value = true
  try {
    const res = await $fetch<LogsResponse>('/api/admin/logs', { query: { ...query.value, cursor: nextCursor.value } })
    entries.value.push(...res.entries)
    nextCursor.value = res.nextCursor
  } catch (err) {
    error.value = errorMessage(err, 'Could not load older entries.')
  } finally {
    loading.value = false
  }
}

watch([category, staffId, problemsOnly], reload)

// The summary cards jump straight to what they count.
function jump(to: Category, problems: boolean) {
  category.value = to
  problemsOnly.value = problems
}

// Entries grouped under Today / Yesterday / the date.
const days = computed(() => {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86_400_000).toDateString()
  const groups: { label: string, entries: LogEntry[] }[] = []
  for (const e of entries.value) {
    const d = new Date(e.at)
    const key = d.toDateString()
    const label = key === today ? 'Today' : key === yesterday ? 'Yesterday' : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    if (last?.label === label) last.entries.push(e)
    else groups.push({ label, entries: [e] })
  }
  return groups
})

const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

// Values from change lists in words: no_show → No show, [] → —.
function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.length ? value.map(show).join(', ') : '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const text = String(value)
  return /^[a-z]+(_[a-z]+)*$/.test(text) ? (text.charAt(0).toUpperCase() + text.slice(1)).replace(/_/g, ' ') : text
}
</script>

<style scoped>
.lg-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.lg-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid var(--adm-line);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.lg-stat:hover {
  border-color: var(--adm-line-strong);
  box-shadow: var(--adm-shadow-md);
}

.lg-stat-num {
  font-size: 22px;
  font-weight: 600;
  color: var(--adm-heading);
}

.lg-stat.is-alert .lg-stat-num {
  color: var(--adm-danger);
}

.lg-stat-label {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.lg-summary-note {
  grid-column: 1 / -1;
  margin: -4px 0 0;
  font-size: 12px;
  color: var(--adm-faint);
}

.lg-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.lg-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lg-cat {
  padding: 6px 12px;
  border: 1px solid var(--adm-line-strong);
  border-radius: 999px;
  background: var(--adm-surface);
  font-family: inherit;
  font-size: 13px;
  color: var(--adm-text-3);
  cursor: pointer;
}

.lg-cat:hover {
  color: var(--adm-heading);
}

.lg-cat.is-active {
  border-color: var(--adm-primary);
  background: var(--adm-primary-50);
  color: var(--adm-primary);
  font-weight: 600;
}

.lg-filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lg-person {
  width: 200px;
}

.lg-card {
  padding: 6px 20px 12px;
}

.lg-day {
  margin: 14px 0 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--adm-faint);
}

.lg-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lg-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--adm-line);
}

.lg-list li:last-child {
  border-bottom: none;
}

.lg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--adm-surface-3);
  color: var(--adm-text-3);
}

.lg-row.is-success .lg-icon {
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
}

.lg-row.is-warning .lg-icon {
  background: var(--adm-warm-50);
  color: var(--adm-accent-dk);
}

.lg-row.is-danger .lg-icon {
  background: var(--adm-danger-bg);
  color: var(--adm-danger);
}

.lg-row.is-danger .lg-title {
  color: var(--adm-danger-strong);
  font-weight: 500;
}

.lg-body {
  min-width: 0;
}

.lg-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 6px;
  margin: 6px 0 0;
  font-size: 13.5px;
  color: var(--adm-text-2);
}

.lg-who {
  font-weight: 600;
  color: var(--adm-heading);
}

.lg-target {
  font-weight: 500;
  color: var(--adm-text);
}

.lg-detail {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--adm-muted);
  overflow-wrap: anywhere;
}

.lg-changes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.lg-changes li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
  font-size: 12px;
  color: var(--adm-text-3);
}

.lg-field {
  font-weight: 600;
  color: var(--adm-text-2);
}

.lg-from {
  text-decoration: line-through;
  color: var(--adm-faint);
}

.lg-to {
  color: var(--adm-text);
}

.lg-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding-top: 6px;
  font-size: 12.5px;
  color: var(--adm-muted);
  white-space: nowrap;
}

.lg-ip {
  font-size: 11.5px;
  color: var(--adm-faint);
}

.lg-empty {
  padding: 28px 0;
}

.lg-more {
  display: flex;
  justify-content: center;
  padding: 14px 0 6px;
}

@media (max-width: 900px) {
  .lg-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lg-card {
    padding: 4px 14px 10px;
  }

  .lg-row {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .lg-meta {
    grid-column: 2;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding-top: 0;
  }

  .lg-filter-row {
    width: 100%;
    justify-content: space-between;
  }

  .lg-person {
    flex: 1;
    width: auto;
  }
}
</style>
