'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { destinationForUser } from '@/lib/auth-redirect'

export type LoginState = { error?: string; unconfirmed?: boolean }

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '')

  if (!email || !password) {
    return { error: 'Please enter your email and password.' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('not confirmed')) {
      return {
        error:
          'Please confirm your email first. Check your inbox, or ask for a new link below.',
        unconfirmed: true,
      }
    }
    return { error: 'That email and password did not match. Please try again.' }
  }

  const destination = next || (await destinationForUser(supabase, data.user.id))
  redirect(destination)
}

export async function forgotPasswordAction(
  _prev: { sent?: boolean; error?: string },
  formData: FormData
): Promise<{ sent?: boolean; error?: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Please enter your email address.' }

  const supabase = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
  })

  // Always report success so the form cannot be used to discover
  // which addresses have accounts.
  return { sent: true }
}
