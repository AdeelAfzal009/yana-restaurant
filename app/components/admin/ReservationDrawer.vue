<template>
  <Transition name="adm-fade">
    <div v-if="reservation" class="adm-backdrop" @click="emit('close')" />
  </Transition>
  <Transition name="adm-slide">
    <aside v-if="reservation && form" class="adm-drawer rd" role="dialog" aria-modal="true" :aria-label="`Reservation for ${guestName(reservation)}`">
      <!-- Header -->
      <header class="rd-head">
        <span class="rd-avatar" :class="{ vip: reservation.guestVip }">{{ initials(reservation) }}</span>
        <div class="rd-who">
          <h2 class="rd-name">
            {{ fullName }}
            <AdminIcon v-if="reservation.guestVip" name="star" :size="16" class="vip-star" />
          </h2>
          <p class="rd-phone">{{ reservation.phone || reservation.email || 'No contact details' }}</p>
          <div class="rd-chips">
            <span v-if="!reservation.guestVisits" class="rd-chip new">New Guest</span>
            <span v-else class="rd-chip">{{ reservation.guestVisits }} {{ reservation.guestVisits === 1 ? 'visit' : 'visits' }}</span>
            <span v-for="t in reservation.guestTags" :key="t" class="rd-chip">{{ t }}</span>
          </div>
        </div>
        <button type="button" class="rd-close" aria-label="Close" @click="emit('close')">
          <AdminIcon name="close" :size="22" />
        </button>
      </header>

      <nav class="rd-tabs" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          :class="{ 'is-active': tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.label }}<span v-if="t.count !== undefined" class="rd-tab-count adm-num">{{ t.count }}</span>
        </button>
      </nav>

      <!-- Reservation -->
      <template v-if="tab === 'reservation'">
        <div class="rd-body rd-split">
          <div class="rd-main">
            <p v-if="error" class="adm-error">{{ error }}</p>

            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="field-label">First name</span>
                <input v-model="form.firstName" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="field-label">Last name</span>
                <input v-model="form.lastName" class="adm-input">
              </label>
            </div>

            <div class="adm-grid-2">
              <div class="adm-field">
                <span class="field-label">Pre-service status</span>
                <AdminStatusSelect kind="pre" :status="reservation.status" :disabled="busy" @change="setStatus" />
              </div>
              <div class="adm-field">
                <span class="field-label">In-service status</span>
                <AdminStatusSelect kind="in" :status="reservation.status" :disabled="busy" @change="setStatus" />
              </div>
            </div>

            <div class="adm-grid-2">
              <div class="adm-field">
                <span class="field-label">Seated guests</span>
                <div class="stepper">
                  <span class="stepper-value adm-num">{{ form.seatedGuests ?? 0 }} <span class="adm-muted">/ {{ form.partySize }}</span></span>
                  <button type="button" aria-label="One fewer seated guest" :disabled="(form.seatedGuests ?? 0) <= 0" @click="form.seatedGuests = Math.max(0, (form.seatedGuests ?? 0) - 1)">−</button>
                  <button type="button" aria-label="One more seated guest" :disabled="(form.seatedGuests ?? 0) >= 50" @click="form.seatedGuests = (form.seatedGuests ?? 0) + 1">+</button>
                </div>
              </div>
              <label class="adm-field">
                <span class="field-label">Party size</span>
                <input v-model.number="form.partySize" type="number" min="1" max="50" class="adm-input">
              </label>
            </div>

            <div class="adm-grid-3">
              <label class="adm-field">
                <span class="field-label">Date</span>
                <input v-model="form.date" type="date" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="field-label">Time</span>
                <input v-model="form.time" type="time" step="900" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="field-label">Duration</span>
                <select v-model.number="form.durationMinutes" class="adm-select">
                  <option v-for="d in DURATIONS" :key="d" :value="d">{{ durationLabel(d) }}</option>
                </select>
              </label>
            </div>

            <label class="adm-field">
              <span class="field-label">Table</span>
              <select v-model="form.tableId" class="adm-select">
                <option :value="null">Unassigned</option>
                <optgroup v-for="s in sections" :key="s.id" :label="s.name">
                  <option v-for="t in s.tables" :key="t.id" :value="t.id">
                    {{ t.name }} · {{ t.minCovers }}–{{ t.maxCovers }} covers{{ form.partySize > t.maxCovers ? ' (too small)' : '' }}
                  </option>
                </optgroup>
              </select>
            </label>

            <div class="adm-field">
              <span class="field-label">Reservation tags</span>
              <div class="chips">
                <button
                  v-for="t in tagOptions"
                  :key="t"
                  type="button"
                  class="adm-chip adm-chip-btn"
                  :class="{ 'is-on': form.tags.includes(t) }"
                  :aria-pressed="form.tags.includes(t)"
                  @click="toggleTag(t)"
                >
                  {{ t }}
                </button>
              </div>
              <form class="tag-add" @submit.prevent="addCustomTag">
                <input v-model="customTag" class="adm-input" placeholder="Occasions, table preferences…" maxlength="40">
                <button type="submit" class="adm-btn adm-btn-sm" :disabled="!customTag.trim()">Add</button>
              </form>
            </div>

            <label class="adm-field">
              <span class="field-label">Reservation notes</span>
              <textarea v-model="form.notes" class="adm-textarea notes" placeholder="Guest requests, occasion details…" />
            </label>
            <label class="adm-field internal">
              <span class="field-label">Internal notes · staff only</span>
              <textarea v-model="form.internalNotes" class="adm-textarea" placeholder="Deposit, who took the call, seating preferences…" />
            </label>

            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="field-label">Phone</span>
                <input v-model="form.phone" type="tel" class="adm-input">
              </label>
              <label class="adm-field">
                <span class="field-label">Email</span>
                <input v-model="form.email" type="email" class="adm-input">
              </label>
            </div>

            <label class="switch">
              <input v-model="muteNotifications" type="checkbox">
              <span class="switch-track" aria-hidden="true" />
              Disable guest notification for this booking
            </label>
          </div>

          <aside class="rd-summary">
            <h3>Reservation <span>#{{ reservation.reference }}</span></h3>
            <dl>
              <dt>Outlet name</dt><dd>YANA Restaurant</dd>
              <dt>Reservation date</dt><dd>{{ longDate }}</dd>
              <dt>Reservation time</dt><dd>{{ reservation.time }}</dd>
              <dt>Duration</dt><dd>{{ durationText }}</dd>
              <dt>Party size</dt><dd>{{ reservation.partySize }}</dd>
              <dt>Section</dt><dd>{{ reservation.sectionName ?? '—' }}</dd>
              <dt>Table(s)</dt><dd>{{ reservation.tableName ?? '—' }}</dd>
              <dt>Source</dt><dd>{{ SOURCE_LABELS[reservation.source] }}</dd>
            </dl>
            <dl class="rd-audit">
              <div>
                <dt>Created on</dt>
                <dd>{{ formatStamp(reservation.createdAt) }}</dd>
              </div>
              <div>
                <dt>Created by</dt>
                <dd>{{ reservation.createdByName ?? 'Online booking' }}</dd>
              </div>
              <div>
                <dt>Edited on</dt>
                <dd>{{ formatStamp(reservation.updatedAt) }}</dd>
              </div>
              <div>
                <dt>Edited by</dt>
                <dd>{{ reservation.updatedByName ?? '—' }}</dd>
              </div>
            </dl>
            <p class="rd-can">For this reservation, you can:</p>
            <div class="rd-actions">
              <button type="button" class="rd-action" @click="printWaiterTicket(reservation)"><AdminIcon name="note" :size="16" /> Print waiter ticket</button>
              <a v-if="reservation.phone" class="rd-action" :href="`tel:${reservation.phone}`"><AdminIcon name="phone" :size="16" /> Call guest</a>
              <a v-if="reservation.phone" class="rd-action" :href="`https://wa.me/${reservation.phone.replace(/[^\d]/g, '')}`" target="_blank" rel="noopener"><AdminIcon name="mail" :size="16" /> WhatsApp guest</a>
              <a v-if="reservation.email" class="rd-action" :href="`mailto:${reservation.email}`"><AdminIcon name="mail" :size="16" /> Email guest</a>
            </div>
          </aside>
        </div>

        <footer class="adm-panel-foot">
          <span v-if="dirty" class="dirty-note">Unsaved changes</span>
          <button type="button" class="adm-btn" :disabled="!dirty || busy" @click="resetForm">Discard</button>
          <button type="button" class="adm-btn adm-btn-primary save-btn" :disabled="!dirty || busy" @click="save">
            {{ busy ? 'Saving…' : 'Save all changes' }}
          </button>
        </footer>
      </template>

      <!-- Profile -->
      <div v-else-if="tab === 'profile'" class="rd-body">
        <p v-if="!reservation.guestId" class="adm-empty">This booking has no guest profile. Add a phone number or email and save to create one.</p>
        <p v-else-if="!profile" class="adm-empty">{{ profileError || 'Loading profile…' }}</p>
        <AdminGuestProfileForm v-else :profile="profile" :sections="sections" @saved="onProfileSaved" />
      </div>

      <!-- Future / past bookings -->
      <div v-else-if="tab === 'future' || tab === 'past'" class="rd-body">
        <div class="history-bar">
          <select v-model="historySort" class="adm-select" aria-label="Sort bookings">
            <option value="latest">Sort by latest</option>
            <option value="oldest">Sort by oldest</option>
          </select>
          <select v-model="historyFilter" class="adm-select" aria-label="Filter bookings">
            <option value="all">All statuses</option>
            <option v-for="s in RESERVATION_STATUSES" :key="s" :value="s">{{ STATUS_META[s].label }}</option>
          </select>
          <span class="adm-muted history-count"><strong>{{ historyItems.length }}</strong> reservations</span>
        </div>
        <p v-if="!reservation.guestId" class="adm-empty">No guest profile, so there's no booking history.</p>
        <p v-else-if="!profile" class="adm-empty">{{ profileError || 'Loading…' }}</p>
        <p v-else-if="!historyItems.length" class="adm-empty">No {{ tab }} bookings.</p>
        <div v-else class="history-list">
          <AdminBookingCard v-for="h in historyItems" :key="h.id" :item="h" :class="{ current: h.id === reservation.id }" />
        </div>
      </div>

      <!-- Activity -->
      <div v-else class="rd-body">
        <p v-if="activityError" class="adm-error">{{ activityError }}</p>
        <p v-else-if="!activity" class="adm-empty">Loading activity…</p>
        <p v-else-if="!activity.length" class="adm-empty">No activity recorded yet.</p>
        <ol v-else class="activity">
          <li v-for="a in activity" :key="a.id">
            <span class="act-dot" :class="a.action" />
            <div class="act-body">
              <p class="act-title">
                <strong>{{ a.staffName ?? (a.action === 'created' ? 'Guest (online)' : 'System') }}</strong>
                {{ actionText(a) }}
              </p>
              <ul v-if="a.changes.length" class="act-changes">
                <li v-for="(c, i) in a.changes" :key="i">
                  <span class="act-field">{{ c.field }}</span>
                  <span class="act-from">{{ showValue(c.field, c.from) }}</span>
                  <span aria-hidden="true">→</span>
                  <span class="act-to">{{ showValue(c.field, c.to) }}</span>
                </li>
              </ul>
              <time class="adm-muted">{{ formatStamp(a.createdAt) }}</time>
            </div>
          </li>
        </ol>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  reservation: AdminReservation | null
  sections: FloorSection[]
}>()

