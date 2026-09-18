<template>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-backdrop" @click="emit('close')" />
  </Transition>
  <Transition name="adm-fade">
    <form v-if="open" class="adm-modal" role="dialog" aria-modal="true" :aria-label="title" @submit.prevent="submit">
      <header class="adm-panel-head">
        <div>
          <h2 class="modal-title">{{ title }}</h2>
          <p class="adm-page-sub">{{ subtitle }}</p>
        </div>
        <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="emit('close')">
          <AdminIcon name="close" />
        </button>
      </header>

      <div class="adm-panel-body">
        <div class="adm-seg mode-seg" role="tablist" aria-label="Booking type">
          <button v-for="m in modes" :key="m.key" type="button" :class="{ 'is-active': mode === m.key }" @click="mode = m.key">
            <AdminIcon :name="m.icon" :size="14" /> {{ m.label }}
          </button>
        </div>

        <!-- Guest lookup -->
        <div class="lookup">
          <label class="adm-field">
            <span class="adm-label">Find existing guest</span>
            <div class="lookup-box">
              <AdminIcon name="search" :size="15" class="lookup-icon" />
              <input v-model="lookup" class="adm-input" placeholder="Search by name, phone or email" autocomplete="off" @input="searchGuests">
            </div>
          </label>
          <ul v-if="matches.length" class="lookup-list">
            <li v-for="g in matches" :key="g.id">
              <button type="button" @click="pickGuest(g)">
                <strong>{{ g.firstName }} {{ g.lastName }}</strong>
                <AdminIcon v-if="g.vip" name="star" :size="12" class="vip-star" />
                <span class="adm-muted">{{ [g.phone, g.email].filter(Boolean).join(' · ') }}</span>
                <span class="adm-muted visits">{{ g.stats?.visits ?? 0 }} visits</span>
              </button>
            </li>
          </ul>
          <p v-if="form.guestId" class="picked">
            <AdminIcon name="check" :size="14" /> Linked to existing guest profile
            <button type="button" class="link-btn" @click="form.guestId = null">Unlink</button>
          </p>
        </div>

        <div class="adm-grid-2">
          <label class="adm-field">
            <span class="adm-label">First name{{ mode === 'walk_in' ? '' : ' *' }}</span>
            <input v-model="form.firstName" class="adm-input" :required="mode !== 'walk_in'" :placeholder="mode === 'walk_in' ? 'Walk-in' : ''">
          </label>
          <label class="adm-field">
            <span class="adm-label">Last name</span>
            <input v-model="form.lastName" class="adm-input">
          </label>
          <label class="adm-field">
            <span class="adm-label">Phone</span>
            <input v-model="form.phone" type="tel" class="adm-input" placeholder="+971 …">
          </label>
          <label class="adm-field">
            <span class="adm-label">Email</span>
            <input v-model="form.email" type="email" class="adm-input">
          </label>
        </div>

        <div class="adm-grid-3 row-gap">
          <label class="adm-field">
            <span class="adm-label">Date *</span>
            <input v-model="form.date" type="date" class="adm-input" required :disabled="mode === 'walk_in'">
          </label>
          <label class="adm-field">
            <span class="adm-label">Time *</span>
            <select v-model="form.time" class="adm-select" required :disabled="mode === 'walk_in'">
              <option v-if="!timeOptions.includes(form.time)" :value="form.time">{{ formatTime(form.time) }}</option>
              <option v-for="t in timeOptions" :key="t" :value="t">{{ formatTime(t) }}</option>
            </select>
          </label>
          <label class="adm-field">
            <span class="adm-label">Guests *</span>
            <input v-model.number="form.partySize" type="number" min="1" max="50" class="adm-input" required>
          </label>
          <label class="adm-field">
            <span class="adm-label">Duration</span>
            <select v-model.number="form.durationMinutes" class="adm-select">
              <option v-for="d in [60, 75, 90, 105, 120, 150, 180]" :key="d" :value="d">{{ d }} min</option>
            </select>
          </label>
          <label class="adm-field span-2">
            <span class="adm-label">Table</span>
            <select v-model="form.tableId" class="adm-select">
              <option :value="null">Assign later</option>
              <optgroup v-for="s in sections" :key="s.id" :label="s.name">
                <option v-for="t in s.tables" :key="t.id" :value="t.id" :disabled="busyTableIds.has(t.id!)">
                  {{ t.name }} · {{ t.minCovers }}–{{ t.maxCovers }}{{ busyTableIds.has(t.id!) ? ' · booked' : form.partySize > t.maxCovers ? ' · too small' : '' }}
                </option>
              </optgroup>
            </select>
          </label>
        </div>

        <div class="row-gap">
          <span class="adm-label">Tags</span>
          <div class="chips">
            <button
              v-for="t in RESERVATION_TAG_PRESETS"
              :key="t"
              type="button"
              class="adm-chip adm-chip-btn"
              :class="{ 'is-on': form.tags.includes(t) }"
              @click="form.tags = form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t]"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <div class="adm-grid-2 row-gap">
          <label class="adm-field">
            <span class="adm-label">Guest request</span>
            <textarea v-model="form.notes" class="adm-textarea" />
          </label>
          <label class="adm-field">
            <span class="adm-label">Internal notes</span>
            <textarea v-model="form.internalNotes" class="adm-textarea" />
          </label>
        </div>

        <p v-if="error" class="adm-error">{{ error }}</p>
      </div>

      <footer class="adm-panel-foot">
        <button type="button" class="adm-btn" @click="emit('close')">Cancel</button>
        <button type="submit" class="adm-btn adm-btn-primary" :disabled="saving">
          {{ saving ? 'Saving…' : submitLabel }}
        </button>
      </footer>
    </form>
  </Transition>
