<template>
  <!-- Text -->
  <label v-if="field.type === 'text'" class="adm-field">
    <span class="adm-label">{{ field.label }}<span v-if="field.required" class="cf-req" aria-hidden="true">*</span></span>
    <input v-model="model" class="adm-input" :maxlength="field.max ?? TEXT_MAX" :placeholder="field.placeholder" :disabled="disabled">
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>
  </label>

  <!-- Web address, optionally picked from the uploaded PDFs -->
  <div v-else-if="field.type === 'url'" class="adm-field">
    <span class="adm-label">{{ field.label }}<span v-if="field.required" class="cf-req" aria-hidden="true">*</span></span>
    <div class="cf-url">
      <input v-model="model" class="adm-input" :placeholder="field.placeholder ?? 'https://… or /page'" :disabled="disabled" :aria-label="field.label">
      <button v-if="field.pdf" type="button" class="adm-btn adm-btn-sm" :disabled="disabled" @click="pdfOpen = true">
        <AdminIcon name="file" :size="15" /> Choose PDF
      </button>
    </div>
    <span v-if="isPdf(model)" class="cf-pdf-note">Opens an uploaded PDF</span>
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>
    <AdminMediaPicker v-if="field.pdf" :open="pdfOpen" kind="pdf" :current="model" @close="pdfOpen = false" @select="item => model = item.url" />
  </div>

  <!-- Choice from a fixed list -->
  <label v-else-if="field.type === 'select'" class="adm-field">
    <span class="adm-label">{{ field.label }}</span>
    <select v-model="model" class="adm-select" :disabled="disabled">
      <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>
  </label>

  <!-- Multi-line text -->
  <label v-else-if="field.type === 'textarea'" class="adm-field">
    <span class="adm-label">{{ field.label }}<span v-if="field.required" class="cf-req" aria-hidden="true">*</span></span>
    <textarea
      v-model="model"
      class="adm-textarea"
      :rows="field.rows ?? 3"
      :maxlength="field.max ?? TEXTAREA_MAX"
      :placeholder="field.placeholder"
      :disabled="disabled"
    />
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>
  </label>

  <!-- On / off -->
  <div v-else-if="field.type === 'toggle'" class="adm-field">
    <label class="adm-switch">
      <input v-model="model" type="checkbox" :disabled="disabled">
      <span class="adm-switch-track" />
      <span>{{ field.label }}</span>
    </label>
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>
  </div>

  <!-- Image -->
  <div v-else-if="field.type === 'image'" class="adm-field">
    <span class="adm-label">{{ field.label }}<span v-if="field.required" class="cf-req" aria-hidden="true">*</span></span>
    <div class="cf-image">
      <button type="button" class="cf-thumb" :disabled="disabled" :aria-label="`Choose ${field.label}`" @click="pickerOpen = true">
        <img v-if="image.src" :src="image.src" :alt="image.alt">
        <span v-else class="cf-thumb-empty"><AdminIcon name="image" :size="22" /></span>
      </button>
      <div class="cf-image-side">
        <div class="cf-image-actions">
          <button type="button" class="adm-btn adm-btn-sm" :disabled="disabled" @click="pickerOpen = true">
            {{ image.src ? 'Replace image' : 'Choose image' }}
          </button>
          <button v-if="image.src && !field.required" type="button" class="adm-btn adm-btn-sm adm-btn-ghost" :disabled="disabled" @click="image.src = ''">
            Remove
          </button>
        </div>
        <input
          v-if="!field.decorative"
          v-model="image.alt"
          class="adm-input"
          maxlength="200"
          placeholder="Describe the image, e.g. Ceviche served on marble"
          :disabled="disabled"
          :aria-label="`${field.label} description`"
        >
        <span class="cf-hint">{{ field.hint ?? 'The description is read by screen readers and Google.' }}</span>
      </div>
    </div>
    <AdminMediaPicker :open="pickerOpen" :current="image.src" @close="pickerOpen = false" @select="onImage" />
  </div>

  <!-- Button / link -->
  <div v-else-if="field.type === 'link'" class="adm-field">
    <span class="adm-label">{{ field.label }}<span v-if="field.required" class="cf-req" aria-hidden="true">*</span></span>
    <div class="cf-link">
      <input v-model="link.label" class="adm-input" maxlength="60" placeholder="Button text" :disabled="disabled" :aria-label="`${field.label} text`">
      <input v-model="link.url" class="adm-input" placeholder="/menu or https://…" :disabled="disabled" :aria-label="`${field.label} link`">
    </div>
    <div class="cf-link-extra">
      <label class="cf-check">
        <input v-model="link.newTab" type="checkbox" :disabled="disabled">
        Open in a new tab
      </label>
      <button v-if="field.pdf" type="button" class="cf-text-btn" :disabled="disabled" @click="pdfOpen = true">
        <AdminIcon name="file" :size="14" /> Link to an uploaded PDF
      </button>
      <span v-if="isPdf(link.url)" class="cf-pdf-note">Opens an uploaded PDF</span>
    </div>
    <AdminMediaPicker v-if="field.pdf" :open="pdfOpen" kind="pdf" :current="link.url" @close="pdfOpen = false" @select="onLinkPdf" />
    <span class="cf-hint">{{ field.hint ?? 'Start with / for a page on this site (e.g. /reservation), or https:// for another website.' }}</span>
  </div>

  <!-- Repeating list -->
  <div v-else-if="field.type === 'list'" class="adm-field">
    <span class="adm-label">
      {{ field.label }}
      <span class="cf-count">{{ items.length }} / {{ field.max }}</span>
    </span>
    <span v-if="field.hint" class="cf-hint">{{ field.hint }}</span>

    <div class="cf-list">
      <div v-for="(item, i) in items" :key="itemKey(item)" class="cf-item" :class="{ 'is-compact': compact }">
        <div class="cf-item-head">
          <button
            v-if="!compact"
            type="button"
            class="cf-item-toggle"
            :aria-expanded="isOpen(item)"
            @click="toggle(item)"
          >
            <AdminIcon :name="isOpen(item) ? 'down' : 'right'" :size="15" />
            <img v-if="itemImage(item)" :src="itemImage(item)" alt="" class="cf-item-thumb">
            <span class="cf-item-title">{{ itemTitle(item, i) }}</span>
          </button>
          <div v-else class="cf-item-fields">
            <ContentField
              v-for="sub in field.fields"
              :key="sub.key"
              v-model="item[sub.key]"
              :field="sub"
              :disabled="disabled"
            />
          </div>
          <div class="cf-item-tools">
            <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" aria-label="Move up" :disabled="disabled || i === 0" @click="move(i, -1)">
              <AdminIcon name="up" :size="15" />
            </button>
            <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm" aria-label="Move down" :disabled="disabled || i === items.length - 1" @click="move(i, 1)">
              <AdminIcon name="down" :size="15" />
            </button>
            <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost adm-btn-sm adm-btn-danger" :aria-label="`Delete ${field.itemLabel.toLowerCase()}`" :disabled="disabled" @click="removeItem(i)">
              <AdminIcon name="trash" :size="15" />
            </button>
          </div>
        </div>
        <div v-if="!compact && isOpen(item)" class="cf-item-body">
          <ContentField
            v-for="sub in field.fields"
            :key="sub.key"
            v-model="item[sub.key]"
            :field="sub"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <button v-if="items.length < field.max" type="button" class="cf-add" :disabled="disabled" @click="addItem">
      + Add {{ field.itemLabel.toLowerCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { emptyItem, TEXT_MAX, TEXTAREA_MAX } from '#shared/content/schema'
import type { ContentField, ImageValue, LinkValue } from '#shared/content/schema'
import type { MediaItem } from './MediaPicker.vue'

const props = defineProps<{ field: ContentField, disabled?: boolean }>()
const model = defineModel<any>()

const image = computed(() => model.value as ImageValue)
const link = computed(() => model.value as LinkValue)
const items = computed(() => (model.value ?? []) as Record<string, any>[])

const pickerOpen = ref(false)
const pdfOpen = ref(false)

function onImage(item: MediaItem) {
  image.value.src = item.url
}

// PDFs open in their own tab so the visitor keeps the website.
function onLinkPdf(item: MediaItem) {
  link.value.url = item.url
  link.value.newTab = true
}

const isPdf = (url: unknown) => typeof url === 'string' && /^\/media\/\d+-[a-f0-9]+\.pdf$/.test(url)

// Short lists of plain text (like opening hours) are edited inline; anything
// richer gets a collapsible card per item.
const compact = computed(() =>
  props.field.type === 'list' && props.field.fields.length <= 2 && props.field.fields.every(f => f.type === 'text'))

// Stable keys for v-for without storing ids in the saved content.
const keys = new WeakMap<object, number>()
let nextKey = 0
function itemKey(item: object) {
  if (!keys.has(item)) keys.set(item, nextKey++)
  return keys.get(item)!
}

const open = ref(new Set<number>())
const isOpen = (item: object) => open.value.has(itemKey(item))
function toggle(item: object) {
  const key = itemKey(item)
  if (!open.value.delete(key)) open.value.add(key)
}

function itemTitle(item: Record<string, any>, i: number) {
  if (props.field.type !== 'list') return ''
  const title = props.field.titleKey ? item[props.field.titleKey] : ''
  return (typeof title === 'string' && title.trim()) || `${props.field.itemLabel} ${i + 1}`
}

function itemImage(item: Record<string, any>) {
  if (props.field.type !== 'list') return ''
  const imageField = props.field.fields.find(f => f.type === 'image')
  return imageField ? (item[imageField.key] as ImageValue)?.src ?? '' : ''
}

function addItem() {
  if (props.field.type !== 'list') return
  const item = reactive(emptyItem(props.field.fields))
  items.value.push(item)
  // Newly added items open straight away so they can be filled in.
  open.value.add(itemKey(items.value[items.value.length - 1]!))
}

function removeItem(i: number) {
  if (props.field.type !== 'list') return
  if (!confirm(`Delete ${itemTitle(items.value[i]!, i)}?`)) return
  items.value.splice(i, 1)
}

function move(i: number, dir: -1 | 1) {
  const [item] = items.value.splice(i, 1)
  if (item) items.value.splice(i + dir, 0, item)
}
</script>

<style scoped>
.cf-req {
  margin-left: 3px;
  color: var(--adm-danger);
}

.cf-hint {
  font-size: 12px;
  color: var(--adm-muted);
}

.cf-count {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--adm-muted);
}

/* Image */
.cf-image {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.cf-thumb {
  flex-shrink: 0;
  width: 132px;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: 1px solid var(--adm-line-strong);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-3);
  overflow: hidden;
  cursor: pointer;
}

.cf-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cf-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--adm-faint);
}