const emit = defineEmits<{
  close: []
  updated: [AdminReservation]
}>()

const DURATIONS = [45, 60, 75, 90, 105, 120, 150, 180, 240]

function durationLabel(m: number) {
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? `${h}h${r ? ` ${r}m` : ''}` : `${r} min`
}

type TabKey = 'reservation' | 'profile' | 'future' | 'past' | 'activity'
const tab = ref<TabKey>('reservation')

type Form = Pick<AdminReservation, 'date' | 'time' | 'partySize' | 'seatedGuests' | 'durationMinutes' | 'tableId' | 'firstName' | 'lastName' | 'tags' | 'notifyGuest'> & {
  phone: string
  email: string
  notes: string
  internalNotes: string
}

const form = ref<Form | null>(null)
const busy = ref(false)
const error = ref('')
const customTag = ref('')

function toForm(r: AdminReservation): Form {
  return {
    date: r.date,
    time: r.time,
    partySize: r.partySize,
    seatedGuests: r.seatedGuests,
    durationMinutes: r.durationMinutes,
    tableId: r.tableId,
    firstName: r.firstName,
    lastName: r.lastName,
    phone: r.phone ?? '',
    email: r.email ?? '',
    notes: r.notes ?? '',
    internalNotes: r.internalNotes ?? '',
    tags: [...r.tags],
    notifyGuest: r.notifyGuest
  }
}

