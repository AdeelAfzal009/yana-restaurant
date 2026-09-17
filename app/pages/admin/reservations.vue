<template>
  <div>
    <div class="toolbar">
      <h1 class="page-title">Reservations</h1>
      <div class="filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input v-model="dateFilter" type="date" class="filter-select">
        <button v-if="dateFilter" type="button" class="clear-btn" @click="dateFilter = ''">Clear date</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-num">{{ reservations.length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ countByStatus.pending }}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ countByStatus.confirmed }}</span>
        <span class="stat-label">Confirmed</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ countByStatus.cancelled }}</span>
        <span class="stat-label">Cancelled</span>
      </div>
    </div>

    <p v-if="loading" class="empty-note">Loading reservations…</p>
    <p v-else-if="error" class="empty-note error">{{ error }}</p>
    <p v-else-if="filteredReservations.length === 0" class="empty-note">No reservations match these filters.</p>

    <div v-else class="table-wrap">
      <table class="res-table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Date &amp; time</th>
            <th>Guest</th>
            <th>Party</th>
            <th>Contact</th>
            <th>Notes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredReservations" :key="r.id">
            <td>#{{ r.reference }}</td>
            <td>{{ r.date }} · {{ r.time }}</td>
            <td>{{ r.firstName }} {{ r.lastName }}</td>
            <td>{{ r.partySize }}</td>
            <td>
              <a :href="`mailto:${r.email}`">{{ r.email }}</a><br>
              <a :href="`tel:${r.phone}`">{{ r.phone }}</a>
            </td>
            <td class="notes-cell">{{ r.notes || '—' }}</td>
            <td>
              <select class="status-select" :class="`status-${r.status}`" :value="r.status" @change="updateStatus(r, ($event.target as HTMLSelectElement).value)">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface Reservation {
  id: number
  reference: string
  date: string
  time: string
  partySize: number
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

const reservations = ref<Reservation[]>([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('all')
const dateFilter = ref('')

onMounted(loadReservations)

async function loadReservations() {
  loading.value = true
  error.value = ''
  try {
    reservations.value = await $fetch<Reservation[]>('/api/reservations')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not load reservations.'
  } finally {
    loading.value = false
  }
}

const filteredReservations = computed(() => {
  return reservations.value.filter((r) => {
    if (statusFilter.value !== 'all' && r.status !== statusFilter.value) return false
    if (dateFilter.value && r.date !== dateFilter.value) return false
    return true
  })
})

const countByStatus = computed(() => ({
  pending: reservations.value.filter(r => r.status === 'pending').length,
  confirmed: reservations.value.filter(r => r.status === 'confirmed').length,
  cancelled: reservations.value.filter(r => r.status === 'cancelled').length
}))

async function updateStatus(reservation: Reservation, status: string) {
  const previous = reservation.status
  reservation.status = status as Reservation['status']
  try {
    await $fetch(`/api/reservations/${reservation.id}`, { method: 'PATCH', body: { status } })
  } catch {
    reservation.status = previous
    error.value = 'Could not update status. Please try again.'
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--serif);
  font-size: 30px;
  margin: 0;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid rgba(15, 30, 46, 0.18);
  background: #ffffff;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink);
}

.clear-btn {
  border: none;
  background: none;
  color: var(--gold-dk);
  font-size: 12.5px;
  cursor: pointer;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card {
  background: #ffffff;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 3px solid var(--gold);
}

.stat-num {
  font-family: var(--serif);
  font-size: 28px;
  color: var(--ink);
}

.stat-label {
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

.empty-note {
  background: #ffffff;
  padding: 32px;
  text-align: center;
  color: var(--ink-dim);
  font-size: 14px;
}

.empty-note.error {
  color: #b3432f;
}

.table-wrap {
  background: #ffffff;
  overflow-x: auto;
}

.res-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  min-width: 760px;
}

.res-table th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-dim);
  padding: 14px 16px;
  border-bottom: 1px solid rgba(15, 30, 46, 0.12);
  white-space: nowrap;
}

.res-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(15, 30, 46, 0.08);
  vertical-align: top;
  color: var(--ink);
}

.res-table a {
  color: var(--ink);
  text-decoration: none;
  font-size: 12.5px;
}

.res-table a:hover {
  color: var(--gold-dk);
}

.notes-cell {
  max-width: 220px;
  color: var(--ink-dim);
}

.status-select {
  padding: 7px 10px;
  border: 1px solid rgba(15, 30, 46, 0.18);
  font-size: 12.5px;
  font-family: var(--sans);
  cursor: pointer;
  background: #fff;
}

.status-pending {
  color: #8a6b45;
}

.status-confirmed {
  color: #2f7a4f;
}

.status-cancelled {
  color: #b3432f;
}
</style>
