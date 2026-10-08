<template>
  <div class="bot-page">
    <div class="adm-page-head">
      <div>
        <h1 class="adm-page-title">Website chatbot</h1>
        <p class="adm-page-sub">
          The concierge in the corner of the website. Edit its greeting, options and replies; changes go live within a minute of saving.
        </p>
      </div>
      <div class="bot-head-actions">
        <span v-if="statusText" class="bot-saved" :class="{ 'is-dirty': dirty }">{{ statusText }}</span>
        <button type="button" class="adm-btn" :disabled="!canEdit || saving" @click="resetDefaults">Reset to defaults</button>
        <button type="button" class="adm-btn adm-btn-primary" :disabled="!canEdit || saving || !dirty" @click="save">
          <AdminIcon name="save" :size="16" />
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>

    <p v-if="!canEdit" class="bot-banner">You can preview the chatbot but not change it. Ask a manager for access.</p>
    <p v-if="error" class="adm-error bot-banner">{{ error }}</p>
    <p v-if="loadError" class="adm-error bot-banner">{{ loadError }}</p>

    <div v-if="form" class="bot-layout">
      <!-- ===== Editor ===== -->
      <div class="bot-editor">
        <!-- General -->
        <section class="adm-card bot-card">
          <div class="bot-card-head">
            <h2 class="bot-card-title">General</h2>
            <label class="bot-switch">
              <input v-model="form.enabled" type="checkbox" :disabled="!canEdit">
              <span class="bot-switch-track" />
              <span>{{ form.enabled ? 'Shown on website' : 'Hidden from website' }}</span>
            </label>
          </div>
          <div class="adm-grid-2">
            <label class="adm-field">
              <span class="adm-label">Chat name</span>
              <input v-model="form.name" class="adm-input" :maxlength="LIMITS.label" :disabled="!canEdit">
            </label>
            <label class="adm-field">
              <span class="adm-label">Status line</span>
              <input v-model="form.status" class="adm-input" :maxlength="LIMITS.short" placeholder="e.g. Here to help you book" :disabled="!canEdit">
            </label>
          </div>
          <label class="adm-field bot-gap">
            <span class="adm-label">Greeting</span>
            <textarea v-model="form.greeting" class="adm-textarea" rows="2" :maxlength="LIMITS.greeting" :disabled="!canEdit" />
            <span class="bot-hint">The first message guests see. Each new line becomes its own line in the chat.</span>
          </label>
        </section>

        <!-- Contact details used by buttons -->
        <section class="adm-card bot-card">
          <div class="bot-card-head">
            <h2 class="bot-card-title">Contact details</h2>
          </div>
          <p class="bot-hint bot-hint--top">Used by the WhatsApp, Call and Google Maps buttons, and the green WhatsApp button on the website.</p>
          <div class="adm-grid-2">
            <label class="adm-field">
              <span class="adm-label">WhatsApp number</span>
              <input v-model="form.whatsappNumber" class="adm-input" inputmode="tel" placeholder="971501906122" :disabled="!canEdit">
              <span class="bot-hint">Country code and number, digits only.</span>
            </label>
            <label class="adm-field">
              <span class="adm-label">Phone number</span>
              <input v-model="form.phone" class="adm-input" inputmode="tel" :disabled="!canEdit">
            </label>
          </div>
          <label class="adm-field bot-gap">
            <span class="adm-label">WhatsApp starting message</span>
            <input v-model="form.whatsappMessage" class="adm-input" :maxlength="LIMITS.short" :disabled="!canEdit">
            <span class="bot-hint">Pre-filled in WhatsApp when a guest taps a WhatsApp button.</span>
          </label>
          <label class="adm-field bot-gap">
            <span class="adm-label">Google Maps link</span>
            <input v-model="form.mapsUrl" class="adm-input" type="url" :disabled="!canEdit">
          </label>
        </section>

        <!-- Options -->
        <section class="adm-card bot-card">
          <div class="bot-card-head">
            <h2 class="bot-card-title">Options &amp; replies <span class="bot-count">{{ form.topics.length }} / {{ LIMITS.topics }}</span></h2>
            <button type="button" class="adm-btn adm-btn-sm" :disabled="!canEdit || form.topics.length >= LIMITS.topics" @click="addTopic">
              <AdminIcon name="plus" :size="15" /> Add option
            </button>
          </div>

          <div v-for="(topic, i) in form.topics" :key="topic.id" class="bot-topic" :class="{ 'is-off': !topic.enabled }">
            <div class="bot-topic-head">
              <span class="bot-topic-num">{{ i + 1 }}</span>
              <input v-model="topic.label" class="adm-input bot-topic-label" placeholder="Button label, e.g. Opening hours" :maxlength="LIMITS.label" :disabled="!canEdit">
              <label class="bot-switch bot-switch--sm" :title="topic.enabled ? 'Shown' : 'Hidden'">
                <input v-model="topic.enabled" type="checkbox" :disabled="!canEdit">
                <span class="bot-switch-track" />
              </label>
              <div class="bot-topic-tools">
                <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" aria-label="Move up" :disabled="!canEdit || i === 0" @click="moveTopic(i, -1)">
                  <AdminIcon name="up" :size="15" />
                </button>
                <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" aria-label="Move down" :disabled="!canEdit || i === form.topics.length - 1" @click="moveTopic(i, 1)">
                  <AdminIcon name="down" :size="15" />
                </button>
                <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm adm-btn-danger" aria-label="Delete option" :disabled="!canEdit" @click="removeTopic(i)">
                  <AdminIcon name="trash" :size="15" />
                </button>
              </div>
            </div>

            <label class="adm-field">
              <span class="adm-label">Reply</span>
              <textarea v-model="topic.reply" class="adm-textarea" rows="3" :maxlength="LIMITS.reply" placeholder="What the concierge answers" :disabled="!canEdit" />
            </label>

            <div class="bot-actions">
              <span class="adm-label">Buttons under the reply</span>
              <div v-for="(action, j) in topic.actions" :key="j" class="bot-action">
                <select v-model="action.type" class="adm-select" :disabled="!canEdit" @change="onActionType(action)">
                  <option v-for="type in ACTION_TYPES" :key="type" :value="type">{{ ACTION_META[type].name }}</option>
                </select>
                <input v-model="action.label" class="adm-input" placeholder="Button text" :maxlength="LIMITS.label" :disabled="!canEdit">
                <input v-if="action.type === 'link'" v-model="action.url" class="adm-input" placeholder="/about or https://…" :disabled="!canEdit">
                <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" aria-label="Remove button" :disabled="!canEdit" @click="topic.actions.splice(j, 1)">
                  <AdminIcon name="close" :size="15" />
                </button>
              </div>
              <button
                v-if="topic.actions.length < LIMITS.actionsPerTopic"
                type="button"
                class="bot-add-action"
                :disabled="!canEdit"
                @click="topic.actions.push({ type: 'book', label: ACTION_META.book.defaultLabel })"
              >
                + Add button
              </button>
            </div>
          </div>

          <p v-if="!form.topics.length" class="adm-empty">No options yet. Add one so guests have something to pick.</p>
        </section>
      </div>

      <!-- ===== Live preview ===== -->
      <aside class="bot-preview-wrap">
        <p class="adm-label bot-preview-label">Live preview</p>
        <div class="bot-preview" :class="{ 'is-hidden': !form.enabled }">
          <header class="pv-head">
            <span class="pv-avatar"><img src="/images/yana-logo-gold.svg" alt=""></span>
            <div>
              <p class="pv-name">{{ form.name || 'Chat name' }}</p>
              <p v-if="form.status" class="pv-status"><span class="pv-dot" />{{ form.status }}</p>
            </div>
          </header>
          <div class="pv-thread">
            <div class="pv-msg pv-msg--bot">
              <p v-for="(line, k) in lines(form.greeting)" :key="k">{{ line }}</p>
            </div>
            <template v-if="previewTopic">
              <div class="pv-msg pv-msg--guest"><p>{{ previewTopic.label }}</p></div>
              <div class="pv-msg pv-msg--bot">
                <p v-for="(line, k) in lines(previewTopic.reply)" :key="k">{{ line }}</p>
                <div v-if="previewTopic.actions.length" class="pv-actions">
                  <span
                    v-for="(action, k) in previewTopic.actions"
                    :key="k"
                    class="pv-action"
                    :class="{ 'is-primary': action.type === 'book', 'is-whatsapp': action.type === 'whatsapp' }"
                  >{{ action.label || ACTION_META[action.type].defaultLabel }}</span>
                </div>
              </div>
            </template>
          </div>
          <div class="pv-options">
            <button
              v-for="topic in form.topics.filter(t => t.enabled && t.label)"
              :key="topic.id"
              type="button"
              class="pv-chip"
              :class="{ 'is-active': previewTopic?.id === topic.id }"
              @click="previewId = topic.id"
            >
              {{ topic.label }}
            </button>
          </div>
        </div>
        <p class="bot-hint bot-preview-note">
          {{ form.enabled ? 'Tap an option to preview its reply.' : 'The chatbot is hidden. Guests won\'t see it until you switch it back on.' }}
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CONCIERGE_ACTION_META as ACTION_META,
  CONCIERGE_ACTION_TYPES as ACTION_TYPES,
  CONCIERGE_LIMITS as LIMITS
} from '#shared/utils/concierge'
import type { ConciergeAction, ConciergeConfig } from '#shared/utils/concierge'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Website chatbot · YANA admin' })

