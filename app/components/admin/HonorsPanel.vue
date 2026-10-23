<template>
  <div class="hp">
    <p v-if="wallets && !wallets.google && !wallets.apple" class="hp-warn">
      Google Wallet and Apple Wallet aren't connected yet. Cards can be issued now; guests can add them once the wallets are set up.
    </p>
    <p v-else-if="wallets && (!wallets.google || !wallets.apple)" class="hp-warn">
      {{ wallets.google ? 'Apple Wallet' : 'Google Wallet' }} isn't connected yet, so for now guests can only add the card to {{ wallets.google ? 'Google Wallet (Android)' : 'Apple Wallet (iPhone)' }}.
    </p>

    <!-- No card yet -->
    <section v-if="!honors" class="hp-issue">
      <div>
        <h3 class="hp-title">Issue a Yana Honors card</h3>
        <p class="adm-muted hp-lead">The guest adds it to Google Wallet or Apple Wallet and shows it on each visit. The discount is only shown here, not on the card.</p>
      </div>
      <div class="adm-field">
        <span class="adm-label">Tier</span>
        <div class="adm-seg">
          <button v-for="t in HONORS_TIERS" :key="t" type="button" :class="{ 'is-active': form.tier === t }" @click="pickTier(t)">{{ HONORS_TIER_LABEL[t] }}</button>
        </div>
      </div>
      <label class="adm-field hp-discount">
        <span class="adm-label">Discount</span>
        <span class="hp-pct"><input v-model.number="form.discountPercent" type="number" min="0" max="100" step="1" class="adm-input"><span>%</span></span>
      </label>
      <p v-if="error" class="adm-error">{{ error }}</p>
      <div>
        <button type="button" class="adm-btn adm-btn-primary" :disabled="busy" @click="issue">
          {{ busy ? 'Issuing…' : `Issue ${HONORS_TIER_LABEL[form.tier]} card` }}
        </button>
      </div>
    </section>

    <!-- Card issued -->
    <section v-else class="hp-member">
      <div class="hp-preview" :class="{ 'is-revoked': honors.status === 'revoked' }">
        <HonorsCard :tier="honors.tier" :name="guestName(profile)" :member-number="honors.memberNumber" />
      </div>

      <div class="hp-side">
        <div class="hp-head">
          <span class="hp-status" :class="honors.status">{{ honors.status === 'active' ? 'Active' : 'Revoked' }}</span>
          <span class="adm-num hp-number">{{ honors.memberNumber }}</span>
        </div>
        <p class="adm-muted hp-meta">
          Issued {{ formatStamp(honors.createdAt) }}<template v-if="honors.issuedByName"> by {{ honors.issuedByName }}</template>.
          <template v-if="honors.linkUsedAt"><br>Latest link opened to add the card {{ formatStamp(honors.linkUsedAt) }}.</template>
        </p>

        <div class="hp-edit">
          <div class="adm-field">
            <span class="adm-label">Tier</span>
            <div class="adm-seg">
              <button v-for="t in HONORS_TIERS" :key="t" type="button" :class="{ 'is-active': edit.tier === t }" @click="edit.tier = t">{{ HONORS_TIER_LABEL[t] }}</button>
            </div>
          </div>
          <label class="adm-field hp-discount">
            <span class="adm-label">Discount</span>
            <span class="hp-pct"><input v-model.number="edit.discountPercent" type="number" min="0" max="100" step="1" class="adm-input"><span>%</span></span>
          </label>
          <button v-if="editDirty" type="button" class="adm-btn adm-btn-primary adm-btn-sm" :disabled="busy" @click="update({ tier: edit.tier, discountPercent: edit.discountPercent })">Save</button>
        </div>

        <template v-if="honors.status === 'active'">
          <div class="hp-actions">
            <button type="button" class="adm-btn adm-btn-primary" :disabled="busy" @click="showQr">Show QR code</button>
            <button type="button" class="adm-btn" :disabled="busy || !profile.email" :title="profile.email ? `Send to ${profile.email}` : 'Add the guest\'s email on the Profile tab first'" @click="emailLink">
              <AdminIcon name="mail" :size="15" /> Email link
            </button>
          </div>
          <p class="adm-muted hp-hint">
            A new QR code or email replaces the previous link. QR codes work for 30 minutes, emailed links for 7 days.
            <template v-if="wallets?.emailDryRun"><br>Emails are not sent from this copy of the dashboard (dry-run).</template>
          </p>
        </template>

        <p v-if="notice" class="hp-notice">{{ notice }}</p>
        <p v-if="error" class="adm-error">{{ error }}</p>

        <div class="hp-danger">
          <button v-if="honors.status === 'active'" type="button" class="adm-btn adm-btn-sm adm-btn-ghost hp-revoke" :disabled="busy" @click="revoke">Revoke card</button>
          <button v-else type="button" class="adm-btn adm-btn-sm" :disabled="busy" @click="update({ status: 'active' })">Reactivate card</button>
        </div>
      </div>
    </section>

    <!-- QR code for reception -->
    <Transition name="adm-fade">
      <div v-if="qr" class="adm-backdrop hp-qr-backdrop" @click="qr = null" />
    </Transition>
    <Transition name="adm-fade">
      <div v-if="qr" class="adm-modal hp-qr" role="dialog" aria-modal="true" aria-label="QR code to add the card">
        <header class="adm-panel-head">
          <h2 class="hp-qr-title">Scan with the guest's phone camera</h2>
          <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="qr = null"><AdminIcon name="close" /></button>
        </header>
        <div class="adm-panel-body hp-qr-body">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="hp-qr-code" v-html="qr.svg" />
          <p class="hp-qr-name">{{ guestName(profile) }} · {{ HONORS_TIER_LABEL[honors!.tier] }}</p>
          <p class="adm-muted">Works on iPhone and Android. {{ qrRemaining }}</p>
          <button type="button" class="adm-btn adm-btn-sm" @click="copyLink">{{ copied ? 'Copied' : 'Copy link' }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { HONORS_DEFAULT_DISCOUNT, HONORS_TIER_LABEL, HONORS_TIERS } from '#shared/utils/honors'
import type { HonorsTier } from '#shared/utils/honors'
import QRCode from 'qrcode'

type Honors = NonNullable<GuestProfile['honors']>

const props = defineProps<{ profile: GuestProfile }>()
const emit = defineEmits<{ changed: [honors: Honors | null] }>()

const honors = computed(() => props.profile.honors)
const busy = ref(false)
const error = ref('')
const notice = ref('')

interface Wallets { google: boolean, apple: boolean, emailDryRun: boolean }
const wallets = ref<Wallets | null>(null)
onMounted(async () => {
  try {
    wallets.value = await $fetch<Wallets>('/api/admin/honors/wallets')
  } catch {}
})

function flash(message: string) {
  notice.value = message
  setTimeout(() => { if (notice.value === message) notice.value = '' }, 6000)
}

// ---- Issue ----
const form = reactive({ tier: 'platinum' as HonorsTier, discountPercent: HONORS_DEFAULT_DISCOUNT.platinum })

// Switching tier moves the discount along with it, unless staff typed their own.
function pickTier(tier: HonorsTier) {
  if (form.discountPercent === HONORS_DEFAULT_DISCOUNT[form.tier]) form.discountPercent = HONORS_DEFAULT_DISCOUNT[tier]
  form.tier = tier
}

async function issue() {
  busy.value = true
  error.value = ''
  try {
    const created = await $fetch<Honors>('/api/admin/honors', { method: 'POST', body: { guestId: props.profile.id, ...form } })
    emit('changed', created)
  } catch (err) {
    error.value = errorMessage(err, 'Could not issue the card.')
  } finally {
    busy.value = false
  }
}

// ---- Change, revoke ----
const edit = reactive({ tier: 'platinum' as HonorsTier, discountPercent: 0 })
watch(honors, (h) => {
  if (h) Object.assign(edit, { tier: h.tier, discountPercent: h.discountPercent })
}, { immediate: true })
const editDirty = computed(() => !!honors.value && (edit.tier !== honors.value.tier || edit.discountPercent !== honors.value.discountPercent))

async function update(body: Record<string, unknown>) {
  if (!honors.value) return
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ honors: Honors, warning: string | null }>(`/api/admin/honors/${honors.value.id}`, { method: 'PATCH', body })
    emit('changed', res.honors)
    if (res.warning) error.value = res.warning
    else flash(body.status === 'revoked' ? 'Card revoked.' : body.status === 'active' ? 'Card reactivated.' : 'Card updated.')
  } catch (err) {
    error.value = errorMessage(err, 'Could not update the card.')
  } finally {
    busy.value = false
  }
}

