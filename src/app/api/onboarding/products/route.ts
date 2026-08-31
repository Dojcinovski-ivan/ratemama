import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tagsForFilters } from '@/lib/categories'

export const dynamic = 'force-dynamic'

const FIELDS =
  'id, name, brand, image_url, average_price_gbp, total_ratings, worth_it_percentage, featured'

const DECK_SIZE = 5
/** Below this many curated matches we top up from the wider catalogue. */
const MIN_FEATURED = 5

/**
 * Products for the swipe step. This runs before anyone has an account,
 * so it reads the catalogue with the public client. Products are
 * readable without a session by design, which is what makes the public
 * product pages work.
 *
 * Curated products come first so the very first thing a new family sees
 * is a shelf they recognise, not a random import.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('categories') ?? ''
  const categories = raw.split(',').filter(Boolean)

  const supabase = createClient()
  const tags = tagsForFilters(categories)

  let featuredQuery = supabase
    .from('products')
    .select(FIELDS)
    .eq('featured', true)
    // Products with a real photograph lead, so a deck never opens on a run
    // of placeholders. Household cleaning is barely covered by the open
    // catalogues, which is where that would otherwise happen.
    .order('image_url', { ascending: true, nullsFirst: false })
    .order('popularity_score', { ascending: false })
    .limit(40)

  if (tags.length > 0) featuredQuery = featuredQuery.in('category', tags)

  const { data: featured, error: featuredError } = await featuredQuery

  if (featuredError) {
    console.error('[onboarding products] featured query failed', featuredError)
  }

  const deck = [...(featured ?? [])]

  // Only reach for the wider Open Food Facts catalogue when the curated
  // shelf for their categories is too thin to fill a deck.
  if (deck.length < MIN_FEATURED) {
    let fallback = supabase
      .from('products')
      .select(FIELDS)
      .eq('featured', false)
      .not('image_url', 'is', null)
      .order('total_ratings', { ascending: false })
      .limit(60)

    if (tags.length > 0) fallback = fallback.in('category', tags)

    const { data: extra, error } = await fallback
    if (error) console.error('[onboarding products] fallback query failed', error)

    const have = new Set(deck.map((p) => p.id))
    // A small random slice keeps the fallback from being identical for everyone.
    for (const row of [...(extra ?? [])].sort(() => Math.random() - 0.5)) {
      if (deck.length >= DECK_SIZE) break
      if (have.has(row.id)) continue
      have.add(row.id)
      deck.push(row)
    }
  }

  return NextResponse.json({ products: deck.slice(0, DECK_SIZE) })
}