interface ConciergeResponse { config: ConciergeConfig, updatedAt: string | null, isDefault: boolean }

const { ready, can } = useAdminAccess()
await ready
const canEdit = computed(() => can('chatbot'))

const { data, error: fetchError } = await useFetch<ConciergeResponse>('/api/admin/concierge')
const loadError = computed(() => fetchError.value ? 'Could not load the chatbot settings. If you just updated the site, restart the server so the database is up to date.' : '')

const form = ref<ConciergeConfig | null>(null)
const saved = ref('')
const updatedAt = ref<string | null>(null)
const isDefault = ref(true)
const saving = ref(false)
const error = ref('')
const previewId = ref<string | null>(null)

function load(res: ConciergeResponse) {
  form.value = structuredClone(res.config)
  saved.value = JSON.stringify(res.config)
  updatedAt.value = res.updatedAt
  isDefault.value = res.isDefault
  previewId.value = res.config.topics.find(t => t.enabled)?.id ?? null
}
if (data.value) load(data.value)

const dirty = computed(() => !!form.value && JSON.stringify(form.value) !== saved.value)

const statusText = computed(() => {
  if (dirty.value) return 'Unsaved changes'
  if (isDefault.value) return 'Using the default replies'
  if (updatedAt.value) return `Saved ${new Date(updatedAt.value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
  return ''
})

const previewTopic = computed(() => form.value?.topics.find(t => t.id === previewId.value && t.enabled) ?? null)

const lines = (text: string) => (text || '').split('\n').map(l => l.trim()).filter(Boolean)

function addTopic() {
  if (!form.value) return
  const id = `option-${Date.now().toString(36)}`
  form.value.topics.push({ id, enabled: true, label: '', reply: '', actions: [{ type: 'book', label: ACTION_META.book.defaultLabel }] })
  previewId.value = id
}

function removeTopic(i: number) {
  if (!form.value) return
  const topic = form.value.topics[i]
  if (topic?.label && !confirm(`Delete the "${topic.label}" option?`)) return
  form.value.topics.splice(i, 1)
}

function moveTopic(i: number, dir: -1 | 1) {
  const topics = form.value?.topics
  if (!topics) return
  const [item] = topics.splice(i, 1)
  if (item) topics.splice(i + dir, 0, item)
}

// Switching a button's type swaps in that type's usual wording if the text
// was still the previous type's default.
function onActionType(action: ConciergeAction) {
  const defaults = Object.values(ACTION_META).map(m => m.defaultLabel)
  if (!action.label || defaults.includes(action.label)) action.label = ACTION_META[action.type].defaultLabel
  if (action.type !== 'link') delete action.url
}

function validate(config: ConciergeConfig) {
  for (const [i, t] of config.topics.entries()) {
    if (!t.label.trim()) return `Option ${i + 1} needs a button label.`
    if (!t.reply.trim()) return `"${t.label}" needs a reply.`
    for (const a of t.actions) {
      if (a.type === 'link' && !/^\/(?!\/)|^https?:\/\//i.test(a.url?.trim() ?? '')) {
        return `"${t.label}": custom links must start with / or https://`
      }
    }
  }
  if (!config.topics.some(t => t.enabled)) return 'Keep at least one option switched on.'
  if (!/^\d{8,15}$/.test(config.whatsappNumber.replace(/\D/g, ''))) return 'Enter the WhatsApp number with country code, e.g. 971501906122.'
  return ''
}

