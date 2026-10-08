<template>
  <section :id="`section-${section.id}`" class="adm-card cs" :class="{ 'is-hidden': form.visible === false }">
    <header class="cs-head">
      <div class="cs-head-text">
        <h2 class="cs-title">{{ section.label }}</h2>
        <p v-if="section.description" class="cs-desc">{{ section.description }}</p>
      </div>
      <label v-if="isHideable(section)" class="adm-switch">
        <input v-model="form.visible" type="checkbox" :disabled="busy">
        <span class="adm-switch-track" />
        <span>{{ form.visible === false ? 'Hidden' : 'Shown on website' }}</span>
      </label>
    </header>

    <div class="cs-fields">
      <AdminContentField
        v-for="field in section.fields"
        :key="field.key"
        v-model="form[field.key]"
        :field="field"
        :disabled="busy"
      />
    </div>

    <p v-if="error" class="adm-error cs-error">{{ error }}</p>

    <footer class="cs-foot">
      <span class="cs-status" :class="{ 'is-dirty': dirty }">{{ statusText }}</span>
      <div class="cs-actions">
        <button v-if="dirty" type="button" class="adm-btn adm-btn-sm" :disabled="busy" @click="discard">Discard changes</button>
        <button v-else type="button" class="adm-btn adm-btn-sm" :disabled="busy || state.isDefault" @click="reset">Reset to default</button>
        <button type="button" class="adm-btn adm-btn-sm adm-btn-primary" :disabled="busy || !dirty" @click="save">
          <AdminIcon name="save" :size="15" />
          {{ busy ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </footer>
  </section>
</template>

<script lang="ts">
export interface SectionState {
  value: Record<string, any>
  isDefault: boolean
  updatedAt: string | null
  updatedByName: string | null
}
</script>

<script setup lang="ts">
import { isHideable, validateSection } from '#shared/content/schema'
import type { ContentSection } from '#shared/content/schema'

const props = defineProps<{ page: string, section: ContentSection, initial: SectionState }>()
const emit = defineEmits<{ dirty: [id: string, dirty: boolean] }>()

const state = ref<SectionState>(props.initial)
const form = ref<Record<string, any>>(structuredClone(props.initial.value))
const saved = ref(JSON.stringify(props.initial.value))
const busy = ref(false)
const error = ref('')

const dirty = computed(() => JSON.stringify(form.value) !== saved.value)
watch(dirty, d => emit('dirty', props.section.id, d))

const statusText = computed(() => {
  if (dirty.value) return 'Unsaved changes'
  if (state.value.isDefault) return 'Showing the original content'
  if (!state.value.updatedAt) return ''
  const when = new Date(state.value.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `Saved ${when}${state.value.updatedByName ? ` by ${state.value.updatedByName}` : ''}`
})

function load(next: SectionState) {
  state.value = next
  form.value = structuredClone(next.value)
  saved.value = JSON.stringify(next.value)
}

async function send(body: Record<string, unknown>, fallback: string) {
  busy.value = true
  error.value = ''
  try {
    load(await $fetch<SectionState>(`/api/admin/content/${props.page}`, { method: 'PUT', body: { section: props.section.id, ...body } }))
  } catch (err) {
    error.value = errorMessage(err, fallback)
  } finally {
    busy.value = false
  }
}

async function save() {
  error.value = validateSection(props.section, form.value)
  if (error.value) return
  await send({ value: form.value }, 'Could not save this section.')
}

async function reset() {
  if (!confirm(`Put "${props.section.label}" back to the original content? Your edits to this section will be lost.`)) return
  await send({ reset: true }, 'Could not reset this section.')
}

function discard() {
  form.value = JSON.parse(saved.value)
  error.value = ''
}
</script>

<style scoped>
.cs {
  padding: 20px 22px;
  scroll-margin-top: 20px;
}

.cs.is-hidden .cs-fields {
  opacity: 0.6;
}

.cs-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.cs-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--adm-heading);
}

.cs-desc {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--adm-muted);
}

.cs-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cs-error {
  margin: 16px 0 0;
}

.cs-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--adm-line);
}

.cs-status {
  font-size: 12.5px;
  color: var(--adm-muted);
}

.cs-status.is-dirty {
  color: var(--adm-accent-dk);
  font-weight: 500;
}

.cs-actions {
  display: flex;
  gap: 8px;
}
</style>