</template>

<script setup lang="ts">
export interface ReservationFormPreset {
  mode?: 'reservation' | 'walk_in' | 'waitlist'
  date?: string
  time?: string
  tableId?: number | null
}

interface GuestMatch {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  vip: boolean
  stats: { visits: number } | null
}

const props = defineProps<{
  open: boolean
  preset: ReservationFormPreset
  sections: FloorSection[]
  reservations: AdminReservation[]
}>()

const emit = defineEmits<{
  close: []
  created: [{ id: number, reference: string, date: string }]
}>()

const modes = [
  { key: 'reservation', label: 'Reservation', icon: 'calendar' },
  { key: 'walk_in', label: 'Walk-in', icon: 'walkin' },
  { key: 'waitlist', label: 'Waitlist', icon: 'clock' }
] as const

type Mode = (typeof modes)[number]['key']
const mode = ref<Mode>('reservation')

function blankForm() {
  return {
    guestId: null as number | null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    date: todayIso(),
    time: '19:00',
    partySize: 2,
    durationMinutes: 90,
    tableId: null as number | null,
    tags: [] as string[],
    notes: '',
    internalNotes: ''
  }
}

const form = ref(blankForm())
const saving = ref(false)
const error = ref('')
const lookup = ref('')
const matches = ref<GuestMatch[]>([])

function nowSlot() {
  return fromMinutes(Math.floor(nowMinutes() / 15) * 15)
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  form.value = blankForm()
  mode.value = props.preset.mode ?? 'reservation'
  if (props.preset.date) form.value.date = props.preset.date
  if (props.preset.time) form.value.time = props.preset.time
  if (props.preset.tableId !== undefined) form.value.tableId = props.preset.tableId
  if (mode.value === 'walk_in') applyWalkIn()
  error.value = ''
  lookup.value = ''
  matches.value = []
})

function applyWalkIn() {
  form.value.date = todayIso()
  form.value.time = nowSlot()
}

watch(mode, (m) => { if (m === 'walk_in') applyWalkIn() })

