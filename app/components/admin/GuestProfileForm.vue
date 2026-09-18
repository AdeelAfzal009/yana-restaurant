<template>
  <div class="gp">
    <!-- Stats strip -->
    <div class="gp-stats">
      <div class="gp-total">
        <span class="gp-k">Total RSRVs</span>
        <strong class="adm-num">{{ stats.total }}</strong>
      </div>
      <ul class="gp-breakdown">
        <li><span class="adm-dot" :style="{ background: STATUS_META.seated.color }" /> Seated <strong class="adm-num">{{ stats.seated }}</strong> <span class="adm-muted">({{ pct(stats.seated) }})</span></li>
        <li><span class="adm-dot" :style="{ background: STATUS_META.no_show.color }" /> No-show <strong class="adm-num">{{ stats.noShow }}</strong> <span class="adm-muted">({{ pct(stats.noShow) }})</span></li>
        <li><span class="adm-dot" :style="{ background: STATUS_META.cancelled.color }" /> Cancelled <strong class="adm-num">{{ stats.cancelled }}</strong> <span class="adm-muted">({{ pct(stats.cancelled) }})</span></li>
      </ul>
      <dl class="gp-last">
        <dt>Covers</dt><dd class="adm-num">{{ stats.covers }}</dd>
        <dt>Last seat</dt><dd>{{ stats.lastSeat ?? '—' }}</dd>
        <dt>Last visit</dt><dd>{{ stats.lastVisit ?? '—' }}</dd>
      </dl>
    </div>

    <div v-if="form" class="gp-form">
      <section class="gp-block">
        <label class="vip-toggle">
          <input v-model="form.vip" type="checkbox">
          <AdminIcon name="star" :size="15" class="vip-star" />
          VIP guest — highlighted on every booking
        </label>
        <div class="adm-grid-3">
          <label class="adm-field">
            <span class="adm-label">Salutation</span>
            <select v-model="form.salutation" class="adm-select">
              <option :value="null">—</option>
              <option v-for="s in SALUTATIONS" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="adm-field">
            <span class="adm-label">First name *</span>
            <input v-model="form.firstName" class="adm-input" required>
          </label>
          <label class="adm-field">
            <span class="adm-label">Last name</span>
            <input v-model="form.lastName" class="adm-input">
          </label>
        </div>
      </section>

      <section class="gp-block adm-grid-2">
        <label class="adm-field">
          <span class="adm-label">Phone number</span>
          <input v-model="form.phone" type="tel" class="adm-input" placeholder="+971 …">
        </label>
        <label class="adm-field">
          <span class="adm-label">Email</span>
          <input v-model="form.email" type="email" class="adm-input" placeholder="Add the guest's email">
        </label>
      </section>

      <section class="gp-block">
        <span class="adm-label">Marketing opt-in</span>
        <label class="check">
          <input v-model="form.marketingOptIn" type="checkbox">
          Guest would like to receive news and marketing material for promotional purposes
        </label>
      </section>

      <section class="gp-block">
        <label class="adm-field">
          <span class="adm-label">Guest notes · shown on every booking</span>
          <textarea v-model="form.notes" class="adm-textarea" placeholder="Add notes here for more details about your guest" />
        </label>
        <div class="adm-field">
          <span class="adm-label">Guest tags</span>
          <div class="chips">
            <button
              v-for="t in tagOptions"
              :key="t"
              type="button"
              class="adm-chip adm-chip-btn"
              :class="{ 'is-on': form.tags.includes(t) }"
              @click="form.tags = form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t]"
            >
              {{ t }}
            </button>
          </div>
          <form class="tag-add" @submit.prevent="addTag">
            <input v-model="customTag" class="adm-input" placeholder="Add a custom tag" maxlength="40">
            <button type="submit" class="adm-btn adm-btn-sm" :disabled="!customTag.trim()">Add</button>
          </form>
        </div>
      </section>

      <section class="gp-block gp-dates">
        <div class="adm-field">
          <span class="adm-label">Date of birth <em>year optional</em></span>
          <div class="date-parts">
            <select v-model="form.birthDay" class="adm-select" aria-label="Birth day"><option :value="null">Day</option><option v-for="d in 31" :key="d" :value="d">{{ d }}</option></select>
            <select v-model="form.birthMonth" class="adm-select" aria-label="Birth month"><option :value="null">Month</option><option v-for="(m, i) in MONTHS" :key="m" :value="i + 1">{{ m }}</option></select>
            <select v-model="form.birthYear" class="adm-select" aria-label="Birth year"><option :value="null">Year</option><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select>
          </div>
        </div>
        <div class="adm-field">
          <span class="adm-label">Anniversary <em>year optional</em></span>
          <div class="date-parts">
            <select v-model="form.anniversaryDay" class="adm-select" aria-label="Anniversary day"><option :value="null">Day</option><option v-for="d in 31" :key="d" :value="d">{{ d }}</option></select>
            <select v-model="form.anniversaryMonth" class="adm-select" aria-label="Anniversary month"><option :value="null">Month</option><option v-for="(m, i) in MONTHS" :key="m" :value="i + 1">{{ m }}</option></select>
            <select v-model="form.anniversaryYear" class="adm-select" aria-label="Anniversary year"><option :value="null">Year</option><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select>
          </div>
        </div>
      </section>

      <section class="gp-block adm-grid-3">
        <label class="adm-field">
          <span class="adm-label">Gender</span>
          <select v-model="form.gender" class="adm-select">
            <option :value="null">—</option>
            <option v-for="g in GENDERS" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>
        <label class="adm-field">
          <span class="adm-label">Preferred language</span>
          <select v-model="form.preferredLanguage" class="adm-select">
            <option :value="null">—</option>
            <option v-for="l in LANGUAGES" :key="l" :value="l">{{ l }}</option>
          </select>
        </label>
        <label class="adm-field">
          <span class="adm-label">Preferred section</span>
          <select v-model="form.preferredSectionId" class="adm-select">
            <option :value="null">—</option>
            <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </label>
      </section>

      <section class="gp-block adm-grid-2">
        <label class="adm-field">
          <span class="adm-label">Membership ID</span>
          <input v-model="form.membershipId" class="adm-input" placeholder="Add membership code">
        </label>
        <label class="adm-field">
          <span class="adm-label">Membership status</span>
          <input v-model="form.membershipStatus" class="adm-input" placeholder="e.g. Gold, Platinum">
        </label>
      </section>

      <section class="gp-block">
        <label class="adm-field">
          <span class="adm-label">Address</span>
          <input v-model="form.address" class="adm-input" placeholder="Street name, building number, floor…">
        </label>
        <div class="adm-grid-3">
          <label class="adm-field">
            <span class="adm-label">Country</span>
            <input v-model="form.country" class="adm-input" list="gp-countries">
          </label>
          <label class="adm-field">
            <span class="adm-label">City</span>
            <input v-model="form.city" class="adm-input">
          </label>
          <label class="adm-field">
            <span class="adm-label">State / Emirate</span>
            <input v-model="form.state" class="adm-input">
          </label>
        </div>
        <datalist id="gp-countries">
          <option v-for="c in COUNTRIES" :key="c" :value="c" />
        </datalist>
      </section>

      <section class="gp-block">
        <div class="links-head">
          <span class="adm-label">Social links &amp; reference URLs</span>
          <button type="button" class="adm-btn adm-btn-sm" @click="form.socialLinks.push({ platform: 'Instagram', url: '' })">
            <AdminIcon name="plus" :size="13" /> Add link
          </button>
        </div>
        <p v-if="!form.socialLinks.length" class="adm-muted empty-links">No links yet.</p>
        <div v-for="(l, i) in form.socialLinks" :key="i" class="link-row">
          <select v-model="l.platform" class="adm-select" aria-label="Platform">
            <option v-for="p in SOCIAL_PLATFORMS" :key="p" :value="p">{{ p }}</option>
          </select>
          <input v-model="l.url" type="url" class="adm-input" placeholder="https://…" aria-label="URL">
          <a v-if="/^https?:\/\//.test(l.url)" :href="l.url" target="_blank" rel="noopener" class="adm-btn adm-btn-icon" title="Open link" aria-label="Open link"><AdminIcon name="right" :size="15" /></a>
          <button type="button" class="adm-btn adm-btn-icon adm-btn-danger" aria-label="Remove link" @click="form.socialLinks.splice(i, 1)"><AdminIcon name="trash" :size="15" /></button>
        </div>
      </section>

      <p v-if="error" class="adm-error">{{ error }}</p>
    </div>

    <div class="gp-foot">
      <span v-if="dirty" class="dirty-note">Unsaved changes</span>
      <button type="button" class="adm-btn" :disabled="!dirty || saving" @click="reset">Discard</button>
      <button type="button" class="adm-btn adm-btn-primary" :disabled="!dirty || saving" @click="save">
        {{ saving ? 'Saving…' : 'Save profile' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  profile: GuestProfile
  sections: FloorSection[]
}>()
const emit = defineEmits<{ saved: [GuestProfile] }>()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COUNTRIES = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'United Kingdom', 'United States', 'India', 'Pakistan', 'France', 'Germany', 'Italy', 'Russia', 'China', 'Lebanon', 'Egypt', 'Jordan']
const thisYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => thisYear - i)

