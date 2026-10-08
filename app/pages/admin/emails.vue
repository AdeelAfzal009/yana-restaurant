<template>
  <div class="em-page">
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Email templates</h1>
        <p class="adm-page-sub">The wording of every reservation email. The YANA design and booking details are added automatically.</p>
      </div>
      <div class="em-head-actions">
        <span v-if="statusText" class="em-saved" :class="{ 'is-dirty': dirty }">{{ statusText }}</span>
        <button type="button" class="adm-btn" :disabled="!canEdit || saving" @click="resetAll">Reset all to defaults</button>
        <button type="button" class="adm-btn adm-btn-primary" :disabled="!canEdit || saving || !dirty" @click="save">
          <AdminIcon name="save" :size="16" />
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>

    <p v-if="!canEdit" class="em-banner">You can preview the email templates but not change them. Ask a manager for access.</p>
    <p v-if="loadError" class="adm-error em-banner">{{ loadError }}</p>
    <p v-if="error" class="adm-error em-banner">{{ error }}</p>
    <p v-if="notice" class="em-banner em-banner--ok">{{ notice }}</p>

    <template v-if="form">
      <!-- Template picker -->
      <div class="em-tabs" role="tablist">
        <button
          v-for="key in TEMPLATE_KEYS"
          :key="key"
          type="button"
          role="tab"
          class="em-tab"
          :class="{ 'is-active': active === key }"
          :aria-selected="active === key"
          @click="active = key"
        >
          <span class="em-tab-name">{{ META[key].name }}</span>
          <span class="em-tab-aud" :class="`is-${META[key].audience.toLowerCase()}`">{{ META[key].audience }}</span>
          <span v-if="isEdited(key)" class="em-tab-dot" title="Changed from default" />
        </button>
      </div>

      <div class="em-layout">
        <!-- ===== Editor ===== -->
        <div class="em-editor">
          <section class="adm-card em-card">
            <div class="em-card-head">
              <div>
                <h2 class="em-card-title">{{ META[active].name }}</h2>
                <p class="em-hint">{{ META[active].when }}</p>
              </div>
              <button type="button" class="adm-btn adm-btn-sm" :disabled="!canEdit || !isEdited(active)" @click="resetTemplate">
                Reset this email
              </button>
            </div>

            <div class="em-placeholders">
              <span class="adm-label">Insert guest details</span>
              <div class="em-chips">
                <button
                  v-for="p in PLACEHOLDERS"
                  :key="p.key"
                  type="button"
                  class="em-chip"
                  :title="p.label"
                  :disabled="!canEdit"
                  @mousedown.prevent
                  @click="insertPlaceholder(p.key)"
                  v-text="tagOf(p.key)"
                />
              </div>
              <span class="em-hint">Click a field, then a tag, to add it where your cursor is. Hover a tag to see what it shows.</span>
            </div>

            <label class="adm-field">
              <span class="adm-label">Subject line</span>
              <input v-model="current.subject" class="adm-input" :maxlength="LIMITS.subject" :disabled="!canEdit" @focus="track($event, 'subject')">
            </label>
            <label class="adm-field">
              <span class="adm-label">Inbox preview text</span>
              <input v-model="current.preheader" class="adm-input" :maxlength="LIMITS.preheader" :disabled="!canEdit" @focus="track($event, 'preheader')">
              <span class="em-hint">The grey line shown after the subject in most inboxes.</span>
            </label>
            <label class="adm-field">
              <span class="adm-label">Heading</span>
              <input v-model="current.heading" class="adm-input" :maxlength="LIMITS.heading" :disabled="!canEdit" @focus="track($event, 'heading')">
            </label>
            <label class="adm-field">
              <span class="adm-label">Opening message</span>
              <textarea v-model="current.intro" class="adm-textarea" rows="4" :maxlength="LIMITS.intro" :disabled="!canEdit" @focus="track($event, 'intro')" />
              <span class="em-hint">Shown above the booking details (reference, date, time, guests), which are added automatically.</span>
            </label>
            <label class="adm-field">
              <span class="adm-label">Extra paragraph <em>(optional)</em></span>
              <textarea v-model="current.body" class="adm-textarea" rows="3" :maxlength="LIMITS.body" :disabled="!canEdit" @focus="track($event, 'body')" />
              <span class="em-hint">Shown below the booking details, e.g. arrival or dress-code notes.</span>
            </label>
            <div class="adm-grid-2">
              <label class="adm-field">
                <span class="adm-label">Button text <em>(optional)</em></span>
                <input v-model="current.ctaLabel" class="adm-input" :maxlength="LIMITS.ctaLabel" :disabled="!canEdit" @focus="track($event, 'ctaLabel')">
              </label>
              <label class="adm-field">
                <span class="adm-label">Button link</span>
                <input v-model="current.ctaUrl" class="adm-input" :maxlength="LIMITS.ctaUrl" placeholder="https://… or {{siteUrl}}/menu" :disabled="!canEdit" @focus="track($event, 'ctaUrl')">
              </label>
            </div>
            <p v-if="ctaWarning" class="em-warn">{{ ctaWarning }}</p>
            <label class="adm-field">
              <span class="adm-label">Footer note <em>(optional)</em></span>
              <textarea v-model="current.footerNote" class="adm-textarea" rows="2" :maxlength="LIMITS.footerNote" :disabled="!canEdit" @focus="track($event, 'footerNote')" />
            </label>
          </section>

          <section class="adm-card em-card">
            <div class="em-card-head">
              <div>
                <h2 class="em-card-title">Shared across all emails</h2>
                <p class="em-hint">Changing these updates every email.</p>
              </div>
            </div>
            <label class="adm-field">
              <span class="adm-label">Tagline under the logo</span>
              <input v-model="form.shared.tagline" class="adm-input" :maxlength="LIMITS.tagline" :disabled="!canEdit" @focus="track($event, 'tagline')">
            </label>
            <label class="adm-field">
              <span class="adm-label">"Change or cancel" line <em>(guest emails)</em></span>
              <textarea v-model="form.shared.changeNote" class="adm-textarea" rows="2" :maxlength="LIMITS.changeNote" :disabled="!canEdit" @focus="track($event, 'changeNote')" />
              <span class="em-hint"><code v-pre>{{phone}}</code> becomes a tap-to-call link.</span>
            </label>
            <label class="adm-field">
              <span class="adm-label">Address in the footer</span>
              <input v-model="form.shared.address" class="adm-input" :maxlength="LIMITS.address" :disabled="!canEdit" @focus="track($event, 'address')">
            </label>
          </section>
        </div>

        <!-- ===== Preview ===== -->
        <aside class="em-preview-wrap">
          <div class="em-preview-bar">
            <span class="adm-label">Preview <span class="em-sample">with a sample booking</span></span>
            <div class="em-seg">
              <button type="button" :class="{ 'is-active': device === 'desktop' }" @click="device = 'desktop'">Desktop</button>
              <button type="button" :class="{ 'is-active': device === 'mobile' }" @click="device = 'mobile'">Mobile</button>
            </div>
          </div>

          <div class="em-inbox">
            <p class="em-inbox-from">YANA Restaurant</p>
            <p class="em-inbox-subject">{{ preview?.subject || ' ' }}</p>
          </div>

          <div class="em-frame-wrap" :class="`is-${device}`">
            <iframe
              v-if="preview"
              :srcdoc="preview.html"
              class="em-frame"
              title="Email preview"
              sandbox=""
            />
            <div v-if="previewing" class="em-frame-loading">Updating…</div>
          </div>

          <div class="em-test">
            <button type="button" class="adm-btn" :disabled="!canEdit || testing" @click="sendTest">
              <AdminIcon name="mail" :size="16" />
              {{ testing ? 'Sending…' : 'Send test to me' }}
            </button>
            <span class="em-hint">Sends this email (including unsaved changes) to {{ myEmail || 'your address' }}.</span>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  DEFAULT_EMAIL_CONTENT,
  EMAIL_FIELD_LIMITS as LIMITS,
  EMAIL_PLACEHOLDERS as PLACEHOLDERS,
  EMAIL_TEMPLATE_KEYS as TEMPLATE_KEYS,
  EMAIL_TEMPLATE_META as META
} from '#shared/utils/email-content'
import type { EmailContent, EmailSharedContent, EmailTemplateContent, EmailTemplateKey } from '#shared/utils/email-content'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Email templates · YANA admin' })

