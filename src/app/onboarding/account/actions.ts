'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidCountry } from '@/lib/countries'
import { HOUSEHOLD_VALUES, CATEGORY_VALUES, SUPERMARKET_VALUES } from '@/lib/onboarding-options'
import { sendVerificationEmail } from '@/lib/email/send'

export type AccountState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean }

type Draft = {
  household?: string
  categories?: string[]
  supermarkets?: string[]
  swipes?: { productId: string; response: string }[]
}

const MIN_PASSWORD = 8

export async function createAccount(
  _prev: AccountState,
  formData: FormData
): Promise<AccountState> {
  const firstName = String(formData.get('first_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const city = String(formData.get('city') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const marketing = formData.get('email_marketing_consent') === 'on'
  const terms = formData.get('terms') === 'on'

  let draft: Draft = {}
  try {
    draft = JSON.parse(String(formData.get('draft') ?? '{}')) as Draft
  } catch {
    draft = {}
  }

  const fieldErrors: Record<string, string> = {}
  if (!firstName) fieldErrors.first_name = 'Please tell us your first name.'
  if (!email) fieldErrors.email = 'Please add your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = 'That does not look like a valid email address.'
  if (!city) fieldErrors.city = 'Please tell us your city.'
  if (!country || !isValidCountry(country)) fieldErrors.country = 'Please choose your country.'
  if (!password) fieldErrors.password = 'Please choose a password.'
  else if (password.length < MIN_PASSWORD)
    fieldErrors.password = `Please use at least ${MIN_PASSWORD} characters.`
  if (!terms) fieldErrors.terms = 'Please accept the terms so we can create your account.'

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const supabase = createClient()

  // Supabase email confirmation is off, so this returns a session and the
  // person is signed in straight away.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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

  const admin = createAdminClient()

  // The onboarding answers move from the browser into the database.
  const household = HOUSEHOLD_VALUES.includes(draft.household ?? '') ? draft.household! : 'just_me'
  const categories = (draft.categories ?? []).filter((c) => CATEGORY_VALUES.includes(c))
  const supermarkets = (draft.supermarkets ?? []).filter((s) => SUPERMARKET_VALUES.includes(s))

  const { error: profileError } = await admin.from('user_profiles').upsert(
    {
      user_id: user.id,
      household_type: household,
      shopping_categories: categories.length > 0 ? categories : ['family_meals'],
      preferred_supermarkets: supermarkets.length > 0 ? supermarkets : ['mix'],
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

  // Fired without awaiting so nothing delays getting them into the feed.
  void sendVerificationEmail(user.id, email, firstName).catch((e) =>
    console.error('[signup] verification email failed', e)
  )

  return { ok: true }
}