// Larger parties sit longer.
watch(() => form.value.partySize, (n) => {
  form.value.durationMinutes = n >= 7 ? 150 : n >= 5 ? 120 : 90
})

const title = computed(() => ({ reservation: 'New reservation', walk_in: 'Seat a walk-in', waitlist: 'Add to waitlist' })[mode.value])
const subtitle = computed(() => ({
  reservation: 'Phone or in-person booking, confirmed straight away.',
  walk_in: 'Guest is here now — they’ll be marked as seated.',
  waitlist: 'Hold their place until a table frees up.'
})[mode.value])
const submitLabel = computed(() => ({ reservation: 'Create reservation', walk_in: 'Seat walk-in', waitlist: 'Add to waitlist' })[mode.value])

const timeOptions = computed(() => {
  const out: string[] = []
  for (let m = 9 * 60; m < 24 * 60; m += 15) out.push(fromMinutes(m))
  return out
})

// Tables already holding a live booking that overlaps the chosen slot.
const busyTableIds = computed(() => {
  const start = toMinutes(form.value.time)
  const end = start + form.value.durationMinutes
  return new Set(props.reservations
    .filter(r => r.tableId && r.date === form.value.date && ACTIVE_STATUSES.includes(r.status))
    .filter(r => toMinutes(r.time) < end && start < toMinutes(r.time) + r.durationMinutes)
    .map(r => r.tableId!))
})

let searchTimer: ReturnType<typeof setTimeout> | undefined
function searchGuests() {
  clearTimeout(searchTimer)
  const q = lookup.value.trim()
  if (q.length < 2) {
    matches.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      matches.value = (await $fetch<GuestMatch[]>('/api/admin/guests', { query: { q } })).slice(0, 6)
    } catch {
      matches.value = []
    }
  }, 220)
}

function pickGuest(g: GuestMatch) {
  Object.assign(form.value, {
    guestId: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    phone: g.phone ?? '',
    email: g.email ?? ''
  })
  lookup.value = ''
  matches.value = []
}

async function submit() {
  error.value = ''
  saving.value = true
  const f = form.value
  const status: ReservationStatus = mode.value === 'walk_in' ? 'seated' : mode.value === 'waitlist' ? 'waitlist' : 'confirmed'
  try {
    const created = await $fetch<{ id: number, reference: string }>('/api/admin/reservations', {
      method: 'POST',
      body: {
        ...f,
        firstName: f.firstName.trim() || (mode.value === 'walk_in' ? 'Walk-in' : ''),
        phone: f.phone || null,
        email: f.email || null,
        notes: f.notes || null,
        internalNotes: f.internalNotes || null,
        guestId: f.guestId ?? undefined,
        status,
        source: mode.value === 'walk_in' ? 'walk_in' : 'phone'
      }
    })
    emit('created', { ...created, date: f.date })
  } catch (err) {
    error.value = errorMessage(err, 'Could not save the booking.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
}

.adm-panel-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mode-seg {
  align-self: flex-start;
}

.lookup {
  position: relative;
}

.lookup-box {
  position: relative;
}

.lookup-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--adm-faint);
}

.lookup-box .adm-input {
  padding-left: 34px;
}

.lookup-list {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
  box-shadow: var(--adm-shadow-lg);
}

.lookup-list button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.lookup-list button:hover {
  background: var(--adm-surface-2);
}

.lookup-list strong {
  font-weight: 500;
}

.visits {
  margin-left: auto;
  font-size: 12px;
}

.vip-star {
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.picked {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--adm-success);
}

.link-btn {
  border: 0;
  background: none;
  color: var(--adm-muted);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.span-2 {
  grid-column: span 2;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.adm-chip-btn {
  padding: 5px 10px;
  font-size: 12.5px;
}

@media (max-width: 640px) {
  .span-2 {
    grid-column: auto;
  }
}
</style>