const EDITABLE = [
  'salutation', 'firstName', 'lastName', 'email', 'phone', 'tags', 'notes', 'vip', 'marketingOptIn',
  'birthDay', 'birthMonth', 'birthYear', 'anniversaryDay', 'anniversaryMonth', 'anniversaryYear',
  'gender', 'preferredLanguage', 'preferredSectionId', 'membershipId', 'membershipStatus',
  'address', 'country', 'city', 'state', 'socialLinks'
] as const
type Form = Pick<GuestProfile, (typeof EDITABLE)[number]>

function toForm(p: GuestProfile): Form {
  const out = {} as Record<string, unknown>
  for (const k of EDITABLE) out[k] = JSON.parse(JSON.stringify(p[k] ?? null))
  const f = out as Form
  f.tags ??= []
  f.socialLinks ??= []
  f.lastName ??= ''
  return f
}

const form = ref<Form | null>(null)
const saving = ref(false)
const error = ref('')
const customTag = ref('')

function reset() {
  form.value = toForm(props.profile)
  error.value = ''
}
watch(() => props.profile, reset, { immediate: true })

const dirty = computed(() => !!form.value && JSON.stringify(form.value) !== JSON.stringify(toForm(props.profile)))
const tagOptions = computed(() => [...new Set([...GUEST_TAG_PRESETS, ...(form.value?.tags ?? [])])])