function revoke() {
  if (!confirm(`Revoke ${guestName(props.profile)}'s Yana Honors card? It stops working in Google Wallet straight away. An Apple Wallet card stays on the phone, so check the status here when in doubt.`)) return
  qr.value = null
  update({ status: 'revoked' })
}

// ---- Links ----
const qr = ref<{ url: string, svg: string, expiresAt: number } | null>(null)
const copied = ref(false)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(ticker))

const qrRemaining = computed(() => {
  if (!qr.value) return ''
  const mins = Math.ceil((qr.value.expiresAt - now.value) / 60000)
  return mins > 0 ? `Expires in ${mins} min.` : 'This code has expired. Close and show a new one.'
})

async function showQr() {
  if (!honors.value) return
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ url: string, expiresAt: string }>(`/api/admin/honors/${honors.value.id}/link`, { method: 'POST', body: { channel: 'qr' } })
    const svg = await QRCode.toString(res.url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0C1D2F', light: '#FFFFFF' } })
    qr.value = { url: res.url, svg, expiresAt: new Date(res.expiresAt).getTime() }
    copied.value = false
    now.value = Date.now()
    clearInterval(ticker)
    ticker = setInterval(() => { now.value = Date.now() }, 15000)
  } catch (err) {
    error.value = errorMessage(err, 'Could not create the QR code.')
  } finally {
    busy.value = false
  }
}

