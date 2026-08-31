'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MAX_REASON } from '@/lib/constants'

export type RatingState = { error?: string; ok?: boolean }


const SHOPS = [
  'tesco', 'sainsburys', 'asda', 'lidl', 'aldi',
  'waitrose', 'ocado', 'amazon', 'other',
]

export async function submitRating(
  _prev: RatingState,
  formData: FormData
): Promise<RatingState> {
  const productId = String(formData.get('product_id') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const rating = String(formData.get('rating') ?? '')
  const pricePaid = String(formData.get('price_paid') ?? '').trim()
  const supermarket = String(formData.get('supermarket') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()
  const alternative = String(formData.get('alternative_product') ?? '').trim()
  const photoUrl = String(formData.get('photo_url') ?? '').trim()

  if (!['worth_it', 'not_worth_it'].includes(rating)) {
    return { error: 'Please choose Worth It or Not Worth It.' }
  }

  const price = Number(pricePaid)
  if (!pricePaid || Number.isNaN(price) || price < 0 || price > 10000) {
    return { error: 'Please add the price you paid.' }
  }
  if (!SHOPS.includes(supermarket)) {
    return { error: 'Please choose where you bought it.' }
  }
  if (reason.length < 5) {
    return { error: 'Please add a short reason so others know what you thought.' }
  }
  if (reason.length > MAX_REASON) {
    return { error: `Please keep it to ${MAX_REASON} characters.` }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in to leave a rating.' }

  const { error } = await supabase.from('ratings').upsert(
    {
      user_id: user.id,
      product_id: productId,
      rating,
      price_paid: price,
      currency: 'GBP',
      supermarket,
      reason,
      // The alternative only makes sense on a Not Worth It.
      alternative_product: rating === 'not_worth_it' && alternative ? alternative : null,
      photo_url: photoUrl || null,
    },
    { onConflict: 'user_id,product_id' }
  )

  if (error) {
    console.error('[rating] save failed', error)
    return { error: 'We could not save your rating just then. Please try again.' }
  }

  // The counts on the product are maintained by database triggers, so
  // there is nothing to increment here.
  revalidatePath(`/products/${slug}`)
  revalidatePath('/feed')
  revalidatePath('/discover')
  return { ok: true }
}
