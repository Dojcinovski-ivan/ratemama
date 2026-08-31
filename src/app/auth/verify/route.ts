import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyVerification } from '@/lib/email/verify-token'

export const dynamic = 'force-dynamic'

/**
 * Email confirmation. Supabase no longer gates signup on this, so it is
 * ours to record. The token is an HMAC of the user id, so this works
 * from an inbox with no session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token') ?? ''
  const userId = token ? verifyVerification(token) : null

  if (!userId) {
    return NextResponse.redirect(`${origin}/feed?verified=failed`)
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ email_verified: true, email_verified_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('[verify] update failed', error)
    return NextResponse.redirect(`${origin}/feed?verified=failed`)
  }

  return NextResponse.redirect(`${origin}/feed?verified=1`)
}
