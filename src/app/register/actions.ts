'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidCountry } from '@/lib/countries'

export type RegisterState = { error?: string; fieldErrors?: Record<string, string> }

const MIN_PASSWORD_LENGTH = 8

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firstName = String(formData.get('first_name') ?? '').trim()
  const surname = String(formData.get('surname') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const city = String(formData.get('city') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const photoUrl = String(formData.get('profile_photo_url') ?? '').trim()
  const marketing = formData.get('email_marketing_consent') === 'on'
  const terms = formData.get('terms') === 'on'

  const fieldErrors: Record<string, string> = {}

  if (!firstName) fieldErrors.first_name = 'Please tell us your first name.'
  if (!surname) fieldErrors.surname = 'Please add your surname.'
  if (!email) fieldErrors.email = 'Please add your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fieldErrors.email = 'That does not look like a valid email address.'
  if (!city) fieldErrors.city = 'Please tell us your city.'
  if (!country) fieldErrors.country = 'Please choose your country.'
  else if (!isValidCountry(country)) fieldErrors.country = 'Please choose a country from the list.'
  if (!password) fieldErrors.password = 'Please choose a password.'
  else if (password.length < MIN_PASSWORD_LENGTH)
    fieldErrors.password = `Please use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (!terms) fieldErrors.terms = 'Please accept the terms so we can create your account.'

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
      // The database trigger reads these to build the profile row,
      // so there is no second insert to race against.
      data: {
        first_name: firstName,
        surname,
        city,
        country,
        profile_photo_url: photoUrl,
        email_marketing_consent: marketing,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'There is already an account with that email. Try logging in instead.' }
    }
    return { error: 'We could not create your account just then. Please try again.' }
  }

  return {}
}