.cf-image-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.cf-image-actions {
  display: flex;
  gap: 6px;
}

/* Address */
.cf-url {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cf-url .adm-btn {
  flex-shrink: 0;
}

.cf-pdf-note {
  font-size: 12px;
  font-weight: 500;
  color: var(--adm-success-strong);
}

/* Link */
.cf-link-extra {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cf-text-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--adm-primary);
  cursor: pointer;
}

.cf-text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cf-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 8px;
}

.cf-check {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--adm-text-2);
  cursor: pointer;
}

/* List */
.cf-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cf-list:empty {
  display: none;
}

.cf-item {
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
}

.cf-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.cf-item.is-compact .cf-item-head {
  align-items: flex-end;
  padding: 10px 10px 10px 12px;
}

.cf-item-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding: 4px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--adm-text);
  text-align: left;
  cursor: pointer;
}

.cf-item-thumb {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  object-fit: cover;
}

.cf-item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cf-item-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.cf-item-tools {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.cf-item-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 6px 14px 16px;
}

.cf-add {
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

.cf-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .cf-image,
  .cf-link {
    display: flex;
    flex-direction: column;
  }

  .cf-url {
    flex-wrap: wrap;
  }

  .cf-item.is-compact .cf-item-head {
    flex-direction: column;
    align-items: stretch;
  }

  .cf-item-tools {
    justify-content: flex-end;
  }
}
</style>
