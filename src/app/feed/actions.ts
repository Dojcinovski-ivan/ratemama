'use server'

import { createClient } from '@/lib/supabase/server'
import { tagsForFilters } from '@/lib/categories'
import type { ProductSummary } from '@/components/product-card'
import { FEED_PAGE_SIZE as PAGE_SIZE } from '@/lib/constants'

const PRODUCT_FIELDS =
  'id, slug, name, brand, image_url, total_ratings, worth_it_percentage, average_price_gbp, featured, popularity_score'


/**
 * Recommendations: products in the categories they chose, minus anything
 * they have already swiped or reviewed, most reviewed first.
 */
export async function loadRecommendations(offset: number): Promise<ProductSummary[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const [{ data: profile }, { data: swiped }, { data: reviewed }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('shopping_categories, preferred_supermarkets')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('swipe_responses').select('product_id').eq('user_id', user.id),
    supabase.from('ratings').select('product_id').eq('user_id', user.id),
  ])

  const seen = new Set<string>([
    ...((swiped ?? []) as { product_id: string }[]).map((r) => r.product_id),
    ...((reviewed ?? []) as { product_id: string }[]).map((r) => r.product_id),
  ])

  const tags = tagsForFilters((profile?.shopping_categories as string[]) ?? [])

  // Over fetch so the exclusions below still leave a full page.
  const span = PAGE_SIZE * 3

  // Curated products lead the feed, most recognisable first. Featured
  // products keep their photo requirement relaxed because a handful have
  // no picture in the open catalogues and still deserve to be seen.
  let featuredQuery = supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('featured', true)
    .order('popularity_score', { ascending: false })
    .range(offset, offset + span - 1)

  let query = supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('featured', false)
    .not('image_url', 'is', null)
    .order('total_ratings', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + span - 1)

  if (tags.length > 0) {
    featuredQuery = featuredQuery.in('category', tags)
    query = query.in('category', tags)
  }

  const [{ data: featuredData }, { data }] = await Promise.all([featuredQuery, query])

  const featured = ((featuredData ?? []) as ProductSummary[]).filter((p) => !seen.has(p.id))
  // Rated curated products first, then the ones still waiting for a first
  // rating, each group most recognisable first.
  const rated = featured.filter((p) => (p.total_ratings ?? 0) > 0)
  const unrated = featured.filter((p) => (p.total_ratings ?? 0) === 0)

  const rows = [...rated, ...unrated, ...((data ?? []) as ProductSummary[]).filter((p) => !seen.has(p.id))]

  // If their categories are thin, top up from the wider catalogue.
  if (rows.length < PAGE_SIZE && tags.length > 0) {
    const { data: extra } = await supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .not('image_url', 'is', null)
      .order('total_ratings', { ascending: false })
      .range(offset, offset + span - 1)

    const have = new Set(rows.map((r) => r.id))
    for (const row of (extra ?? []) as ProductSummary[]) {
      if (rows.length >= PAGE_SIZE) break
      if (seen.has(row.id) || have.has(row.id)) continue
      have.add(row.id)
      rows.push(row)
    }
  }

  return rows.slice(0, PAGE_SIZE)
}
