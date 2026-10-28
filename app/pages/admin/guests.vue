<template>
  <div>
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Guests</h1>
        <p class="adm-page-sub">Every guest who has booked, with their history, preferences and tags.</p>
      </div>
      <div class="head-tools">
        <div class="search">
          <AdminIcon name="search" :size="15" class="search-icon" />
          <input v-model="q" type="search" class="adm-input" placeholder="Name, phone, email, tag or member ID" aria-label="Search guests">
        </div>
        <div class="adm-seg">
          <button type="button" :class="{ 'is-active': filter === 'all' }" @click="filter = 'all'">All</button>
          <button type="button" :class="{ 'is-active': filter === 'vip' }" @click="filter = 'vip'"><AdminIcon name="star" :size="13" /> VIP</button>
          <button type="button" :class="{ 'is-active': filter === 'regular' }" @click="filter = 'regular'">3+ visits</button>
          <button type="button" :class="{ 'is-active': filter === 'honors' }" @click="filter = 'honors'">Yana Honors</button>
        </div>
        <button type="button" class="adm-btn adm-btn-icon" title="Export CSV" aria-label="Export CSV" @click="exportCsv">
          <AdminIcon name="download" :size="16" />
        </button>
        <button v-if="can('guests')" type="button" class="adm-btn" @click="importOpen = true">
          <AdminIcon name="upload" :size="16" /> Import
        </button>
      </div>
    </div>

    <AdminGuestImport :open="importOpen" @close="importOpen = false" @imported="load" />

    <!-- Delete ticked guests -->
    <Transition name="adm-fade">
      <div v-if="confirmOpen" class="adm-backdrop" @click="!deleting && (confirmOpen = false)" />
    </Transition>
    <Transition name="adm-fade">
      <div v-if="confirmOpen" class="adm-modal del-modal" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
        <header class="adm-panel-head">
          <h2 id="del-title" class="del-title">Delete {{ selected.size.toLocaleString() }} {{ selected.size === 1 ? 'guest' : 'guests' }}?</h2>
        </header>
        <div class="adm-panel-body del-body">
          <p>
            {{ selectedRows.slice(0, 5).map(guestName).join(', ') }}<template v-if="selected.size > 5"> and {{ (selected.size - 5).toLocaleString() }} more</template>.
            Their profiles, tags, notes and imported visit history are removed. This can't be undone.
          </p>
          <label v-if="selectedBookings" class="del-check">
            <input v-model="deleteBookings" type="checkbox">
            <span>
              <strong>Also delete their {{ selectedBookings.toLocaleString() }} {{ selectedBookings === 1 ? 'booking' : 'bookings' }}</strong>
              <span>Leave this off to keep the bookings in Reservations and Reports; they just won't be linked to a guest profile any more.</span>
            </span>
          </label>
          <p v-if="deleteError" class="adm-error">{{ deleteError }}</p>
        </div>
        <footer class="adm-panel-foot">
          <button type="button" class="adm-btn" :disabled="deleting" @click="confirmOpen = false">Cancel</button>
          <button type="button" class="adm-btn adm-btn-danger" :disabled="deleting" @click="deleteSelected">
            {{ deleting ? 'Deleting…' : `Delete ${selected.size === 1 ? 'guest' : 'guests'}${deleteBookings && selectedBookings ? ' and bookings' : ''}` }}
          </button>
        </footer>
      </div>
    </Transition>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <p v-if="notice" class="notice">{{ notice }}</p>

    <!-- Actions for the ticked guests -->
    <div v-if="selected.size" class="bulk-bar">
      <span class="bulk-count">{{ selected.size.toLocaleString() }} selected</span>
      <button v-if="!allChecked && filtered.length > selected.size" type="button" class="bulk-link" @click="selectAll">
        Select all {{ filtered.length.toLocaleString() }}
      </button>
      <span class="bulk-spacer" />
      <button type="button" class="adm-btn adm-btn-sm" @click="exportCsv">
        <AdminIcon name="download" :size="15" /> Export
      </button>
      <button v-if="can('guests')" type="button" class="adm-btn adm-btn-sm bulk-delete" @click="confirmOpen = true">
        <AdminIcon name="trash" :size="15" /> Delete
      </button>
      <button type="button" class="adm-btn adm-btn-sm adm-btn-ghost" @click="selected = new Set()">Clear</button>
    </div>

    <div class="adm-card list-card">
      <div v-if="loading && !guests.length" class="adm-empty">Loading guests…</div>
      <div v-else-if="!filtered.length" class="adm-empty">No guests match.</div>
      <div v-else class="list-scroll">
        <table class="adm-table">
          <thead>
            <tr>
              <th class="pick">
                <input
                  type="checkbox"
                  :checked="allChecked"
                  :indeterminate="someChecked && !allChecked"
                  :aria-label="allChecked ? 'Unselect all guests' : 'Select all guests'"
                  @change="toggleAll"
                >
              </th>
              <th>Guest</th>
              <th>Contact</th>
              <th class="num">Visits</th>
              <th class="num">Covers</th>
              <th class="num">No-shows</th>
              <th>Last visit</th>
              <th>Next booking</th>
              <th>Guest since</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in filtered" :key="g.id" :class="{ 'is-selected': g.id === openId, 'is-checked': selected.has(g.id) }" tabindex="0" @click="openGuest(g.id)" @keydown.enter="openGuest(g.id)">
              <td class="pick" @click.stop="toggle(g.id)">
                <input type="checkbox" :checked="selected.has(g.id)" :aria-label="`Select ${guestName(g)}`" @click.stop @change="toggle(g.id)">
              </td>
              <td>
                <div class="guest-cell">
                  <span class="avatar" :class="{ vip: g.vip }">{{ initials(g) }}</span>
                  <span class="guest-name">
                    {{ guestName(g) }}
                    <AdminIcon v-if="g.vip" name="star" :size="13" class="vip-star" />
                    <span v-if="g.honorsTier" class="honors-chip" :class="g.honorsTier" :title="`Yana Honors ${g.honorsNumber}`">{{ HONORS_TIER_LABEL[g.honorsTier] }}</span>
                  </span>
                </div>
              </td>
              <td class="contact">
                <span v-if="g.phone">{{ g.phone }}</span>
                <span v-if="g.email" class="adm-muted">{{ g.email }}</span>
              </td>
              <td class="num adm-num">{{ g.stats?.visits ?? 0 }}</td>
              <td class="num adm-num">{{ g.stats?.covers ?? 0 }}</td>
              <td class="num adm-num" :class="{ warn: (g.stats?.no_shows ?? 0) > 0 }">{{ g.stats?.no_shows ?? 0 }}</td>
              <td class="adm-num">{{ g.stats?.last_visit ? formatDateShort(g.stats.last_visit) : '—' }}</td>
              <td class="adm-num">{{ g.stats?.next_booking ? formatDateShort(g.stats.next_booking) : '—' }}</td>
              <td class="adm-num since">{{ sinceLabel(g.createdAt) }}</td>
              <td>
                <div class="chips">
                  <span class="status-chip" :class="{ returning: (g.stats?.visits ?? 0) >= 2 }">{{ guestStatus(g.stats?.visits ?? 0) }}</span>
                  <span v-for="t in g.tags" :key="t" class="adm-chip adm-chip-guest">{{ t }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Profile drawer -->
    <Transition name="adm-fade">
      <div v-if="openId" class="adm-backdrop" @click="closeGuest" />
    </Transition>
    <Transition name="adm-slide">
      <aside v-if="openId" class="adm-drawer" role="dialog" aria-modal="true" aria-label="Guest profile">
        <header class="adm-panel-head">
          <div v-if="profile" class="head-main">
            <span class="head-avatar" :class="{ vip: profile.vip }">{{ initials(profile) }}</span>
            <div>
              <h2 class="head-name">{{ [profile.salutation, guestName(profile)].filter(Boolean).join(' ') }}</h2>
              <p class="adm-page-sub">{{ [profile.phone, profile.email].filter(Boolean).join(' · ') || 'No contact details' }} · Guest since {{ new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) }}</p>
              <span class="status-chip head-status" :class="{ returning: profileVisits >= 2 }">{{ guestStatus(profileVisits) }}</span>
              <span v-if="profile.honors?.status === 'active'" class="honors-chip head-status" :class="profile.honors.tier">
                Yana Honors {{ HONORS_TIER_LABEL[profile.honors.tier] }}
              </span>
            </div>
          </div>
          <span v-else class="adm-muted">Loading…</span>
          <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="closeGuest">
            <AdminIcon name="close" />
          </button>
        </header>

        <nav v-if="profile" class="g-tabs" role="tablist">
          <button type="button" role="tab" :aria-selected="gTab === 'profile'" :class="{ 'is-active': gTab === 'profile' }" @click="gTab = 'profile'">Profile</button>
          <button type="button" role="tab" :aria-selected="gTab === 'honors'" :class="{ 'is-active': gTab === 'honors' }" @click="gTab = 'honors'">Yana Honors</button>
          <button type="button" role="tab" :aria-selected="gTab === 'history'" :class="{ 'is-active': gTab === 'history' }" @click="gTab = 'history'">
            Bookings <span class="g-count adm-num">{{ profile.history.length }}</span>
          </button>
        </nav>
        <div v-if="profile" class="adm-panel-body">
          <AdminGuestProfileForm v-if="gTab === 'profile'" :profile="profile" :sections="sections" @saved="onSaved" />
          <AdminHonorsPanel v-else-if="gTab === 'honors'" :profile="profile" @changed="onHonorsChanged" />
          <template v-else>
            <p v-if="profile.priorVisits || profile.priorNoShows || profile.priorCancellations" class="prior-note">
              Plus {{ profile.priorVisits + profile.priorNoShows + profile.priorCancellations }} earlier bookings from {{ profile.importedFrom || 'the previous system' }}
              ({{ profile.priorVisits }} seated, {{ profile.priorNoShows }} no-shows, {{ profile.priorCancellations }} cancelled).
              Only these totals came over in the export, so they aren't listed one by one here.
            </p>
            <p v-if="!profile.history.length" class="adm-muted">No bookings in this dashboard yet.</p>
            <div class="history">
              <AdminBookingCard v-for="h in profile.history" :key="h.id" :item="h" />
            </div>
          </template>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { HonorsTier } from '#shared/utils/honors'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Guests · YANA Admin' })

