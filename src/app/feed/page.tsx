import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VerdictCard, type VerdictWithContext } from '@/components/verdict-card'
import { Button, FoundingMemberBadge, Screen } from '@/components/ui'

export const metadata = { title: 'Your feed | RateMama' }
export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  const { data: verdicts } = await supabase
    .from('verdicts')
    .select(
      'id, verdict, price_paid, currency, supermarket, reason, alternative_product, helpful_count, created_at, users(first_name, city, profile_photo_url, is_founding_member), products(slug, name, brand, image_url)'
    )
    .order('created_at', { ascending: false })
    .limit(40)

  const feed = (verdicts ?? []) as unknown as VerdictWithContext[]

  return (
    <Screen>
      <header>
        <FoundingMemberBadge />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
          {firstName ? `Hello ${firstName}.` : 'Your feed.'}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-neutral-600">
          The latest verdicts from families like yours.
        </p>
      </header>

      {feed.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white px-5 py-8">
          <h2 className="text-lg font-bold text-neutral-900">Nothing here yet.</h2>
          <p className="mt-2 text-base leading-relaxed text-neutral-600">
            No verdicts have been posted so far. Be the first and your words will be the ones
            helping other families decide.
          </p>
          <div className="mt-6">
            <Link href="/discover" className="block">
              <Button>Find something to rate</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {feed.map((verdict) => (
              <VerdictCard key={verdict.id} verdict={verdict} showProduct />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/discover" className="block">
              <Button variant="secondary">Rate something yourself</Button>
            </Link>
          </div>
        </>
      )}
      <div className="h-12" />
    </Screen>
  )
}
