'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchProductsForCategories, tagsForCategories } from '@/lib/openfoodfacts'
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
  const found = await fetchProductsForCategories(categories, 12)

  if (found.length > 0) {
    const { error } = await admin.from('products').upsert(
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
    if (error) console.error('[deck] product upsert failed', error)
  } else {
    console.warn('[deck] Open Food Facts returned nothing, serving from catalogue')
  }

  // Products this person has already answered never reappear.
  const { data: answered } = await admin
    .from('swipe_responses')
    .select('product_id')
    .eq('user_id', userId)
  const seen = new Set((answered ?? []).map((r) => r.product_id as string))

  const select = 'id, name, brand, image_url, total_verdicts, average_price_gbp'
  const deck: DeckProduct[] = []
  const added = new Set<string>()

  function take(rows: DeckProduct[] | null) {
    for (const row of rows ?? []) {
      if (deck.length >= 10) return
      if (seen.has(row.id) || added.has(row.id)) continue
      added.add(row.id)
      deck.push(row)
    }
  }

  // First choice: exactly what we just imported for these categories.
  if (found.length > 0) {
    const { data } = await admin
      .from('products')
      .select(select)
      .in(
        'off_id',
        found.map((p) => p.off_id)
      )
      .not('image_url', 'is', null)
      .limit(40)
    take(data as DeckProduct[] | null)
  }

  // Second choice: anything already in the catalogue for these categories.
  if (deck.length < 5) {
    const tags = tagsForCategories(categories)
    const { data } = await admin
      .from('products')
      .select(select)
      .in('category', tags)
      .not('image_url', 'is', null)
      .limit(40)
    take(data as DeckProduct[] | null)
  }

  // Last resort: any product with a picture, so a bad day at Open Food
  // Facts never leaves someone staring at an empty deck.
  if (deck.length < 5) {
    const { data } = await admin
      .from('products')
      .select(select)
      .not('image_url', 'is', null)
      .limit(40)
    take(data as DeckProduct[] | null)
  }

  return deck
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
