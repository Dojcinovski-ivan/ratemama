import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingFlow from './onboarding-flow'

export const metadata = { title: 'Welcome to RateMama' }

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware already guards this, but a direct hit deserves a real answer.
  if (!user) redirect('/login?next=/onboarding')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed) redirect('/feed')

  const firstName = (user.user_metadata?.first_name as string | undefined) ?? ''

  return <OnboardingFlow firstName={firstName} />
}