interface GuestRow {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  tags: string[]
  vip: boolean
  notes: string | null
  createdAt: string
  honorsTier: HonorsTier | null
  honorsNumber: string | null
  stats: {
    visits: number
    covers: number
    no_shows: number
    cancellations: number
    bookings: number
    last_visit: string | null
    next_booking: string | null
  } | null
}

const route = useRoute()
const router = useRouter()

// Importing a guest list needs the Guests area, not just Reservations.
const { can } = useAdminAccess()
const importOpen = ref(false)

const guests = ref<GuestRow[]>([])
const loading = ref(true)
const error = ref('')
const q = ref('')
const filter = ref<'all' | 'vip' | 'regular' | 'honors'>('all')

async function load() {
  loading.value = true
  try {
    guests.value = await $fetch<GuestRow[]>('/api/admin/guests', { query: q.value.trim() ? { q: q.value.trim() } : {} })
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err, 'Could not load guests.')
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 250)
})
onMounted(load)

const filtered = computed(() => guests.value.filter((g) => {
  if (filter.value === 'vip') return g.vip
  if (filter.value === 'regular') return (g.stats?.visits ?? 0) >= 3
  if (filter.value === 'honors') return !!g.honorsTier
  return true
}))

// Completed visits for the open profile, bookings here plus imported ones.
const profileVisits = computed(() => {
  const p = profile.value
  if (!p) return 0
  return (p.priorVisits ?? 0) + p.history.filter(h => h.status === 'seated' || h.status === 'finished').length
})

