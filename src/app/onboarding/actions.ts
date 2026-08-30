'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchProductsForCategories } from '@/lib/openfoodfacts'
import {
  HOUSEHOLD_VALUES,
  CATEGORY_VALUES,
  SUPERMARKET_VALUES,
} from '@/lib/onboarding-options'

export type DeckProduct = {
  id: string
  name: string
  brand: string | null
  image_url: string
  total_verdicts: number
  average_price_gbp: number | null
}

export type SaveAnswersResult = { error?: string; products?: DeckProduct[] }

/**
 * Saves the three onboarding answers, then builds the swipe deck.
 *
 * Products are written with the admin client because RLS deliberately gives
 * no insert policy on products: the catalogue is ours to import, not
 * something users can write to.
 */
export async function saveAnswersAndBuildDeck(
  householdType: string,
  shoppingCategories: string[],
  preferredSupermarkets: string[]
): Promise<SaveAnswersResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Your session has expired. Please log in again.' }

  if (!HOUSEHOLD_VALUES.includes(householdType)) {
    return { error: 'Please choose who is in your household.' }
  }
  const categories = shoppingCategories.filter((c) => CATEGORY_VALUES.includes(c))
  const supermarkets = preferredSupermarkets.filter((s) => SUPERMARKET_VALUES.includes(s))

  if (categories.length === 0) return { error: 'Please choose at least one thing you shop for.' }
  if (supermarkets.length === 0) return { error: 'Please choose at least one place you shop.' }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      user_id: user.id,
      household_type: householdType,
      shopping_categories: categories,
      preferred_supermarkets: supermarkets,
      onboarding_completed: false,
    },
    { onConflict: 'user_id' }
  )

  if (profileError) {
    return { error: 'We could not save your answers just then. Please try again.' }
  }

  const products = await buildDeck(categories, supermarkets, user.id)
  return { products }
}

async function buildDeck(
  categories: string[],
  supermarkets: string[],
  userId: string
): Promise<DeckProduct[]> {
  const admin = createAdminClient()
  const found = await fetchProductsForCategories(categories, 10)

  if (found.length > 0) {
    await admin.from('products').upsert(
      found.map((p) => ({
        off_id: p.off_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image_url: p.image_url,
        barcode: p.barcode,
        slug: p.slug,
        country_availability: ['United Kingdom'],
        supermarkets,
      })),
      { onConflict: 'off_id', ignoreDuplicates: false }
    )
  }

  const offIds = found.map((p) => p.off_id)

  // Read back through our own table so ids are real and anything already
  // imported gets its live verdict counts.
  let query = admin
    .from('products')
    .select('id, name, brand, image_url, total_verdicts, average_price_gbp')
    .not('image_url', 'is', null)
    .limit(10)

  query = offIds.length > 0 ? query.in('off_id', offIds) : query

  const { data: rows } = await query
  if (!rows) return []

  // Never show a product this person has already answered.
  const { data: answered } = await admin
    .from('swipe_responses')
    .select('product_id')
    .eq('user_id', userId)

  const seen = new Set((answered ?? []).map((r) => r.product_id as string))
  return (rows as DeckProduct[]).filter((p) => !seen.has(p.id))
}

export async function recordSwipe(productId: string, response: string) {
  const valid = ['worth_it', 'not_worth_it', 'never_tried']
  if (!valid.includes(response)) return { error: 'Unknown response.' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired.' }

  const { error } = await supabase
    .from('swipe_responses')
    .upsert(
      { user_id: user.id, product_id: productId, response },
      { onConflict: 'user_id,product_id' }
    )

  return error ? { error: 'We could not save that just then.' } : {}
}

export async function completeOnboarding() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Your session has expired.' }

  const { error } = await supabase
    .from('user_profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id)

  return error ? { error: 'We could not finish up just then.' } : {}
}
