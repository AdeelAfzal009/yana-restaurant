<template>
  <div class="yana-page">
    <header class="reservation-banner">
      <div aria-hidden="true" class="banner-bg" />
      <div aria-hidden="true" class="banner-scrim" />
      <div class="banner-content">
        <span class="eyebrow-plain"><span class="rule-short" />Al Saadiyat Island · Abu Dhabi</span>
        <h1 class="banner-title">Reserve a Table</h1>
      </div>
    </header>

    <section class="booking-section">
      <div class="booking-card">
        <div class="booking-card-head">YANA Restaurant</div>

        <!-- STEP 1: DATE, TIME, PARTY SIZE -->
        <div v-if="step === 1" class="booking-body">
          <div class="calendar-head">
            <button class="cal-nav-btn" :disabled="isCurrentMonth" aria-label="Previous month" @click="shiftMonth(-1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="15 5 8 12 15 19" /></svg>
            </button>
            <span class="calendar-title">{{ monthLabel }}</span>
            <button class="cal-nav-btn" aria-label="Next month" @click="shiftMonth(1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="9 5 16 12 9 19" /></svg>
            </button>
          </div>

          <div class="calendar-grid">
            <span v-for="d in weekdayLabels" :key="d" class="calendar-weekday">{{ d }}</span>
            <button
              v-for="cell in calendarCells"
              :key="cell.key"
              type="button"
              class="calendar-day"
              :class="{ 'is-muted': !cell.inMonth, 'is-disabled': cell.disabled, 'is-selected': !!cell.iso && cell.iso === selectedDate }"
              :disabled="cell.disabled"
              @click="selectDate(cell.iso)"
            >
              {{ cell.day }}
            </button>
          </div>

          <div class="booking-subsection">
            <p class="booking-label">I want to have</p>
            <p class="booking-sublabel">Choose a time to see available party sizes.</p>
            <div class="chip-row">
              <button class="chip-nav" aria-label="Earlier times" @click="scrollChips(timeRow, -1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="15 5 8 12 15 19" /></svg>
              </button>
              <div ref="timeRow" class="chip-track">
                <button
                  v-for="t in timeSlots"
                  :key="t.value"
                  type="button"
                  class="chip"
                  :class="{ 'is-active': t.value === selectedTime }"
                  @click="selectedTime = t.value"
                >
                  {{ t.label }}
                </button>
              </div>
              <button class="chip-nav" aria-label="Later times" @click="scrollChips(timeRow, 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="9 5 16 12 9 19" /></svg>
              </button>
            </div>
          </div>

          <div class="booking-subsection">
            <p class="booking-label">Table for</p>
            <p class="booking-sublabel">Available for up to {{ maxPartySize }} guests</p>
            <div class="chip-row">
              <button class="chip-nav" aria-label="Fewer guests" @click="scrollChips(partyRow, -1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="15 5 8 12 15 19" /></svg>
              </button>
              <div ref="partyRow" class="chip-track">
                <button
                  v-for="n in maxPartySize"
                  :key="n"
                  type="button"
                  class="chip"
                  :class="{ 'is-active': n === partySize }"
                  @click="partySize = n"
                >
                  {{ n }}
                </button>
              </div>
              <button class="chip-nav" aria-label="More guests" @click="scrollChips(partyRow, 1)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="9 5 16 12 9 19" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- STEP 2: GUEST DETAILS -->
        <div v-else-if="step === 2" class="booking-body">
          <button type="button" class="back-link" @click="step = 1">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="15 18 9 12 15 6" /></svg>
            Modify my reservation
          </button>

          <p class="booking-label" style="margin-top: 22px;">You are booking on</p>
          <div class="summary-list">
            <div class="summary-row">
              <span class="summary-icon">📅</span>
              <span>Date &amp; time:</span>
              <strong>{{ formattedSelection }}</strong>
            </div>
            <div class="summary-row">
              <span class="summary-icon">👥</span>
              <span>Number of guests:</span>
              <strong>{{ partySize }}</strong>
            </div>
          </div>

          <p class="booking-label" style="margin-top: 30px;">Please confirm your details so we can contact you regarding your booking</p>
          <form class="reservation-form" @submit.prevent="submitReservation">
            <div class="form-fields">
              <input v-model.trim="guest.firstName" class="yana-input" type="text" placeholder="First name*" required>
              <input v-model.trim="guest.lastName" class="yana-input" type="text" placeholder="Last name*" required>
            </div>
            <div class="form-fields">
              <input v-model.trim="guest.email" class="yana-input" type="email" placeholder="Email address*" required>
              <input v-model.trim="guest.phone" class="yana-input" type="tel" placeholder="Mobile number*" required>
            </div>
            <textarea v-model.trim="guest.notes" class="yana-input" placeholder="Or specify any additional requests" />

            <label class="check-row">
              <input v-model="guest.acceptedTerms" type="checkbox" required>
              <span>By placing your reservation, you agree that your information will be subject to our Terms &amp; Conditions and Privacy Policy.</span>
            </label>

            <p v-if="submitError" class="form-error">{{ submitError }}</p>

            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? 'Booking…' : 'Complete your booking' }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </form>
        </div>

        <!-- STEP 3: CONFIRMATION -->
        <div v-else class="booking-body booking-body--confirm">
          <p class="confirm-message">Dear {{ guest.firstName }}, your reservation is confirmed. Thank you for booking with us.</p>

          <div class="confirm-actions">
            <button type="button" class="chip-btn chip-btn--gold" @click="resetForm">Make Another Reservation</button>
            <NuxtLink to="/" class="chip-btn">Back to Home</NuxtLink>
          </div>

          <p class="booking-label" style="margin-top: 34px;">{{ guest.firstName }} {{ guest.lastName }}'s booking details</p>
          <div class="summary-list">
            <div class="summary-row">
              <span class="summary-icon">📅</span>
              <span>Date and time:</span>
              <strong>{{ formattedSelection }}</strong>
            </div>
            <div class="summary-row">
              <span class="summary-icon">👥</span>
              <span>Number of guests:</span>
              <strong>{{ partySize }}</strong>
            </div>
            <div class="summary-row">
              <span class="summary-icon">#</span>
              <span>Reference number:</span>
              <strong>#{{ confirmedReference }}</strong>
            </div>
            <div v-if="guest.notes" class="summary-row">
              <span class="summary-icon">📝</span>
              <span>Notes/Requests:</span>
              <strong>{{ guest.notes }}</strong>
            </div>
          </div>
        </div>

        <div v-if="step === 1" class="booking-footer">
          <button type="button" class="next-btn" :disabled="!selectedDate || !selectedTime" @click="step = 2">
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="9 6 15 12 9 18" /></svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const maxPartySize = 10