interface ContentResponse { config: EmailContent, updatedAt: string | null, isDefault: boolean }
type FieldKey = keyof EmailTemplateContent | keyof EmailSharedContent

const { ready, user, can } = useAdminAccess()
await ready
const canEdit = computed(() => can('emails'))
const myEmail = computed(() => user.value?.email ?? '')

const { data, error: fetchError } = await useFetch<ContentResponse>('/api/admin/email-templates')
const loadError = computed(() => fetchError.value ? 'Could not load the email templates. If you just updated the site, restart the server so the database is up to date.' : '')

const form = ref<EmailContent | null>(null)
const saved = ref('')
const updatedAt = ref<string | null>(null)
const isDefault = ref(true)
const active = ref<EmailTemplateKey>('booking_received')
const saving = ref(false)
const error = ref('')
const notice = ref('')

function load(res: ContentResponse) {
  form.value = structuredClone(res.config)
  saved.value = JSON.stringify(res.config)
  updatedAt.value = res.updatedAt
  isDefault.value = res.isDefault
}
if (data.value) load(data.value)

// The template being edited. Always defined once the form has loaded.
const current = computed(() => form.value!.templates[active.value])

const dirty = computed(() => !!form.value && JSON.stringify(form.value) !== saved.value)

const statusText = computed(() => {
  if (dirty.value) return 'Unsaved changes'
  if (isDefault.value) return 'Using the default wording'
  if (updatedAt.value) return `Saved ${new Date(updatedAt.value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
  return ''
})

const isEdited = (key: EmailTemplateKey) =>
  !!form.value && JSON.stringify(form.value.templates[key]) !== JSON.stringify(DEFAULT_EMAIL_CONTENT.templates[key])

const ctaWarning = computed(() => {
  const t = form.value?.templates[active.value]
  if (!t) return ''
  if (t.ctaLabel && !t.ctaUrl) return 'Add a link, or the button won\'t be shown.'
  if (t.ctaUrl && !/^(https?:\/\/|\{\{\s*siteUrl\s*\}\})/i.test(t.ctaUrl)) return 'Links must start with https:// or {{siteUrl}}, or the button won\'t be shown.'
  return ''
})

// ---- Placeholder insertion -------------------------------------------------
// Built in script because a literal "}}" inside a template expression would end it early.
const tagOf = (name: string) => `{{${name}}}`

let lastField: { el: HTMLInputElement | HTMLTextAreaElement, key: FieldKey } | null = null

function track(e: FocusEvent, key: FieldKey) {
  lastField = { el: e.target as HTMLInputElement | HTMLTextAreaElement, key }
}

function insertPlaceholder(name: string) {
  if (!form.value) return
  const tag = tagOf(name)
  const target = lastField ?? { el: null, key: 'intro' as FieldKey }
  const isShared = target.key in form.value.shared
  const obj = (isShared ? form.value.shared : current.value) as unknown as Record<string, string>
  const value = obj[target.key] ?? ''
  const el = target.el
  const start = el?.selectionStart ?? value.length
  const end = el?.selectionEnd ?? value.length
  obj[target.key] = value.slice(0, start) + tag + value.slice(end)
  nextTick(() => {
    if (!el) return
    el.focus()
    el.setSelectionRange(start + tag.length, start + tag.length)
  })
}

// ---- Preview ---------------------------------------------------------------
const preview = ref<{ subject: string, html: string } | null>(null)
const previewing = ref(false)
const device = ref<'desktop' | 'mobile'>('desktop')
let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewSeq = 0

async function refreshPreview() {
  if (!form.value) return
  const seq = ++previewSeq
  previewing.value = true
  try {
    const res = await $fetch<{ subject: string, html: string }>('/api/admin/email-templates/preview', {
      method: 'POST',
      body: { template: active.value, content: form.value }
    })
    if (seq === previewSeq) preview.value = res
  } catch {
    // Keep the last good preview on screen.
  } finally {
    if (seq === previewSeq) previewing.value = false
  }
}

watch([form, active], () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(refreshPreview, 350)
}, { deep: true })

onMounted(refreshPreview)
onUnmounted(() => clearTimeout(previewTimer))

// ---- Actions ---------------------------------------------------------------
function flash(message: string) {
  notice.value = message
  setTimeout(() => { if (notice.value === message) notice.value = '' }, 5000)
}

async function save() {
  if (!form.value) return
  error.value = ''
  for (const key of TEMPLATE_KEYS) {
    const t = form.value.templates[key]
    if (!t.subject.trim() || !t.heading.trim() || !t.intro.trim()) {
      active.value = key
      error.value = `"${META[key].name}" needs a subject, heading and opening message.`
      return
    }
  }
  saving.value = true
  try {
    load(await $fetch<ContentResponse>('/api/admin/email-templates', { method: 'PUT', body: { content: form.value } }))
    flash('Saved. New emails will use this wording.')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not save the email templates.'
  } finally {
    saving.value = false
  }
}

function resetTemplate() {
  if (!form.value) return
  if (!confirm(`Reset "${META[active.value].name}" to the original wording? Save afterwards to apply it.`)) return
  form.value.templates[active.value] = structuredClone(DEFAULT_EMAIL_CONTENT.templates[active.value])
}

async function resetAll() {
  if (!confirm('Reset every email and the shared footer to the original wording? This takes effect immediately.')) return
  saving.value = true
  error.value = ''
  try {
    load(await $fetch<ContentResponse>('/api/admin/email-templates', { method: 'PUT', body: { reset: true } }))
    flash('All emails are back to the original wording.')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not reset the email templates.'
  } finally {
    saving.value = false
  }
}

const testing = ref(false)
async function sendTest() {
  if (!form.value) return
  testing.value = true
  error.value = ''
  try {
    const res = await $fetch<{ status: string, error?: string, to: string }>('/api/admin/email-templates/test', {
      method: 'POST',
      body: { template: active.value, content: form.value }
    })
    if (res.status === 'sent') flash(`Test email sent to ${res.to}.`)
    else if (res.status === 'skipped') flash(`Not sent: ${res.error}. Email sending isn't switched on in this environment.`)
    else error.value = `Test email failed: ${res.error}`
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not send the test email.'
  } finally {
    testing.value = false
  }
}

