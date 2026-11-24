export function formatNzdPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' })
}

export function formatTierSummary(tiers = []) {
  if (!tiers?.length) return '—'
  if (tiers.length === 1) return formatNzdPrice(tiers[0].price)
  const min = Math.min(...tiers.map((t) => Number(t.price)))
  const max = Math.max(...tiers.map((t) => Number(t.price)))
  return `${formatNzdPrice(min)} – ${formatNzdPrice(max)} (${tiers.length} tiers)`
}

export function formatTierLabel(tier) {
  const max = tier.maxQty != null ? tier.maxQty : '+'
  return `Qty ${tier.minQty}${tier.maxQty != null && tier.maxQty !== tier.minQty ? `–${max}` : max === '+' ? '+' : ''}: ${formatNzdPrice(tier.price)}`
}

export const FORMAT_LABELS = {
  enko_wholesale: 'ENKO Wholesale',
  vsp_tiered: 'VSP Tiered',
  psp_simple: 'PSP Simple',
  p3_hardware: 'P3 Hardware',
  vspint_simple: 'VSPINT',
  custom: 'Custom',
}

/** Rows per import commit request (must match server IMPORT_CHUNK_SIZE). */
export const IMPORT_CHUNK_SIZE = 100

export function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