async function copyLink() {
  if (!qr.value) return
  try {
    await navigator.clipboard.writeText(qr.value.url)
    copied.value = true
  } catch {}
}

async function emailLink() {
  if (!honors.value) return
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ status: string, to: string }>(`/api/admin/honors/${honors.value.id}/link`, { method: 'POST', body: { channel: 'email' } })
    flash(res.status === 'sent' ? `Link emailed to ${res.to}.` : `Email not sent (${res.to}): emails are switched off on this copy of the dashboard.`)
  } catch (err) {
    error.value = errorMessage(err, 'Could not email the link.')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.hp {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hp-warn {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #EFDFC4;
  border-radius: var(--adm-radius);
  background: var(--adm-warm-50);
  font-size: 12.5px;
  color: var(--adm-text-2);
}

.hp-issue {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 460px;
}

.hp-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--adm-heading);
}

.hp-lead {
  margin: 0;
  font-size: 13px;
}

.hp-discount {
  max-width: 140px;
}

.hp-pct {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hp-pct .adm-input {
  width: 80px;
}

.hp-member {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 640px) {
  .hp-member {
    grid-template-columns: 1fr;
  }

  .hp-preview {
    max-width: 240px;
  }
}

.hp-preview.is-revoked {
  filter: grayscale(1);
  opacity: 0.55;
}

.hp-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hp-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hp-status {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
}

.hp-status.active {
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
}

.hp-status.revoked {
  background: var(--adm-surface-2);
  color: var(--adm-danger);
}

.hp-number {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.hp-meta,
.hp-hint {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
}

.hp-edit {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
}

.hp-edit .adm-field {
  margin: 0;
}

.hp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hp-notice {
  margin: 0;
  padding: 8px 12px;
  border: 1px solid var(--adm-success-line);
  border-radius: var(--adm-radius);
  background: var(--adm-success-bg);
  color: var(--adm-success-strong);
  font-size: 13px;
}

.hp-danger {
  padding-top: 12px;
  border-top: 1px solid var(--adm-line);
}

.hp-revoke {
  color: var(--adm-danger);
}

/* Above the guest drawer. */
.hp-qr-backdrop {
  z-index: 70;
}

.hp-qr {
  z-index: 71;
  width: min(420px, calc(100vw - 32px));
}

.hp-qr-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--adm-heading);
}

.hp-qr-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.hp-qr-body p {
  margin: 0;
  font-size: 13px;
}

.hp-qr-code {
  width: min(300px, 100%);
  padding: 12px;
  border-radius: 12px;
  background: #fff;
}

.hp-qr-code :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.hp-qr-name {
  font-weight: 600;
  color: var(--adm-text);
}
</style>
