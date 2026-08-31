'use server'

import { createClient } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/email/layout'

export type ResendState = { sent?: boolean; error?: string }

/**
 * Sends a fresh confirmation link.
 *
 * The reply is deliberately identical whether or not the address has an
 * account, so this cannot be used to find out who is registered.
 */
export async function resendConfirmation(
  _prev: ResendState,
  formData: FormData
): Promise<ResendState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  if (!email || !email.includes('@')) {
    return { error: 'Please enter the email address you signed up with.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${siteUrl()}/auth/confirm` },
  })

  if (error) {
    // Rate limiting is the one thing worth saying out loud, because the
    // person can act on it. Everything else stays deliberately vague.
    if (error.message.toLowerCase().includes('rate')) {
      return { error: 'That is a lot of attempts. Please wait a few minutes and try once more.' }
    }
    console.error('[resend confirmation] failed', error.message)
  }

  return { sent: true }
}
