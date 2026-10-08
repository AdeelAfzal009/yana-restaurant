<template>
  <Transition name="adm-fade">
    <div v-if="open" class="adm-backdrop" @click="emit('close')" />
  </Transition>
  <Transition name="adm-fade">
    <div
      v-if="open"
      class="adm-modal mp"
      :class="{ 'is-dragging': dragging }"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @dragover.prevent="dragging = true"
      @dragleave.self="dragging = false"
      @drop.prevent="onDrop"
    >
      <header class="adm-panel-head">
        <div>
          <h2 class="mp-title">{{ title }}</h2>
          <p class="adm-page-sub">
            {{ kind === 'pdf' ? 'Upload a PDF (up to 10 MB) or pick one you uploaded before.' : 'Upload a photo or pick one from the library. Large photos are resized automatically.' }}
          </p>
        </div>
        <button type="button" class="adm-btn adm-btn-icon adm-btn-ghost" aria-label="Close" @click="emit('close')">
          <AdminIcon name="close" />
        </button>
      </header>

      <div class="adm-panel-body">
        <div class="mp-toolbar">
          <label class="adm-btn adm-btn-primary mp-upload" :class="{ 'is-busy': uploading }">
            <AdminIcon name="upload" :size="16" />
            {{ uploading ? uploadText : `Upload ${kind === 'pdf' ? 'PDF' : 'images'}` }}
            <input type="file" :accept="accept" multiple :disabled="uploading" @change="onPick">
          </label>
          <span class="mp-drop-hint">or drag files here</span>
        </div>

        <p v-if="error" class="adm-error mp-error">{{ error }}</p>

        <p v-if="loading" class="adm-empty">Loading…</p>
        <p v-else-if="!items.length" class="adm-empty">Nothing uploaded yet.</p>
        <ul v-else class="mp-grid">
          <li v-for="item in items" :key="item.id">
            <button
              type="button"
              class="mp-item"
              :class="{ 'is-selected': selected?.id === item.id, 'is-current': item.url === current }"
              :title="item.filename"
              @click="selected = item"
              @dblclick="choose(item)"
            >
              <img v-if="item.kind === 'image'" :src="item.url" :alt="item.filename" loading="lazy">
              <span v-else class="mp-pdf"><AdminIcon name="file" :size="30" /></span>
              <span class="mp-meta">
                <span class="mp-name">{{ item.filename }}</span>
                <span class="mp-size">{{ item.width ? `${item.width}×${item.height} · ` : '' }}{{ formatBytes(item.size) }}</span>
              </span>
            </button>
            <button type="button" class="mp-delete" :aria-label="`Delete ${item.filename}`" title="Delete from library" @click="remove(item)">
              <AdminIcon name="trash" :size="14" />
            </button>
          </li>
        </ul>
      </div>

      <footer class="adm-panel-foot">
        <button type="button" class="adm-btn" @click="emit('close')">Cancel</button>
        <button type="button" class="adm-btn adm-btn-primary" :disabled="!selected" @click="selected && choose(selected)">
          Use this {{ kind === 'pdf' ? 'PDF' : 'image' }}
        </button>
      </footer>
    </div>
  </Transition>
</template>

<script lang="ts">
export interface MediaItem {
  id: number
  kind: 'image' | 'pdf'
  filename: string
  url: string
  size: number
  width: number | null
  height: number | null
  createdAt: string
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{ open: boolean, kind?: 'image' | 'pdf', current?: string }>(), { kind: 'image', current: '' })
const emit = defineEmits<{ close: [], select: [item: MediaItem] }>()

const title = computed(() => props.kind === 'pdf' ? 'Choose a PDF' : 'Choose an image')
const accept = computed(() => props.kind === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic')

const items = ref<MediaItem[]>([])
const selected = ref<MediaItem | null>(null)
const loading = ref(false)
const uploading = ref(false)
const uploadText = ref('')
const dragging = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await $fetch<{ items: MediaItem[] }>('/api/admin/media', { query: { kind: props.kind } })).items
    selected.value = items.value.find(i => i.url === props.current) ?? null
  } catch (err) {
    error.value = errorMessage(err, 'Could not load the library.')
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (open) => {
  if (open) load()
}, { immediate: true })

async function upload(files: File[]) {
  if (!files.length) return
  uploading.value = true
  error.value = ''
  const failed: string[] = []
  for (const [i, file] of files.entries()) {
    uploadText.value = files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : 'Uploading…'
    const body = new FormData()
    body.append('file', file)
    try {
      const { item } = await $fetch<{ item: MediaItem }>('/api/admin/media', { method: 'POST', body })
      if (item.kind === props.kind) {
        items.value.unshift(item)
        selected.value = item
      }
    } catch (err) {
      failed.push(`${file.name}: ${errorMessage(err, 'upload failed')}`)
    }
  }
  uploading.value = false
  if (failed.length) error.value = failed.join(' ')
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  upload([...(input.files ?? [])])
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (!uploading.value) upload([...(e.dataTransfer?.files ?? [])])
}

function choose(item: MediaItem) {
  emit('select', item)
  emit('close')
}

async function remove(item: MediaItem) {
  if (!confirm(`Delete "${item.filename}" from the library? This can't be undone.`)) return
  error.value = ''
  try {
    await $fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== item.id)
    if (selected.value?.id === item.id) selected.value = null
  } catch (err) {
    error.value = errorMessage(err, 'Could not delete the file.')
  }
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
</script>

<style scoped>
.mp {
  width: min(880px, calc(100vw - 32px));
  height: min(720px, calc(100vh - 48px));
}

.mp.is-dragging {
  outline: 2px dashed var(--adm-primary);
  outline-offset: -8px;
}

.mp-title {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 600;
  color: var(--adm-heading);
}

.mp-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mp-upload {
  position: relative;
  cursor: pointer;
}

.mp-upload.is-busy {
  opacity: 0.7;
  cursor: progress;
}

.mp-upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: inherit;
}

.mp-drop-hint {
  font-size: 13px;
  color: var(--adm-muted);
}

.mp-error {
  margin: 0 0 14px;
}

.mp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mp-grid li {
  position: relative;
}

.mp-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  overflow: hidden;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.mp-item:hover {
  border-color: var(--adm-line-strong);
}

.mp-item.is-current {
  border-color: var(--adm-accent);
}

.mp-item.is-selected {
  border-color: var(--adm-primary);
  box-shadow: 0 0 0 2px var(--adm-primary);
}

.mp-item img,
.mp-pdf {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--adm-surface-3);
}

.mp-pdf {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--adm-muted);
}

.mp-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 9px 8px;
  min-width: 0;
}

.mp-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--adm-text);
}

.mp-size {
  font-size: 11.5px;
  color: var(--adm-muted);
}

.mp-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--adm-radius);
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.mp-grid li:hover .mp-delete,
.mp-delete:focus-visible {
  opacity: 1;
}

.mp-delete:hover {
  background: var(--adm-danger);
}

@media (hover: none) {
  .mp-delete {
    opacity: 1;
  }
}
</style>