const sinceLabel = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// ---- Ticked guests (export / delete) ----
const selected = ref(new Set<number>())
const allChecked = computed(() => filtered.value.length > 0 && filtered.value.every(g => selected.value.has(g.id)))
const someChecked = computed(() => filtered.value.some(g => selected.value.has(g.id)))
const selectedRows = computed(() => guests.value.filter(g => selected.value.has(g.id)))
const selectedBookings = computed(() => selectedRows.value.reduce((n, g) => n + (g.stats?.bookings ?? 0), 0))

function toggle(id: number) {
  const next = new Set(selected.value)
  if (!next.delete(id)) next.add(id)
  selected.value = next
}

// The header box ticks or unticks every guest currently shown.
function toggleAll() {
  const next = new Set(selected.value)
  if (allChecked.value) filtered.value.forEach(g => next.delete(g.id))
  else filtered.value.forEach(g => next.add(g.id))
  selected.value = next
}

function selectAll() {
  selected.value = new Set([...selected.value, ...filtered.value.map(g => g.id)])
}

// Guests that disappear (deleted, or no longer in the list) drop out of the selection.
watch(guests, (list) => {
  const present = new Set(list.map(g => g.id))
  if ([...selected.value].some(id => !present.has(id))) selected.value = new Set([...selected.value].filter(id => present.has(id)))
})

