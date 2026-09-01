'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidCountry } from '@/lib/countries'
import {
  HOUSEHOLD_VALUES,
  CATEGORY_VALUES,
  SUPERMARKET_VALUES,
  GENDER_VALUES,
} from '@/lib/onboarding-options'

export type SignupState = { error?: string; ok?: boolean }

type Draft = {
  household?: string
  gender?: string
  categories?: string[]
  supermarkets?: string[]
  swipes?: { productId: string; response: string }[]
  firstName?: string
  email?: string
  city?: string
  country?: string
}

const MIN_PASSWORD = 8

export async function finishSignup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const password = String(formData.get('password') ?? '')
  const marketing = formData.get('email_marketing_consent') === 'on'
  const terms = formData.get('terms') === 'on'

  let draft: Draft = {}
  try {
    draft = JSON.parse(String(formData.get('draft') ?? '{}')) as Draft
  } catch {
    draft = {}
  }

  const firstName = (draft.firstName ?? '').trim()
  const email = (draft.email ?? '').trim().toLowerCase()
  const city = (draft.city ?? '').trim()
  const country = (draft.country ?? '').trim()

  if (!firstName || !email || !city || !isValidCountry(country)) {
    return { error: 'Something went missing along the way. Please go back and check your details.' }
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Please use at least ${MIN_PASSWORD} characters.` }
  }
  if (!terms) {
    return { error: 'Please accept the terms so we can create your account.' }
  }

  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

  // Confirmation is required, so this deliberately returns no session.
  // The person proves the address before they can get in.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
      data: {
        first_name: firstName,
        city,
        country,
        email_marketing_consent: marketing,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'There is already an account with that email. Try logging in instead.' }
    }
    console.error('[signup] failed', error)
    return { error: 'We could not create your account just then. Please try again.' }
  }

  const user = data.user
  if (!user) return { error: 'We could not create your account just then. Please try again.' }

  // There is no session yet, so the onboarding answers are written with
  // the admin client using the id signUp just handed back.
  const admin = createAdminClient()

  const household = HOUSEHOLD_VALUES.includes(draft.household ?? '') ? draft.household! : 'just_me'
  const categories = (draft.categories ?? []).filter((c) => CATEGORY_VALUES.includes(c))
  const supermarkets = (draft.supermarkets ?? []).filter((s) => SUPERMARKET_VALUES.includes(s))
  // Optional, and skipping the step stores nothing rather than a guess.
  const gender = GENDER_VALUES.includes(draft.gender ?? '') ? draft.gender! : null

  const { error: profileError } = await admin.from('user_profiles').upsert(
    {
      user_id: user.id,
      household_type: household,
      shopping_categories: categories.length > 0 ? categories : ['family_meals'],
      preferred_supermarkets: supermarkets.length > 0 ? supermarkets : ['mix'],
      gender,
      onboarding_completed: true,
    },
    { onConflict: 'user_id' }
  )
  if (profileError) console.error('[signup] profile save failed', profileError)

  const swipes = (draft.swipes ?? []).filter((s) =>
    ['worth_it', 'not_worth_it', 'never_tried'].includes(s.response)
  )
  if (swipes.length > 0) {
    const { error: swipeError } = await admin.from('swipe_responses').upsert(
      swipes.map((s) => ({ user_id: user.id, product_id: s.productId, response: s.response })),
      { onConflict: 'user_id,product_id' }
    )
    if (swipeError) console.error('[signup] swipe save failed', swipeError)
  }

  return { ok: true }
}
