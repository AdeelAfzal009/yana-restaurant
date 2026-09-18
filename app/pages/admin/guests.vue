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
          <input v-model="q" type="search" class="adm-input" placeholder="Name, phone, email or tag" aria-label="Search guests">
        </div>
        <div class="adm-seg">
          <button type="button" :class="{ 'is-active': filter === 'all' }" @click="filter = 'all'">All</button>
          <button type="button" :class="{ 'is-active': filter === 'vip' }" @click="filter = 'vip'"><AdminIcon name="star" :size="13" /> VIP</button>
          <button type="button" :class="{ 'is-active': filter === 'regular' }" @click="filter = 'regular'">3+ visits</button>
        </div>
        <button type="button" class="adm-btn adm-btn-icon" title="Export CSV" aria-label="Export CSV" @click="exportCsv">
          <AdminIcon name="download" :size="16" />
        </button>
      </div>
    </div>

    <p v-if="error" class="adm-error">{{ error }}</p>

    <div class="adm-card list-card">
      <div v-if="loading && !guests.length" class="adm-empty">Loading guests…</div>
      <div v-else-if="!filtered.length" class="adm-empty">No guests match.</div>
      <div v-else class="list-scroll">
        <table class="adm-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Contact</th>
              <th class="num">Visits</th>
              <th class="num">Covers</th>
              <th class="num">No-shows</th>
              <th>Last visit</th>
              <th>Next booking</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in filtered" :key="g.id" :class="{ 'is-selected': g.id === openId }" tabindex="0" @click="openGuest(g.id)" @keydown.enter="openGuest(g.id)">
              <td>
                <div class="guest-cell">
                  <span class="avatar" :class="{ vip: g.vip }">{{ initials(g) }}</span>
                  <span class="guest-name">
                    {{ guestName(g) }}
                    <AdminIcon v-if="g.vip" name="star" :size="13" class="vip-star" />
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
              <td>
                <div class="chips">
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
            </div>
          </div>
          <span v-else class="adm-muted">Loading…</span>
          <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="closeGuest">
            <AdminIcon name="close" />
          </button>
        </header>

        <nav v-if="profile" class="g-tabs" role="tablist">
          <button type="button" role="tab" :aria-selected="gTab === 'profile'" :class="{ 'is-active': gTab === 'profile' }" @click="gTab = 'profile'">Profile</button>
          <button type="button" role="tab" :aria-selected="gTab === 'history'" :class="{ 'is-active': gTab === 'history' }" @click="gTab = 'history'">
            Bookings <span class="g-count adm-num">{{ profile.history.length }}</span>
          </button>
        </nav>
        <div v-if="profile" class="adm-panel-body">
          <AdminGuestProfileForm v-if="gTab === 'profile'" :profile="profile" :sections="sections" @saved="onSaved" />
          <template v-else>
            <p v-if="!profile.history.length" class="adm-muted">No bookings yet.</p>
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

const guests = ref<GuestRow[]>([])
const loading = ref(true)
const error = ref('')
const q = ref('')
const filter = ref<'all' | 'vip' | 'regular'>('all')

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
  return true
}))

// ---- Profile ----
const openId = ref<number | null>(null)
const profile = ref<GuestProfile | null>(null)
const gTab = ref<'profile' | 'history'>('profile')
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

function exportCsv() {
  downloadCsv('yana-guests.csv', [
    ['First name', 'Last name', 'Phone', 'Email', 'VIP', 'Visits', 'Covers', 'No-shows', 'Last visit', 'Tags', 'Notes'],
    ...filtered.value.map(g => [
      g.firstName, g.lastName, g.phone, g.email, g.vip ? 'Yes' : '', g.stats?.visits ?? 0, g.stats?.covers ?? 0,
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
  background: #E9E4DA;
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
  background: #FBF4E8;
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