const confirmOpen = ref(false)
const deleteBookings = ref(false)
const deleting = ref(false)
const deleteError = ref('')
const notice = ref('')

watch(confirmOpen, (open) => {
  if (open) {
    deleteBookings.value = false
    deleteError.value = ''
  }
})

async function deleteSelected() {
  deleting.value = true
  deleteError.value = ''
  try {
    const ids = [...selected.value]
    const res = await $fetch<{ deleted: number, bookingsDeleted: number }>('/api/admin/guests/delete', {
      method: 'POST',
      body: { ids, deleteBookings: deleteBookings.value }
    })
    if (openId.value && ids.includes(openId.value)) closeGuest()
    selected.value = new Set()
    confirmOpen.value = false
    notice.value = `Deleted ${res.deleted.toLocaleString()} ${res.deleted === 1 ? 'guest' : 'guests'}${res.bookingsDeleted ? ` and ${res.bookingsDeleted.toLocaleString()} bookings` : ''}.`
    setTimeout(() => { notice.value = '' }, 6000)
    await load()
  } catch (err) {
    deleteError.value = errorMessage(err, 'Could not delete these guests.')
  } finally {
    deleting.value = false
  }
}

// ---- Profile ----
const openId = ref<number | null>(null)
const profile = ref<GuestProfile | null>(null)
const gTab = ref<'profile' | 'honors' | 'history'>('profile')
const sections = ref<FloorSection[]>([])

onMounted(async () => {
  try {
    sections.value = await $fetch<FloorSection[]>('/api/admin/floor')
  } catch {}
})

async function openGuest(id: number) {
  openId.value = id
  profile.value = null
  gTab.value = 'profile'
  router.replace({ query: { ...route.query, id: String(id) } })
  try {
    profile.value = await $fetch<GuestProfile>(`/api/admin/guests/${id}`)
  } catch (err) {
    error.value = errorMessage(err, 'Could not load that guest.')
    closeGuest()
  }
}

function closeGuest() {
  openId.value = null
  const { id: _id, ...rest } = route.query
  router.replace({ query: rest })
}

onMounted(() => {
  const id = Number(route.query.id)
  if (Number.isInteger(id) && id > 0) openGuest(id)
})

function onSaved(updated: GuestProfile) {
  profile.value = updated
  const row = guests.value.find(g => g.id === updated.id)
  if (row) Object.assign(row, { firstName: updated.firstName, lastName: updated.lastName, email: updated.email, phone: updated.phone, tags: updated.tags, vip: updated.vip, notes: updated.notes })
}

function onHonorsChanged(honors: HonorsCardInfo | null) {
  if (!profile.value) return
  profile.value = { ...profile.value, honors }
  const row = guests.value.find(g => g.id === profile.value!.id)
  if (row) Object.assign(row, { honorsTier: honors?.status === 'active' ? honors.tier : null, honorsNumber: honors?.memberNumber ?? null })
}

// Exports the ticked guests, or everyone shown when nothing is ticked.
function exportCsv() {
  const rows = selected.value.size ? selectedRows.value : filtered.value
  downloadCsv(selected.value.size ? `yana-guests-selected-${rows.length}.csv` : 'yana-guests.csv', [
    ['First name', 'Last name', 'Phone', 'Email', 'VIP', 'Yana Honors', 'Member ID', 'Visits', 'Covers', 'No-shows', 'Last visit', 'Tags', 'Notes'],
    ...rows.map(g => [
      g.firstName, g.lastName, g.phone, g.email, g.vip ? 'Yes' : '', g.honorsTier ? HONORS_TIER_LABEL[g.honorsTier] : '', g.honorsTier ? g.honorsNumber : '',
      g.stats?.visits ?? 0, g.stats?.covers ?? 0,
      g.stats?.no_shows ?? 0, g.stats?.last_visit, g.tags.join('; '), g.notes
    ])
  ])
}
</script>

<style scoped>
.head-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search {
  position: relative;
  width: 280px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--adm-faint);
}

.search .adm-input {
  padding-left: 34px;
}

