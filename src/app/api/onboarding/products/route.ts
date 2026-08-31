import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tagsForFilters } from '@/lib/categories'

export const dynamic = 'force-dynamic'

/**
 * Products for the swipe step. This runs before anyone has an account,
 * so it reads the catalogue with the public client. Products are
 * readable without a session by design, which is what makes the public
 * product pages work.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('categories') ?? ''
  const categories = raw.split(',').filter(Boolean)

  const supabase = createClient()
  const tags = tagsForFilters(categories)

  let query = supabase
    .from('products')
    .select('id, name, brand, image_url, average_price_gbp, total_ratings, worth_it_percentage')
    .not('image_url', 'is', null)
    .order('total_ratings', { ascending: false })
    .limit(60)

  if (tags.length > 0) query = query.in('category', tags)

  const { data, error } = await query

  if (error) {
    console.error('[onboarding products] query failed', error)
    return NextResponse.json({ products: [] })
  }

  // A small random slice keeps the deck from being identical for everyone.
  const rows = [...(data ?? [])].sort(() => Math.random() - 0.5).slice(0, 5)

  return NextResponse.json({ products: rows })
}