function resetForm() {
  form.value = props.reservation ? toForm(props.reservation) : null
  error.value = ''
}

watch(() => props.reservation, (next, prev) => {
  if (next?.id !== prev?.id) {
    customTag.value = ''
    tab.value = 'reservation'
    profile.value = null
    activity.value = null
    resetForm()
    return
  }
  // Same booking refreshed in the background: only adopt the new values if
  // the host hasn't started editing, so polling never wipes their changes.
  const untouched = !form.value || !prev || JSON.stringify(form.value) === JSON.stringify(toForm(prev))
  if (untouched) resetForm()
  // A saved change invalidates the loaded history and log.
  if (next && prev && next.updatedAt !== prev.updatedAt) {
    activity.value = null
    if (tab.value === 'activity') loadActivity()
  }
}, { immediate: true })

const dirty = computed(() => !!form.value && !!props.reservation && JSON.stringify(form.value) !== JSON.stringify(toForm(props.reservation)))

const muteNotifications = computed({
  get: () => !form.value?.notifyGuest,
  set: (v: boolean) => { if (form.value) form.value.notifyGuest = !v }
})

const fullName = computed(() => {
  const r = props.reservation!
  return [r.guestSalutation, guestName(r)].filter(Boolean).join(' ')
})

const longDate = computed(() => new Date(`${props.reservation!.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }))

const durationText = computed(() => {
  const r = props.reservation!
  const actual = actualMinutes(r)
  if (actual === null) return `${durationLabel(r.durationMinutes)} planned`
  return `${actual} minutes (${clockTime(r.seatedAt!)} – ${r.finishedAt ? clockTime(r.finishedAt) : 'now'})`
})

const tagOptions = computed(() => [...new Set([...RESERVATION_TAG_PRESETS, ...(form.value?.tags ?? [])])])

function toggleTag(tag: string) {
  if (!form.value) return
  const tags = form.value.tags
  form.value.tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
}

function addCustomTag() {
  const tag = customTag.value.trim()
  if (form.value && tag && !form.value.tags.includes(tag)) form.value.tags = [...form.value.tags, tag]
  customTag.value = ''
}

async function patch(body: Record<string, unknown>) {
  if (!props.reservation) return
  busy.value = true
  error.value = ''
  try {
    const updated = await $fetch<AdminReservation>(`/api/reservations/${props.reservation.id}`, { method: 'PATCH', body })
    emit('updated', updated)
  } catch (err) {
    error.value = errorMessage(err, 'Could not save. Please try again.')
  } finally {
    busy.value = false
  }
}

function formPayload() {
  const f = form.value!
  return {
    ...f,
    phone: f.phone || null,
    email: f.email || null,
    notes: f.notes || null,
    internalNotes: f.internalNotes || null
  }
}

function setStatus(status: ReservationStatus) {
  if (status === props.reservation?.status) return
  // Keep any unsaved edits by sending them along with the status change.
  patch(dirty.value ? { ...formPayload(), status } : { status })
}

function save() {
  patch(formPayload())
}

// ---- Guest profile & history ----
const profile = ref<GuestProfile | null>(null)
const profileError = ref('')

async function loadProfile() {
  const id = props.reservation?.guestId
  if (!id) return
  profileError.value = ''
  try {
    profile.value = await $fetch<GuestProfile>(`/api/admin/guests/${id}`)
  } catch (err) {
    profileError.value = errorMessage(err, 'Could not load the guest profile.')
  }
}

function onProfileSaved(updated: GuestProfile) {
  profile.value = updated
  // Name, VIP and tags show on the booking too, so refresh it.
  if (props.reservation) {
    emit('updated', {
      ...props.reservation,
      guestSalutation: updated.salutation,
      guestVip: updated.vip,
      guestTags: updated.tags,
      guestNotes: updated.notes
    })
  }
}

const historySort = ref<'latest' | 'oldest'>('latest')
const historyFilter = ref<'all' | ReservationStatus>('all')

const splitHistory = computed(() => {
  const today = todayIso()
  const upcoming: ReservationStatus[] = ['pending', 'confirmed', 'waitlist']
  const all = profile.value?.history ?? []
  return {
    future: all.filter(h => h.date > today || (h.date === today && upcoming.includes(h.status))),
    past: all.filter(h => !(h.date > today || (h.date === today && upcoming.includes(h.status))))
  }
})

const historyItems = computed(() => {
  const list = tab.value === 'future' ? splitHistory.value.future : splitHistory.value.past
  const filtered = historyFilter.value === 'all' ? list : list.filter(h => h.status === historyFilter.value)
  const dir = historySort.value === 'latest' ? -1 : 1
  return [...filtered].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) * dir)
})

// ---- Activity ----
const activity = ref<ActivityEntry[] | null>(null)
const activityError = ref('')

async function loadActivity() {
  if (!props.reservation) return
  activityError.value = ''
  try {
    activity.value = await $fetch<ActivityEntry[]>(`/api/admin/reservations/${props.reservation.id}/activity`)
  } catch (err) {
    activityError.value = errorMessage(err, 'Could not load the activity log.')
  }
}

function actionText(a: ActivityEntry) {
  if (a.action === 'created') return 'created the reservation'
  if (a.action === 'status') return 'changed the status'
  return `edited ${a.changes.length === 1 ? 'the reservation' : `${a.changes.length} fields`}`
}

function showValue(field: string, v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  if (field === 'Status' && typeof v === 'string' && v in STATUS_META) return STATUS_META[v as ReservationStatus].label
  if (field === 'Guest notifications') return v ? 'On' : 'Off'
  if (field === 'Time' && typeof v === 'string') return formatTime(v.slice(0, 5))
  if (field === 'Duration') return `${v} min`
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

watch(tab, (t) => {
  if ((t === 'profile' || t === 'future' || t === 'past') && !profile.value) loadProfile()
  if (t === 'activity' && !activity.value) loadActivity()
})

const tabs = computed(() => [
  { key: 'reservation' as const, label: 'Reservation' },
  { key: 'profile' as const, label: 'Profile' },
  { key: 'future' as const, label: 'Future bookings', count: profile.value ? splitHistory.value.future.length : undefined },
  { key: 'past' as const, label: 'Past bookings', count: profile.value ? splitHistory.value.past.length : undefined },
  { key: 'activity' as const, label: 'Activity logs' }
])

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.reservation) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.rd {
  width: min(1040px, calc(100vw - 48px));
}

.rd-head {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 22px 24px;
  background: var(--adm-nav);
  color: #fff;
}

.rd-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: #E9EDF2;
  color: var(--adm-nav);
  font-size: 22px;
  font-weight: 500;
}

.rd-avatar.vip {
  background: var(--adm-accent);
}

.rd-who {
  flex: 1;
  min-width: 0;
}

.rd-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 4px;
  font-size: 22px;
  font-weight: 500;
}

.vip-star {
  color: var(--adm-accent);
  fill: var(--adm-accent);
}

.rd-phone {
  margin: 0 0 10px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.72);
}

.rd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.rd-chip {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
}

.rd-chip.new {
  background: #3F8F6B;
}

.rd-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.rd-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rd-tabs {
  display: flex;
  gap: 4px;
  padding: 0 16px;
  overflow-x: auto;
  border-bottom: 1px solid var(--adm-line);
}

.rd-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 15px 12px 12px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  font-family: inherit;
  font-size: 14px;
  color: var(--adm-muted);
  white-space: nowrap;
  cursor: pointer;
}

.rd-tabs button:hover {
  color: var(--adm-text);
}

.rd-tabs button.is-active {
  border-bottom-color: var(--adm-accent);
  color: var(--adm-text);
  font-weight: 500;
}

.rd-tab-count {
  padding: 0 7px;
  border-radius: 999px;
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
  font-size: 11.5px;
  font-weight: 400;
}

.rd-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
}

.rd-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 0;
  padding: 0;
}

.rd-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px 28px;
  border-right: 1px solid var(--adm-line);
}

.field-label {
  font-size: 13px;
  color: var(--adm-muted);
}

.stepper {
  display: grid;
  grid-template-columns: 1fr 48px 48px;
  height: 40px;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  overflow: hidden;
}

.stepper-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
}

.stepper button {
  border: 0;
  border-left: 1px solid var(--adm-line-strong);
  background: var(--adm-surface-2);
  color: var(--adm-primary);
  font-size: 18px;
  cursor: pointer;
}

.stepper button:disabled {
  color: var(--adm-faint);
  cursor: not-allowed;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
  height: 32px;
  font-size: 13px;
}

.notes {
  min-height: 120px;
}

.internal .adm-textarea {
  background: #FFFBF3;
  border-color: #E8D9BF;
}

.switch {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  cursor: pointer;
}

.switch input {
  position: absolute;
  opacity: 0;
}

.switch-track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  background: #C9CED4;
  transition: background 0.2s;
}

.switch-track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.switch input:checked + .switch-track {
  background: var(--adm-primary);
}

.switch input:checked + .switch-track::after {
  transform: translateX(16px);
}

.switch input:focus-visible + .switch-track {
  outline: 2px solid var(--adm-accent);
  outline-offset: 2px;
}

.rd-summary {
  padding: 20px 20px 28px;
  background: var(--adm-surface-2);
}

.rd-summary h3 {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 500;
  color: var(--adm-muted);
}

.rd-summary h3 span {
  margin-left: 10px;
  color: var(--adm-text);
}

.rd-summary dl {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px 10px;
  margin: 0;
  font-size: 13.5px;
}

.rd-summary dt {
  color: var(--adm-muted);
}

.rd-summary dd {
  margin: 0;
  font-weight: 500;
}

.rd-audit {
  grid-template-columns: 1fr 1fr !important;
  margin-top: 20px !important;
  padding-top: 16px;
  border-top: 1px solid var(--adm-line);
  font-size: 12.5px !important;
}

.rd-audit dt {
  font-size: 12px;
}

.rd-audit dd {
  margin-top: 2px !important;
  font-weight: 400 !important;
}

.rd-can {
  margin: 22px 0 8px;
  padding-top: 16px;
  border-top: 1px solid var(--adm-line);
  font-size: 13px;
  color: var(--adm-muted);
}

.rd-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rd-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border: 0;
  background: none;
  color: var(--adm-success);
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.rd-action:hover {
  text-decoration: underline;
}

.dirty-note {
  margin-right: auto;
  align-self: center;
  font-size: 12.5px;
  color: var(--adm-accent-dk);
}

.save-btn {
  height: 40px;
  padding: 0 22px;
  font-size: 14px;
}

.history-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.history-bar .adm-select {
  width: auto;
}

.history-count {
  margin-left: auto;
  font-size: 13px;
}

.history-count strong {
  color: var(--adm-text);
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-list .current {
  box-shadow: 0 0 0 2px var(--adm-accent);
}

.activity {
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity > li {
  position: relative;
  display: flex;
  gap: 14px;
  padding: 0 0 20px;
}

.activity > li:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: var(--adm-line);
}

.act-dot {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-top: 3px;
  border: 3px solid var(--adm-surface);
  border-radius: 50%;
  background: var(--adm-primary);
  box-shadow: 0 0 0 1px var(--adm-line-strong);
}

.act-dot.created {
  background: var(--adm-success);
}

.act-dot.status {
  background: var(--adm-accent-dk);
}

.act-body {
  flex: 1;
  min-width: 0;
}

.act-title {
  margin: 0 0 6px;
  font-size: 13.5px;
}

.act-title strong {
  font-weight: 500;
}

.act-changes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 6px;
  padding: 10px 12px;
  list-style: none;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  font-size: 12.5px;
}

.act-changes li {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.act-field {
  min-width: 120px;
  color: var(--adm-muted);
}

.act-from {
  color: var(--adm-muted);
  text-decoration: line-through;
}

.act-to {
  font-weight: 500;
}

.activity time {
  font-size: 12px;
}

@media (max-width: 900px) {
  .rd-split {
    grid-template-columns: 1fr;
  }

  .rd-main {
    border-right: 0;
  }

  .rd-avatar {
    width: 52px;
    height: 52px;
  }
}
</style>