const step = ref(1)
const today = new Date()
today.setHours(0, 0, 0, 0)

const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const selectedDate = ref('')
const selectedTime = ref('')
const partySize = ref(2)

const timeRow = ref<HTMLElement | null>(null)
const partyRow = ref<HTMLElement | null>(null)

const guest = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  acceptedTerms: false
})

const submitting = ref(false)
const submitError = ref('')
const confirmedReference = ref('')

const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const isCurrentMonth = computed(() => viewYear.value === today.getFullYear() && viewMonth.value === today.getMonth())

const monthLabel = computed(() => new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))

function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const calendarCells = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()

  const cells: { key: string, day: number, iso: string, inMonth: boolean, disabled: boolean }[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    cells.push({ key: `prev-${day}`, day, iso: '', inMonth: false, disabled: true })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(viewYear.value, viewMonth.value, day)
    cells.push({
      key: `cur-${day}`,
      day,
      iso: toIso(viewYear.value, viewMonth.value, day),
      inMonth: true,
      disabled: cellDate.getTime() < today.getTime()
    })
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - (startOffset + daysInMonth) + 1
    cells.push({ key: `next-${day}`, day, iso: '', inMonth: false, disabled: true })
  }

  return cells
})

function shiftMonth(delta: number) {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1)
  if (delta < 0 && (next.getFullYear() < today.getFullYear() || (next.getFullYear() === today.getFullYear() && next.getMonth() < today.getMonth()))) return
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth()
}

function selectDate(iso: string) {
  if (!iso) return
  selectedDate.value = iso
}

const timeSlots = computed(() => {
  if (!selectedDate.value) return []
  const dow = new Date(`${selectedDate.value}T00:00:00`).getDay()
  const isWeekend = dow === 5 || dow === 6
  const openMinutes = 9 * 60
  const closeMinutes = isWeekend ? 24 * 60 : 22 * 60
  const lastSlot = closeMinutes - 60

  const isToday = selectedDate.value === toIso(today.getFullYear(), today.getMonth(), today.getDate())
  const now = new Date()
  const earliestMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1

  const slots: { value: string, label: string }[] = []
  for (let m = openMinutes; m <= lastSlot; m += 15) {
    if (m < earliestMinutes) continue
    const h = Math.floor(m / 60)
    const mm = m % 60
    const value = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    const label = new Date(2000, 0, 1, h, mm).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    slots.push({ value, label })
  }
  return slots
})

watch(selectedDate, () => {
  selectedTime.value = ''
})

function scrollChips(el: HTMLElement | null, direction: number) {
  el?.scrollBy({ left: direction * 160, behavior: 'smooth' })
}