.adm-error {
  margin-bottom: 14px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.status-chip.returning {
  background: var(--adm-primary-50);
  color: var(--adm-primary);
}

.head-status {
  margin-top: 6px;
}

.honors-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border: 1px solid #D3D8E0;
  border-radius: 999px;
  background: #0F1E2E;
  color: #D3D8E0;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.honors-chip.platinum {
  border-color: #EAB77A;
  background: #EAB77A;
  color: #0F1E2E;
}

.head-status.honors-chip {
  margin-left: 6px;
  padding: 2px 9px;
}

.since {
  white-space: nowrap;
}

.prior-note {
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  font-size: 12.5px;
  color: var(--adm-text-3);
}

.notice {
  margin: 0 0 12px;
  padding: 10px 14px;
  border: 1px solid var(--adm-success-line);
  border-radius: var(--adm-radius);
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
  font-size: 13px;
}

.bulk-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px 12px;
  border: 1px solid var(--adm-primary-100);
  border-radius: var(--adm-radius);
  background: var(--adm-primary-50);
}

.bulk-count {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--adm-primary);
}

.bulk-link {
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--adm-primary);
  text-decoration: underline;
  cursor: pointer;
}

.bulk-spacer {
  flex: 1;
}

.bulk-delete {
  color: var(--adm-danger);
}

th.pick,
td.pick {
  width: 40px;
  padding-right: 0;
  cursor: pointer;
}

.pick input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--adm-primary);
  cursor: pointer;
  vertical-align: middle;
}

tr.is-checked td {
  background: var(--adm-primary-50);
}

.del-modal {
  width: min(480px, calc(100vw - 32px));
}

.del-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--adm-heading);
}

.del-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
  font-size: 13.5px;
  color: var(--adm-text-2);
}

.del-body p {
  margin: 0;
}

.del-check {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  cursor: pointer;
}

.del-check input {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--adm-danger);
}

.del-check strong {
  display: block;
  color: var(--adm-text);
}

.del-check span span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--adm-muted);
}

.list-card {
  overflow: hidden;
}

.list-scroll {
  max-height: calc(100vh - 190px);
  overflow: auto;
}

.adm-table {
  min-width: 960px;
}

.num {
  text-align: center;
}

.warn {
  color: var(--adm-danger);
  font-weight: 500;
}

.guest-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar,
.head-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--adm-warm-100);
  font-size: 12px;
  font-weight: 500;
}

.head-avatar {
  width: 44px;
  height: 44px;
  font-size: 15px;
}

.avatar.vip,
.head-avatar.vip {
  background: var(--adm-accent);
  color: var(--adm-nav);
}

.guest-name {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  white-space: nowrap;
}

.vip-star {
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.contact {
  font-size: 13px;
}

.contact span {
  display: block;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.head-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.head-name {
  margin: 0;
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
}

.adm-drawer {
  width: min(860px, calc(100vw - 48px));
}

.g-tabs {
  display: flex;
  gap: 4px;
  padding: 0 16px;
  border-bottom: 1px solid var(--adm-line);
}

.g-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 12px 10px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  font-family: inherit;
  font-size: 14px;
  color: var(--adm-muted);
  cursor: pointer;
}

.g-tabs button.is-active {
  border-bottom-color: var(--adm-accent);
  color: var(--adm-text);
  font-weight: 500;
}

.g-count {
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid var(--adm-line);
  font-size: 11.5px;
}

.history {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.kpis div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
}

.kpis strong {
  font-size: 20px;
  font-weight: 500;
}

.kpis span {
  font-size: 11.5px;
  color: var(--adm-muted);
}

.vip-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 12px;
  border: 1px solid #EFDFC4;
  border-radius: var(--adm-radius);
  background: var(--adm-warm-50);
  font-size: 13px;
  cursor: pointer;
}

.block-gap {
  margin-top: 16px;
}

.adm-chip-btn {
  padding: 5px 10px;
  font-size: 12.5px;
}

.tag-add {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.tag-add .adm-input {
  height: 30px;
  font-size: 13px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 24px 0 10px;
  font-size: 13px;
  font-weight: 500;
}

.history {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
}

.history li + li {
  border-top: 1px solid var(--adm-line);
}

.history-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: inherit;
  text-decoration: none;
  font-size: 13px;
}

.history-link:hover {
  background: var(--adm-surface-2);
}

.history-date {
  flex-shrink: 0;
  width: 88px;
  font-weight: 500;
  line-height: 1.35;
}

.history-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.history-notes {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
