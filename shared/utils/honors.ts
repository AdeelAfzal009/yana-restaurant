// Yana Honors tiers, used by the dashboard, the "add to wallet" page and the
// wallet passes.

export const HONORS_TIERS = ['silver', 'platinum'] as const
export type HonorsTier = typeof HONORS_TIERS[number]

export const HONORS_TIER_LABEL: Record<HonorsTier, string> = { silver: 'Silver', platinum: 'Platinum' }

// Where the discount box starts when a card is issued. The discount changes
// from time to time and per guest, so staff can always change it.
export const HONORS_DEFAULT_DISCOUNT: Record<HonorsTier, number> = { silver: 15, platinum: 20 }

export const isHonorsTier = (value: unknown): value is HonorsTier => HONORS_TIERS.includes(value as HonorsTier)
