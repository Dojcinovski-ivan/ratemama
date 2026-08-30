import { createClient } from '@/lib/supabase/server'
import { FoundingMemberBadge, Screen } from '@/components/ui'

export const metadata = { title: 'Your feed | RateMama' }

export default async function FeedPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  return (
    <Screen>
      <FoundingMemberBadge />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">
        {firstName ? `Hello ${firstName}.` : 'Hello.'}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Your feed is being built. Verdicts from families near you will land here soon.
      </p>
    </Screen>
  )
}