function addTag() {
  const tag = customTag.value.trim()
  if (form.value && tag && !form.value.tags.includes(tag)) form.value.tags = [...form.value.tags, tag]
  customTag.value = ''
}

const stats = computed(() => {
  const h = props.profile.history
  const seated = h.filter(x => x.status === 'seated' || x.status === 'finished')
  const last = seated[0]
  return {
    total: h.length,
    seated: seated.length,
    noShow: h.filter(x => x.status === 'no_show').length,
    cancelled: h.filter(x => x.status === 'cancelled').length,
    covers: seated.reduce((n, x) => n + (x.seatedGuests ?? x.partySize), 0),
    lastSeat: last?.tableName ? `${last.tableName}${last.sectionName ? ` · ${last.sectionName}` : ''}` : null,
    lastVisit: last ? `${formatDateShort(last.date)} ${last.date.slice(0, 4)}, ${formatTime(last.time)}` : null
  }
})

function pct(n: number) {
  return stats.value.total ? `${Math.round((n / stats.value.total) * 100)}%` : '0%'
}

async function save() {
  if (!form.value) return
  saving.value = true
  error.value = ''
  try {
    const f = form.value
    const updated = await $fetch<Omit<GuestProfile, 'history'>>(`/api/admin/guests/${props.profile.id}`, {
      method: 'PATCH',
      body: { ...f, socialLinks: f.socialLinks.filter(l => l.url.trim()) }
    })
    emit('saved', { ...props.profile, ...updated })
  } catch (err) {
    error.value = errorMessage(err, 'Could not save the profile.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.gp {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gp-stats {
  display: grid;
  grid-template-columns: auto 1fr 1.3fr;
  gap: 20px;
  padding: 14px 16px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  font-size: 12.5px;
}

.gp-total {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 20px;
  border-right: 1px solid var(--adm-line);
}

.gp-k,
.gp-last dt {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--adm-muted);
}

.gp-total strong {
  font-size: 24px;
  font-weight: 500;
}

.gp-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gp-breakdown li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gp-breakdown strong {
  margin-left: auto;
  font-weight: 500;
}

.gp-last {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 0;
  padding-left: 20px;
  border-left: 1px solid var(--adm-line);
}

.gp-last dd {
  margin: 0;
  text-align: right;
}

.gp-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gp-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
}

.gp-block.adm-grid-2,
.gp-block.adm-grid-3 {
  display: grid;
}

.vip-toggle,
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.vip-toggle {
  padding: 8px 10px;
  border-radius: 6px;
  background: #FBF4E8;
}

.vip-star {
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.gp-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.adm-label em {
  margin-left: 6px;
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--adm-faint);
}

.date-parts {
  display: grid;
  grid-template-columns: 0.9fr 1fr 1fr;
  gap: 6px;
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
  height: 30px;
  font-size: 13px;
}

.links-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.empty-links {
  margin: 0;
  font-size: 12.5px;
}

.link-row {
  display: grid;
  grid-template-columns: 140px 1fr auto auto;
  gap: 8px;
}

.link-row a.adm-btn {
  text-decoration: none;
}

.gp-foot {
  position: sticky;
  bottom: -20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin: 0 -22px -20px;
  padding: 14px 22px;
  border-top: 1px solid var(--adm-line);
  background: var(--adm-surface-2);
}

.dirty-note {
  margin-right: auto;
  font-size: 12.5px;
  color: var(--adm-accent-dk);
}

@media (max-width: 720px) {
  .gp-stats,
  .gp-dates {
    grid-template-columns: 1fr;
  }

  .gp-total,
  .gp-last {
    padding: 0;
    border: 0;
  }

  .link-row {
    grid-template-columns: 1fr auto auto;
  }

  .link-row select {
    grid-column: 1 / -1;
  }
}
</style>
