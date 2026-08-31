import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button, Screen } from '@/components/ui'
import { HelpfulButton } from '@/components/helpful-button'
import { RatingBadge } from '@/components/rating-card'
import { FollowButton } from '../profile/[username]/follow-button'
import { formatPrice, timeAgo } from '@/lib/format'
import type { ProfileRatingRow, SuggestedPerson } from '@/lib/profile'

export const metadata = { title: 'Friends | RateMama' }
export const dynamic = 'force-dynamic'

const SUGGESTION_COUNT = 5

export default async function FriendsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Screen>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Friends</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          Log in to follow other families and see their ratings here.
        </p>
        <div className="mt-6">
          <Link href="/login" className="block">
            <Button>Log in</Button>
          </Link>
        </div>
      </Screen>
    )
  }

  const [{ data: followingRows }, { data: myProfile }, { data: votes }] = await Promise.all([
    supabase.from('follows').select('following_id').eq('follower_id', user.id),
    supabase
      .from('user_profiles')
      .select('household_type, shopping_categories')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.from('rating_votes').select('rating_id').eq('user_id', user.id),
  ])

  const followingIds = ((followingRows ?? []) as { following_id: string }[]).map(
    (r) => r.following_id
  )
  const votedOn = new Set(((votes ?? []) as { rating_id: string }[]).map((v) => v.rating_id))

  const { data: activity } = followingIds.length
    ? await supabase
        .from('ratings')
        .select(
          'id, rating, price_paid, currency, supermarket, reason, helpful_count, created_at, user_id, users(first_name, city, username, profile_photo_url), products(slug, name, brand, image_url)'
        )
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(40)
    : { data: [] }

  // Suggestions: people with overlapping shopping categories or the same
  // household, excluding yourself and anyone you already follow.
  const exclude = [user.id, ...followingIds]
  const categories = (myProfile?.shopping_categories as string[]) ?? []

  let suggestionIds: string[] = []
  if (categories.length > 0 || myProfile?.household_type) {
    let q = supabase.from('user_profiles').select('user_id').not('user_id', 'in', `(${exclude.join(',')})`)
    if (categories.length > 0) q = q.overlaps('shopping_categories', categories)
    const { data } = await q.limit(SUGGESTION_COUNT)
    suggestionIds = ((data ?? []) as { user_id: string }[]).map((r) => r.user_id)
  }

  if (suggestionIds.length < SUGGESTION_COUNT) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .not('id', 'in', `(${exclude.join(',')})`)
      .limit(SUGGESTION_COUNT)
    for (const row of (data ?? []) as { id: string }[]) {
      if (suggestionIds.length >= SUGGESTION_COUNT) break
      if (!suggestionIds.includes(row.id)) suggestionIds.push(row.id)
    }
  }

  const { data: suggestions } = suggestionIds.length
    ? await supabase
        .from('users')
        .select('id, username, first_name, city, profile_photo_url')
        .in('id', suggestionIds)
    : { data: [] }

  const feed = (activity ?? []) as unknown as ProfileRatingRow[]

  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Friends</h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        What the people you follow have been saying.
      </p>

      <section className="mt-6">
        {feed.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-8">
            <h2 className="text-lg font-bold text-neutral-900">
              {followingIds.length === 0 ? 'You are not following anyone yet.' : 'Nothing new yet.'}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-neutral-600">
              {followingIds.length === 0
                ? 'Find people on Discover or share your profile link to connect with friends.'
                : 'The people you follow have not posted a rating yet.'}
            </p>
            <div className="mt-6">
              <Link href="/discover" className="block">
                <Button>Go to Discover</Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {feed.map((v) => (
              <li key={v.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${v.users?.username}`} className="shrink-0">
                    {v.users?.profile_photo_url ? (
                      <Image
                        src={v.users.profile_photo_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-worth-soft text-sm font-semibold text-[#2f7a55]">
                        {(v.users?.first_name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-neutral-800">
                      <Link href={`/profile/${v.users?.username}`} className="font-semibold text-neutral-900">
                        {v.users?.first_name}
                      </Link>
                      {v.users?.city && <span className="text-neutral-500"> {v.users.city}</span>}
                      <span className="text-neutral-600"> said </span>
                      <Link href={`/products/${v.products?.slug}`} className="font-semibold text-neutral-900 underline">
                        {v.products?.name}
                      </Link>
                      <span className="text-neutral-600"> is</span>
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(v.created_at)}</p>
                  </div>
                  <RatingBadge rating={v.rating} />
                </div>

                <p className="mt-3 text-base leading-relaxed text-neutral-800">{v.reason}</p>

                <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-neutral-500">
                  {v.price_paid != null && <span>Paid {formatPrice(v.price_paid)}</span>}
                </div>

                <div className="mt-3">
                  <HelpfulButton
                    ratingId={v.id}
                    initialCount={v.helpful_count ?? 0}
                    initialVoted={votedOn.has(v.id)}
                    isOwn={v.user_id === user.id}
                    signedIn
                    path="/friends"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(suggestions ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-neutral-900">People you might like</h2>
          <p className="mt-1 text-sm text-neutral-500">Based on similar taste</p>
          <ul className="mt-4 space-y-3">
            {((suggestions ?? []) as SuggestedPerson[]).map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3"
              >
                <Link href={`/profile/${person.username}`} className="shrink-0">
                  {person.profile_photo_url ? (
                    <Image
                      src={person.profile_photo_url}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-worth-soft text-base font-semibold text-[#2f7a55]">
                      {(person.first_name ?? '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
                <Link href={`/profile/${person.username}`} className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">
                    {person.first_name}
                  </span>
                  {person.city && (
                    <span className="block text-xs text-neutral-500">{person.city}</span>
                  )}
                </Link>
                <FollowButton
                  targetUserId={person.id}
                  initialFollowing={false}
                  signedIn
                  path="/friends"
                  compact
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="h-12" />
    </Screen>
  )
}
