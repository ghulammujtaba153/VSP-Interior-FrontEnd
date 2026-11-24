import { formatNzdPrice } from './priceBookUtils'

export const CATALOG_LINE_DEFAULTS = {
  sourceType: 'manual',
  priceBookId: null,
  inventoryId: null,
  sku: '',
  supplierId: null,
  priceTierApplied: null,
}

export function catalogItemToLineFields(item, qty = 1) {
  if (!item) return { ...CATALOG_LINE_DEFAULTS }
  const isInventory = item.source === 'inventory'
  return {
    sourceType: isInventory ? 'inventory' : 'pricebook',
    priceBookId: item.priceBookId || (isInventory ? null : item.id),
    inventoryId: item.inventoryId || (isInventory ? item.id : null),
    sku: item.sku || '',
    supplierId: item.supplierId,
    code: item.sku || '',
    description: item.description || item.name || '',
    measure: item.unit || '',
    mateialRate: item.price != null ? String(item.price) : '',
    quotedUnitPrice: item.price,
    materialCost: item.price != null ? String(item.price) : '',
    finishMaterial: item.description || item.name || '',
    unit: item.unit || '',
    stockQty: item.stockQty,
  }
}

export function tierHint(tiers = [], qty) {
  const q = Number(qty) || 1
  if (!tiers?.length) return null
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty)
  const next = sorted.find((t) => (t.minQty || 1) > q)
  if (next) return `${next.minQty}+ qty → ${formatNzdPrice(next.price)}`
  return null
}

export async function fetchCatalogSearch(axios, baseUrl, { supplierId, q, source = 'all', limit = 25 }) {
  const res = await axios.get(`${baseUrl}/api/project-setup/catalog-search`, {
    params: { supplierId, q, source, limit },
  })
  return res.data.data || []
}

export async function fetchPriceAtQty(axios, baseUrl, supplierId, sku, qty) {
  const res = await axios.get(
    `${baseUrl}/api/pricebook/price-at-qty/${supplierId}/${encodeURIComponent(sku)}`,
    { params: { qty } }
  )
  return res.data.data
}