async function save() {
  if (!form.value) return
  error.value = validate(form.value)
  if (error.value) return
  saving.value = true
  try {
    load(await $fetch<ConciergeResponse>('/api/admin/concierge', { method: 'PUT', body: { config: form.value } }))
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not save the chatbot.'
  } finally {
    saving.value = false
  }
}

async function resetDefaults() {
  if (!confirm('Reset the chatbot to the original greeting, options and replies? Your edits will be lost.')) return
  saving.value = true
  error.value = ''
  try {
    load(await $fetch<ConciergeResponse>('/api/admin/concierge', { method: 'PUT', body: { reset: true } }))
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Could not reset the chatbot.'
  } finally {
    saving.value = false
  }
}

onBeforeRouteLeave(() => {
  if (dirty.value && !confirm('You have unsaved chatbot changes. Leave anyway?')) return false
})
</script>

<style scoped>
.bot-head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bot-saved {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.bot-saved.is-dirty {
  color: var(--adm-accent-dk);
  font-weight: 500;
}

.bot-banner {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  border: 1px solid var(--adm-line);
  font-size: 13px;
}

.bot-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 22px;
  align-items: start;
}

.bot-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.bot-card {
  padding: 20px;
}

.bot-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.bot-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--adm-text);
}

.bot-count {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--adm-muted);
}

