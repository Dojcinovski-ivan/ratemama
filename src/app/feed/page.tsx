import { createClient } from '@/lib/supabase/server'
import { FoundingMemberBadge, Screen } from '@/components/ui'
import { loadRecommendations } from './actions'
import { FeedList } from './feed-list'

export const metadata = { title: 'Your feed | RateMama' }
export const dynamic = 'force-dynamic'

const WELCOME_DAYS = 7

export default async function FeedPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  const [initial, { data: profile }] = await Promise.all([
    loadRecommendations(0),
    user
      ? supabase.from('users').select('created_at').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const joined = profile?.created_at ? new Date(profile.created_at) : null
  const isNew =
    joined != null && Date.now() - joined.getTime() < WELCOME_DAYS * 24 * 60 * 60 * 1000

  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        {firstName ? `Hello ${firstName}.` : 'Your feed.'}
      </h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        Picked for you, based on what you shop for.
      </p>

      {isNew && (
        <section className="mt-6 rounded-2xl bg-worth-soft px-5 py-5">
          <FoundingMemberBadge />
          <h2 className="mt-3 text-lg font-bold text-neutral-900">
            Welcome to RateMama. You are a founding member.
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
            Every verdict you leave helps real families make better decisions.
          </p>
        </section>
      )}

      <FeedList initial={initial} />
      <div className="h-12" />
    </Screen>
  )
}
