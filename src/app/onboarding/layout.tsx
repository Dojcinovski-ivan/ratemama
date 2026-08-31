import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Anyone already signed in belongs on their feed, not back in onboarding. */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/feed')

  return <>{children}</>
}