onBeforeRouteLeave(() => {
  if (dirty.value && !confirm('You have unsaved email changes. Leave anyway?')) return false
})
</script>

<style scoped>
.em-head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.em-saved {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.em-saved.is-dirty {
  color: var(--adm-accent-dk);
  font-weight: 500;
}

.em-banner {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
  font-size: 13px;
}

.em-banner--ok {
  border-color: rgba(30, 138, 90, 0.3);
  background: rgba(30, 138, 90, 0.07);
  color: #17704a;
}

/* Tabs */
.em-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.em-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--adm-line-strong);
  border-radius: 999px;
  background: var(--adm-surface);
  font-family: inherit;
  font-size: 13px;
  color: var(--adm-text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.em-tab:hover {
  border-color: var(--adm-muted);
}

.em-tab.is-active {
  background: var(--adm-nav);
  border-color: var(--adm-nav);
  color: #fff;
}

.em-tab-aud {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  background: rgba(18, 66, 109, 0.1);
  color: var(--adm-primary);
}

.em-tab-aud.is-staff {
  background: rgba(217, 182, 144, 0.25);
  color: var(--adm-accent-dk);
}

.em-tab.is-active .em-tab-aud {
  background: rgba(255, 255, 255, 0.14);
  color: var(--adm-accent);
}

.em-tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--adm-accent);
}