.bot-gap {
  margin-top: 14px;
}

.bot-hint {
  font-size: 12px;
  color: var(--adm-muted);
}

.bot-hint--top {
  margin: -6px 0 14px;
}

/* Toggle switch */
.bot-switch {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--adm-text);
  cursor: pointer;
  user-select: none;
}

.bot-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.bot-switch-track {
  position: relative;
  flex-shrink: 0;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--adm-line-strong);
  transition: background 0.2s;
}

.bot-switch-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.bot-switch input:checked + .bot-switch-track {
  background: var(--adm-success);
}

.bot-switch input:checked + .bot-switch-track::after {
  transform: translateX(16px);
}

.bot-switch input:focus-visible + .bot-switch-track {
  box-shadow: 0 0 0 3px rgba(18, 66, 109, 0.2);
}

.bot-switch input:disabled + .bot-switch-track {
  opacity: 0.6;
}

/* Option rows */
.bot-topic {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.bot-topic + .bot-topic {
  margin-top: 12px;
}

.bot-topic.is-off {
  opacity: 0.6;
}

.bot-topic-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-topic-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--adm-nav);
  color: var(--adm-accent);
  font-size: 12px;
  font-weight: 600;
}

.bot-topic-label {
  font-weight: 500;
}

.bot-topic-tools {
  display: flex;
  gap: 2px;
}

.bot-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bot-action {
  display: grid;
  grid-template-columns: minmax(150px, 1.1fr) minmax(120px, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.bot-action:has(input + input) {
  grid-template-columns: minmax(150px, 1fr) minmax(110px, 0.9fr) minmax(130px, 1fr) auto;
}

.bot-add-action {
  align-self: flex-start;
  padding: 4px 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--adm-primary);
  cursor: pointer;
}

.bot-add-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Preview (mirrors the website widget) ===== */
.bot-preview-wrap {
  position: sticky;
  top: 20px;
}

.bot-preview-label {
  margin: 0 0 8px;
}

.bot-preview {
  display: flex;
  flex-direction: column;
  height: 560px;
  background: #F3ECE1;
  border: 1px solid rgba(217, 182, 144, 0.45);
  border-radius: 6px;
  box-shadow: var(--adm-shadow-lg);
  overflow: hidden;
  font-family: var(--sans);
  transition: opacity 0.2s, filter 0.2s;
}

.bot-preview.is-hidden {
  opacity: 0.45;
  filter: grayscale(0.6);
}

.pv-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(180deg, #08172a, #0d2440);
}

.pv-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(217, 182, 144, 0.6);
  border-radius: 50%;
}

.pv-avatar img {
  width: 26px;
}

.pv-name {
  margin: 0;
  font-size: 12.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  color: #D9B690;
}

.pv-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 3px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.pv-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
}

.pv-thread {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 16px;
}

.pv-msg {
  max-width: 86%;
  padding: 11px 14px;
  font-size: 13.5px;
  line-height: 1.55;
}

.pv-msg p {
  margin: 0;
  white-space: pre-wrap;
}

.pv-msg p + p {
  margin-top: 4px;
}

.pv-msg--bot {
  align-self: flex-start;
  background: #fff;
  color: #0F1E2E;
  border: 1px solid rgba(217, 182, 144, 0.35);
}

.pv-msg--guest {
  align-self: flex-end;
  background: #0F1E2E;
  color: #fff;
}

.pv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pv-action {
  padding: 8px 12px;
  border: 1px solid rgba(138, 107, 69, 0.5);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: #8A6B45;
}

.pv-action.is-primary {
  background: #D9B690;
  border-color: #D9B690;
  color: #0F1E2E;
}

.pv-action.is-whatsapp {
  border-color: #25d366;
  color: #128c4b;
}

.pv-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px 16px;
  border-top: 1px solid rgba(217, 182, 144, 0.35);
  background: rgba(255, 255, 255, 0.5);
}

.pv-chip {
  padding: 8px 13px;
  border: 1px solid rgba(15, 30, 46, 0.25);
  border-radius: 999px;
  background: #fff;
  font-family: inherit;
  font-size: 12.5px;
  color: #0F1E2E;
  cursor: pointer;
}

.pv-chip.is-active,
.pv-chip:hover {
  background: #0F1E2E;
  border-color: #0F1E2E;
  color: #fff;
}

.bot-preview-note {
  display: block;
  margin-top: 10px;
}

@media (max-width: 1180px) {
  .bot-layout {
    grid-template-columns: 1fr;
  }

  .bot-preview-wrap {
    position: static;
    max-width: 420px;
  }
}

@media (max-width: 640px) {
  .bot-action,
  .bot-action:has(input + input) {
    grid-template-columns: 1fr auto;
  }

  .bot-action .adm-select {
    grid-column: 1 / -1;
  }
}
</style>
