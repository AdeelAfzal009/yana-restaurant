<template>
  <div class="hv">
    <div v-if="pending" class="adm-empty">Checking card…</div>

    <div v-else-if="!card" class="adm-card hv-result is-bad">
      <AdminIcon name="alert" :size="28" />
      <h1 class="hv-verdict">Card not found</h1>
      <p>No Yana Honors card has the member ID <strong class="adm-num">{{ memberNumber }}</strong>. Don't apply the discount.</p>
    </div>

    <div v-else class="adm-card hv-result" :class="card.status === 'active' ? 'is-good' : 'is-bad'">
      <AdminIcon :name="card.status === 'active' ? 'check' : 'alert'" :size="28" />
      <h1 class="hv-verdict">{{ card.status === 'active' ? 'Valid card' : 'Card revoked' }}</h1>
      <p v-if="card.status !== 'active'">This card has been revoked. Don't apply the discount.</p>

      <dl class="hv-details">
        <dt>Guest</dt>
        <dd class="hv-name">
          {{ card.name }}
          <AdminIcon v-if="card.vip" name="star" :size="15" class="hv-star" />
        </dd>
        <dt>Member ID</dt>
        <dd class="adm-num">{{ card.memberNumber }}</dd>
        <dt>Tier</dt>
        <dd><span class="hv-tier" :class="card.tier">{{ HONORS_TIER_LABEL[card.tier] }}</span></dd>
        <template v-if="card.status === 'active'">
          <dt>Discount</dt>
          <dd class="hv-discount">{{ card.discountPercent }}% off</dd>
        </template>
      </dl>
      <p class="hv-check">Check the name matches the guest showing the card.</p>
      <p v-if="card.notes" class="hv-notes">{{ card.notes }}</p>

      <NuxtLink v-if="can('guests')" :to="`/admin/guests?id=${card.guestId}`" class="adm-btn">Open guest profile</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HONORS_TIER_LABEL } from '#shared/utils/honors'

// Opened by scanning the QR code on a guest's wallet card: is the card
// genuine and active, and what discount does it get?
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Yana Honors card · YANA Admin' })

const route = useRoute()
const memberNumber = String(route.params.member).toUpperCase()
const { can } = useAdminAccess()

type VerifiedCard = HonorsCardInfo & { guestId: number, name: string, vip: boolean, notes: string | null }
const { data: card, pending } = await useFetch<VerifiedCard>(`/api/admin/honors/member/${encodeURIComponent(memberNumber)}`)
</script>

<style scoped>
.hv {
  max-width: 520px;
  margin: 0 auto;
}

.hv-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 22px;
  text-align: center;
  border-top: 5px solid var(--adm-success-strong);
}

.hv-result.is-good > :first-child {
  color: var(--adm-success-strong);
}

.hv-result.is-bad {
  border-top-color: var(--adm-danger);
}

.hv-result.is-bad > :first-child {
  color: var(--adm-danger);
}

.hv-result p {
  margin: 0;
  font-size: 14px;
  color: var(--adm-text-2);
}

.hv-verdict {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--adm-heading);
}

.hv-details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 18px;
  width: 100%;
  margin: 14px 0 4px;
  padding: 16px 0;
  border-top: 1px solid var(--adm-line);
  border-bottom: 1px solid var(--adm-line);
  text-align: left;
}

.hv-details dt {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--adm-muted);
  align-self: center;
}

.hv-details dd {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.hv-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 18px !important;
}

.hv-star {
  color: var(--adm-accent-dk);
  fill: var(--adm-accent);
}

.hv-tier {
  display: inline-flex;
  padding: 2px 10px;
  border: 1px solid #D3D8E0;
  border-radius: 999px;
  background: #0F1E2E;
  color: #D3D8E0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hv-tier.platinum {
  border-color: #EAB77A;
  background: #EAB77A;
  color: #0F1E2E;
}

.hv-discount {
  font-size: 22px !important;
  font-weight: 600 !important;
  color: var(--adm-success-strong);
}

.hv-check {
  font-size: 12.5px !important;
}

.hv-notes {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--adm-radius);
  background: var(--adm-surface-2);
  text-align: left;
}
</style>
