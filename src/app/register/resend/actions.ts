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
    // Supabase enforces a short cooldown per address, on top of the
    // hourly cap. Both come back as 429. Saying "check your inbox" here
    // would be a lie, because nothing was sent, so this is surfaced.
    const status = (error as { status?: number }).status
    const code = (error as { code?: string }).code
    if (status === 429 || code === 'over_email_send_rate_limit') {
      const seconds = error.message.match(/(\d+)\s*seconds?/)?.[1]
      return {
        error: seconds
          ? `A link was just sent. Please wait ${seconds} seconds before asking for another.`
          : 'A link was sent very recently. Please wait a minute and try again.',
      }
    }
    // Anything else stays vague, so this cannot be used to work out
    // which addresses have an account.
    console.error('[resend confirmation] failed', error.message)
  }

  return { sent: true }
}
