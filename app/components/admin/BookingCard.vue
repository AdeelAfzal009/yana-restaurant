<template>
  <article class="bc">
    <div class="bc-date" :style="{ '--st': STATUS_META[item.status].color }">
      <span class="bc-status">{{ STATUS_META[item.status].label }}</span>
      <strong class="adm-num">{{ day }}</strong>
      <span>{{ monthYear }}</span>
    </div>
    <div class="bc-body">
      <p><AdminIcon name="clock" :size="14" /> {{ formatTime(item.time) }}<template v-if="item.seatedAt"> · seated at <span class="ok">{{ clockTime(item.seatedAt) }}</span></template></p>
      <p v-if="minutes !== null"><AdminIcon name="history" :size="14" /> {{ minutes }} min<template v-if="item.finishedAt"> · left at {{ clockTime(item.finishedAt) }}</template></p>
      <p v-else><AdminIcon name="history" :size="14" /> {{ item.durationMinutes }} min planned</p>
    </div>
    <div class="bc-body">
      <p><AdminIcon name="users" :size="14" /> {{ item.seatedGuests != null ? `${item.seatedGuests} / ${item.partySize}` : item.partySize }} guest(s)</p>
      <p><AdminIcon name="table" :size="14" /> {{ item.tableName ? `${item.tableName}${item.sectionName ? ` ${item.sectionName}` : ''}` : 'No table' }}</p>
      <p class="adm-muted">#{{ item.reference }} · {{ SOURCE_LABELS[item.source] }}</p>
    </div>
    <div class="bc-body wide">
      <p><AdminIcon name="tag" :size="14" /> {{ item.tags.length ? item.tags.join(', ') : '—' }}</p>
      <p><AdminIcon name="note" :size="14" /> {{ item.notes || '—' }}</p>
    </div>
    <NuxtLink :to="`/admin/reservations?view=list&date=${item.date}`" class="bc-open" title="Open this day" aria-label="Open this day">
      <AdminIcon name="edit" :size="16" />
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{ item: GuestHistoryItem }>()
const d = computed(() => new Date(`${props.item.date}T00:00:00`))
const day = computed(() => d.value.getDate())
const monthYear = computed(() => d.value.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }))
const minutes = computed(() => actualMinutes(props.item))
</script>

<style scoped>
.bc {
  position: relative;
  display: grid;
  grid-template-columns: 76px 1fr 1fr 1.3fr;
  gap: 16px;
  padding: 0 44px 0 0;
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  overflow: hidden;
}

.bc-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 10px;
  background: var(--adm-surface);
  border-right: 3px solid var(--st);
  font-size: 12px;
  text-align: center;
}

.bc-status {
  align-self: stretch;
  margin-bottom: 6px;
  padding: 3px 0;
  background: var(--st);
  color: #fff;
  font-size: 11px;
}

.bc-date strong {
  font-size: 22px;
  font-weight: 500;
  line-height: 1.1;
}

.bc-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  min-width: 0;
  font-size: 13px;
}

.bc-body p {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 0;
}

.bc-body :deep(.adm-icon) {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--adm-faint);
}

.ok {
  color: var(--adm-success);
  font-weight: 500;
}

.bc-open {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--adm-success);
}

@media (max-width: 720px) {
  .bc {
    grid-template-columns: 76px 1fr;
  }

  .bc-body.wide {
    grid-column: 2;
  }
}
</style>
