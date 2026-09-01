import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Supabase email confirmation callback.
 * On success the welcome email goes out and we land in onboarding.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/auth/confirm/error?reason=missing`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    const reason = error.message.toLowerCase().includes('expired') ? 'expired' : 'invalid'
    return NextResponse.redirect(`${origin}/auth/confirm/error?reason=${reason}`)
  }

  // A recovery link signs them in so they can choose a new password.
  // It must never fall through to the welcome email or the feed.
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    const firstName = (user.user_metadata?.first_name as string | undefined) ?? ''

    // Keep our own column in step with Supabase, so the profile and any
    // future gating can read one source of truth.
    const admin = createAdminClient()
    await admin
      .from('users')
      .update({ email_verified: true, email_verified_at: new Date().toISOString() })
      .eq('id', user.id)

    // Deduped internally, so a second click on the link sends nothing.
    await sendWelcomeEmail(user.id, user.email, firstName)
  }

  return NextResponse.redirect(`${origin}/feed`)
}