const formattedSelection = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return ''
  const [h, m] = selectedTime.value.split(':').map(Number)
  const d = new Date(`${selectedDate.value}T00:00:00`)
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const timeLabel = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dateLabel} ${timeLabel}`
})

async function submitReservation() {
  submitError.value = ''
  if (!guest.acceptedTerms) {
    submitError.value = 'Please accept the terms to continue.'
    return
  }

  submitting.value = true
  try {
    const res = await $fetch<{ reference: string }>('/api/reservations', {
      method: 'POST',
      body: {
        date: selectedDate.value,
        time: selectedTime.value,
        partySize: partySize.value,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        notes: guest.notes
      }
    })
    confirmedReference.value = res.reference
    step.value = 3
  } catch (err: any) {
    submitError.value = err?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  step.value = 1
  selectedDate.value = ''
  selectedTime.value = ''
  partySize.value = 2
  Object.assign(guest, { firstName: '', lastName: '', email: '', phone: '', notes: '', acceptedTerms: false })
  confirmedReference.value = ''
}
</script>

<style scoped>
.reservation-banner {
  position: relative;
  overflow: hidden;
  min-height: clamp(320px, 40vh, 420px);
  display: flex;
  align-items: flex-end;
  background: #0f1e2e;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: url('/images/yana-pattern-tall.png') center/cover no-repeat;
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 30, 46, 0.72), rgba(15, 30, 46, 0.5) 45%, rgba(15, 30, 46, 0.94));
}

.banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) clamp(46px, 6vw, 74px);
}

.eyebrow-plain {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-lt);
  font-weight: 400;
}

.rule-short {
  width: 34px;
  height: 1px;
  background: var(--gold);
  display: inline-block;
}

.banner-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(40px, 8vw, 84px);
  line-height: 1;
  margin: 20px 0 0;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.booking-section {
  padding: clamp(48px, 8vw, 96px) clamp(16px, 5vw, 64px) clamp(80px, 10vw, 140px);
  display: flex;
  justify-content: center;
}

.booking-card {
  width: 100%;
  max-width: 620px;
  background: #ffffff;
  box-shadow: 0 30px 70px rgba(15, 30, 46, 0.16);
  margin-top: clamp(-140px, -16vw, -90px);
  position: relative;
  z-index: 3;
}

.booking-card-head {
  background: var(--gold);
  color: var(--blue-dk);
  text-align: center;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 16px 20px;
  font-weight: 500;
}

.booking-body {
  padding: clamp(24px, 4vw, 40px);
}

.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cal-nav-btn {
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  padding: 6px;
  transition: opacity 0.3s;
}

.cal-nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.calendar-title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
}

.calendar-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 10px;
}

.calendar-weekday {
  text-align: center;
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: var(--ink-dim);
  padding-bottom: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:hover:not(.is-disabled) {
  background: rgba(217, 182, 144, 0.25);
}

.calendar-day.is-muted {
  color: rgba(15, 30, 46, 0.22);
}

.calendar-day.is-disabled {
  color: rgba(15, 30, 46, 0.22);
  cursor: default;
}

.calendar-day.is-selected {
  background: var(--gold);
  color: #ffffff;
}

.booking-subsection {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(18, 66, 109, 0.12);
  text-align: center;
}

.booking-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}

.booking-sublabel {
  font-size: 12.5px;
  color: var(--ink-dim);
  margin: 4px 0 0;
}

.chip-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-nav {
  flex: 0 0 auto;
  background: none;
  border: none;
  color: var(--ink-dim);
  cursor: pointer;
  padding: 6px;
}

.chip-track {
  flex: 1;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.chip-track::-webkit-scrollbar {
  display: none;
}

.chip {
  flex: 0 0 auto;
  min-width: 66px;
  padding: 12px 14px;
  background: rgba(18, 66, 109, 0.06);
  border: none;
  color: var(--ink);
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.25s;
}

.chip.is-active {
  background: var(--gold);
  color: #ffffff;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--gold-dk);
  font-size: 13.5px;
  cursor: pointer;
  padding: 0;
}

.summary-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 14px;
  color: var(--ink-dim);
}

.summary-row strong {
  color: var(--ink);
  font-weight: 500;
}

.summary-icon {
  flex: 0 0 auto;
}

.reservation-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 6px 24px;
}

.check-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 20px;
  font-size: 12.5px;
  color: var(--ink-dim);
  line-height: 1.6;
  cursor: pointer;
}

.check-row input {
  margin-top: 3px;
  accent-color: var(--gold);
}

.form-error {
  margin-top: 14px;
  font-size: 13px;
  color: #b3432f;
}

.submit-btn,
.next-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 26px;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  background: var(--gold);
  border: none;
  padding: 18px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:disabled,
.next-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.booking-footer {
  padding: 0 clamp(24px, 4vw, 40px) clamp(24px, 4vw, 40px);
}

.next-btn {
  margin-top: 0;
}

.booking-body--confirm {
  text-align: center;
}

.confirm-message {
  font-size: 16px;
  color: var(--ink);
  line-height: 1.7;
}

.confirm-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.chip-btn {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 14px 26px;
  border: 1px solid var(--gold);
  color: var(--gold-dk);
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.chip-btn--gold {
  background: var(--gold);
  color: #ffffff;
}

.chip-btn:hover {
  opacity: 0.8;
}

.booking-body--confirm .summary-list {
  text-align: left;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 640px) {
  .booking-card {
    margin-top: 0;
  }
}
</style>
