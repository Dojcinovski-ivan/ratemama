import { createClient } from '@/lib/supabase/server'
import type { RatingWithContext } from '@/components/rating-card'

export const PRODUCT_FIELDS =
  'id, slug, name, brand, category, barcode, image_url, average_price_gbp, worth_it_count, not_worth_it_count, total_ratings, worth_it_percentage'

export const RATING_FIELDS =
  'id, user_id, rating, price_paid, currency, supermarket, reason, alternative_product, photo_url, helpful_count, created_at, users(first_name, city, country, profile_photo_url, is_founding_member)'

export type ProductRow = {
  id: string
  slug: string | null
  name: string
  brand: string | null
  category: string | null
  barcode: string | null
  image_url: string | null
  average_price_gbp: number | null
  worth_it_count: number | null
  not_worth_it_count: number | null
  total_ratings: number | null
  worth_it_percentage: number | null
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient()
  const { data } = await supabase.from('products').select(PRODUCT_FIELDS).eq('slug', slug).maybeSingle()
  return data as ProductRow | null
}

export type RatingRow = RatingWithContext & { user_id: string }

/** Community price picture, derived from what people actually paid. */
export function priceStats(ratings: { price_paid: number | null }[]) {
  const prices = ratings
    .map((v) => v.price_paid)
    .filter((p): p is number => p != null && p > 0)

  if (prices.length === 0) return null

  const total = prices.reduce((sum, p) => sum + p, 0)
  return {
    average: total / prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length,
  }
}

/** The alternative the community mentions most often. */
export function topAlternative(ratings: { alternative_product: string | null }[]) {
  const counts = new Map<string, { label: string; count: number }>()

  for (const v of ratings) {
    const raw = v.alternative_product?.trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, { label: raw, count: 1 })
  }

  let best: { label: string; count: number } | null = null
  for (const entry of Array.from(counts.values())) {
    if (!best || entry.count > best.count) best = entry
  }
  return best
}
