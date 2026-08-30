'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { tagsForFilters } from '@/lib/categories'
import { slugify } from '@/lib/openfoodfacts'
import type { ProductSummary } from '@/components/product-card'

const FIELDS =
  'id, slug, name, brand, image_url, total_verdicts, worth_it_percentage, average_price_gbp'

export type SortKey = 'reviewed' | 'worth' | 'controversial' | 'newest'

export async function searchProducts(
  term: string,
  categories: string[],
  sort: SortKey
): Promise<ProductSummary[]> {
  const supabase = createClient()
  let query = supabase.from('products').select(FIELDS).not('image_url', 'is', null).limit(60)

  const cleaned = term.trim()
  if (cleaned) {
    const safe = cleaned.replace(/[%,()]/g, ' ')
    query = query.or(`name.ilike.%${safe}%,brand.ilike.%${safe}%`)
  }

  const tags = tagsForFilters(categories)
  if (tags.length > 0) query = query.in('category', tags)

  switch (sort) {
    case 'worth':
      query = query.gt('total_verdicts', 0).order('worth_it_percentage', { ascending: false })
      break
    case 'controversial':
      query = query.gt('total_verdicts', 0).order('controversy', { ascending: true })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('total_verdicts', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data } = await query
  return (data ?? []) as ProductSummary[]
}

/**
 * Barcode lookup. Our catalogue first, then Open Food Facts, importing
 * anything we find so the next person gets it instantly.
 */
export async function lookupBarcode(
  barcode: string
): Promise<{ slug?: string; notFound?: boolean; error?: string }> {
  const code = barcode.replace(/\D/g, '')
  if (code.length < 8 || code.length > 14) return { error: 'That does not look like a barcode.' }

  const supabase = createClient()
  const { data: existing } = await supabase
    .from('products')
    .select('slug')
    .or(`barcode.eq.${code},off_id.eq.${code}`)
    .maybeSingle()

  if (existing?.slug) return { slug: existing.slug }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}?fields=code,product_name,product_name_en,brands,image_front_url,image_url,categories_tags`,
      {
        headers: { 'User-Agent': 'RateMama/1.0 (https://ratemama.com)', Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      }
    )

    if (!response.ok) return { notFound: true }
    const json = (await response.json()) as {
      status?: number
      product?: {
        product_name?: string
        product_name_en?: string
        brands?: string
        image_front_url?: string
        image_url?: string
        categories_tags?: string[]
      }
    }

    const p = json.product
    const name = (p?.product_name_en || p?.product_name || '').trim()
    const image = p?.image_front_url || p?.image_url || ''
    if (json.status !== 1 || !name) return { notFound: true }

    const brand = (p?.brands || '').split(',')[0]?.trim() || null
    const category = p?.categories_tags?.find((t) => t.startsWith('en:')) ?? 'en:groceries'
    let slug = slugify([brand, name].filter(Boolean).join(' ')) || code

    const admin = createAdminClient()
    const { data: clash } = await admin.from('products').select('id').eq('slug', slug).maybeSingle()
    if (clash) slug = `${slug}-${code.slice(-5)}`

    const { error } = await admin.from('products').upsert(
      {
        off_id: code,
        barcode: code,
        name,
        brand,
        category,
        image_url: image || null,
        slug,
        country_availability: ['United Kingdom'],
      },
      { onConflict: 'off_id' }
    )

    if (error) {
      console.error('[barcode] import failed', error)
      return { error: 'We found it but could not save it. Please try again.' }
    }

    return { slug }
  } catch (error) {
    console.warn('[barcode] lookup failed', error)
    return { notFound: true }
  }
}