/* Layout */
.em-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.em-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.em-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.em-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.em-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--adm-text);
}

.em-hint {
  display: block;
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--adm-muted);
}

.em-hint code {
  font-size: 11.5px;
}

.adm-label em {
  font-style: normal;
  text-transform: none;
  letter-spacing: 0;
  color: var(--adm-faint);
}

.em-warn {
  margin: -6px 0 0;
  font-size: 12.5px;
  color: var(--adm-accent-dk);
}

.em-placeholders {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px dashed var(--adm-line-strong);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.em-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.em-chip {
  padding: 4px 9px;
  border: 1px solid rgba(138, 107, 69, 0.35);
  border-radius: 6px;
  background: var(--adm-surface);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--adm-accent-dk);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.em-chip:hover:not(:disabled) {
  background: var(--adm-accent-dk);
  color: #fff;
}

.em-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Preview */
.em-preview-wrap {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.em-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.em-sample {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  color: var(--adm-faint);
}

.em-seg {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface);
}

.em-seg button {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: none;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--adm-muted);
  cursor: pointer;
}

.em-seg button.is-active {
  background: var(--adm-nav);
  color: #fff;
}

.em-inbox {
  padding: 12px 14px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius) var(--adm-radius) 0 0;
  background: var(--adm-surface);
}

.em-inbox-from {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--adm-text);
}

.em-inbox-subject {
  margin: 3px 0 0;
  font-size: 13.5px;
  color: var(--adm-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.em-frame-wrap {
  position: relative;
  margin-top: -10px;
  height: calc(100vh - 260px);
  min-height: 520px;
  border: 1px solid var(--adm-line);
  border-top: none;
  border-radius: 0 0 var(--adm-radius) var(--adm-radius);
  background: #F3ECE1;
  overflow: hidden;
}

.em-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  margin: 0 auto;
  background: #F3ECE1;
  transition: width 0.25s ease;
}

.em-frame-wrap.is-mobile .em-frame {
  width: 375px;
  max-width: 100%;
  border-left: 1px solid var(--adm-line);
  border-right: 1px solid var(--adm-line);
}

.em-frame-loading {
  position: absolute;
  top: 10px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 30, 46, 0.75);
  font-size: 11.5px;
  color: #fff;
}

.em-test {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.em-test .em-hint {
  margin: 0;
}

@media (max-width: 1180px) {
  .em-layout {
    grid-template-columns: 1fr;
  }

  .em-preview-wrap {
    position: static;
  }

  .em-frame-wrap {
    height: 640px;
  }
}
</style>
