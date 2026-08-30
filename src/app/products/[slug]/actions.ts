'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SUPERMARKET_VALUES } from '@/lib/onboarding-options'

export type VerdictState = { error?: string; ok?: boolean }

const MAX_REASON = 1000

export async function submitVerdict(
  _prev: VerdictState,
  formData: FormData
): Promise<VerdictState> {
  const productId = String(formData.get('product_id') ?? '')
  const slug = String(formData.get('slug') ?? '')
  const verdict = String(formData.get('verdict') ?? '')
  const pricePaid = String(formData.get('price_paid') ?? '').trim()
  const supermarket = String(formData.get('supermarket') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()
  const alternative = String(formData.get('alternative_product') ?? '').trim()

  if (!['worth_it', 'not_worth_it'].includes(verdict)) {
    return { error: 'Please choose Worth It or Not Worth It.' }
  }
  const price = Number(pricePaid)
  if (!pricePaid || Number.isNaN(price) || price < 0 || price > 10000) {
    return { error: 'Please add the price you paid.' }
  }
  if (!supermarket || ![...SUPERMARKET_VALUES, 'other'].includes(supermarket)) {
    return { error: 'Please choose where you bought it.' }
  }
  if (reason.length < 10) {
    return { error: 'Please tell us a little more. Ten characters or so is plenty.' }
  }
  if (reason.length > MAX_REASON) {
    return { error: 'That is a bit long. Please keep it under 1000 characters.' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in to leave a verdict.' }

  const { error } = await supabase.from('verdicts').upsert(
    {
      user_id: user.id,
      product_id: productId,
      verdict,
      price_paid: price,
      currency: 'GBP',
      supermarket,
      reason,
      alternative_product: alternative || null,
    },
    { onConflict: 'user_id,product_id' }
  )

  if (error) {
    console.error('[verdict] save failed', error)
    return { error: 'We could not save your verdict just then. Please try again.' }
  }

  revalidatePath(`/products/${slug}`)
  revalidatePath('/feed')
  return { ok: true }
}

export async function toggleHelpful(verdictId: string, slug: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const { data: existing } = await supabase
    .from('verdict_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('verdict_id', verdictId)
    .maybeSingle()

  if (existing) {
    await supabase.from('verdict_votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('verdict_votes').insert({ user_id: user.id, verdict_id: verdictId })
  }

  revalidatePath(`/products/${slug}`)
  return { ok: true }
}
