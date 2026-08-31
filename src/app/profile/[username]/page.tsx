import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Screen, FoundingMemberBadge, cn } from '@/components/ui'
import { ShareButton } from '@/components/share-button'
import { HelpfulButton } from '@/components/helpful-button'
import { VerdictBadge } from '@/components/verdict-card'
import { FollowButton } from './follow-button'
import {
  getProfileByUsername,
  getProfileStats,
  type ProfileVerdictRow,
  type SavedProductRow,
} from '@/lib/profile'
import { formatPrice, supermarketLabel, timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Tab = 'worth' | 'notworth' | 'saved'

export async function generateMetadata({
  params,
}: {
  params: { username: string }
}): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username)
  if (!profile) return { title: 'Profile not found | RateMama' }
  const where = [profile.city, profile.country].filter(Boolean).join(', ')
  return {
    title: `${profile.first_name} on RateMama`,
    description: profile.bio ?? `Verdicts from ${profile.first_name}${where ? ` in ${where}` : ''}.`,
  }
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const profile = await getProfileByUsername(params.username)
  if (!profile) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwn = user?.id === profile.id
  const tabParam = (searchParams.tab ?? 'worth') as Tab
  const tab: Tab = tabParam === 'saved' && !isOwn ? 'worth' : tabParam

  const [stats, followRow, votesRow] = await Promise.all([
    getProfileStats(profile.id),
    user && !isOwn
      ? supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('verdict_votes').select('verdict_id').eq('user_id', user.id)
      : Promise.resolve({ data: null }),
  ])

  const votedOn = new Set(
    ((votesRow.data ?? []) as { verdict_id: string }[]).map((v) => v.verdict_id)
  )

  let verdicts: ProfileVerdictRow[] = []
  let savedProducts: SavedProductRow[] = []

  if (tab === 'saved' && isOwn) {
    const { data } = await supabase
      .from('saved_products')
      .select('id, created_at, products(id, slug, name, brand, image_url, total_verdicts, worth_it_percentage)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)
    savedProducts = (data ?? []) as unknown as SavedProductRow[]
  } else {
    const { data } = await supabase
      .from('verdicts')
      .select(
        'id, verdict, price_paid, currency, supermarket, reason, alternative_product, helpful_count, created_at, products(slug, name, brand, image_url)'
      )
      .eq('user_id', profile.id)
      .eq('verdict', tab === 'worth' ? 'worth_it' : 'not_worth_it')
      .order('created_at', { ascending: false })
      .limit(50)
    verdicts = (data ?? []) as unknown as ProfileVerdictRow[]
  }

  // A friends only profile keeps its header but hides the verdicts from
  // anyone who is not a mutual follow. The database enforces this too.
  const hidden = verdicts.length === 0 && profile.privacy_setting === 'friends' && !isOwn

  const where = [profile.city, profile.country].filter(Boolean).join(', ')
  const profileUrl = `/profile/${profile.username}`

  const TABS: { key: Tab; label: string }[] = [
    { key: 'worth', label: 'Worth It' },
    { key: 'notworth', label: 'Not Worth It' },
    ...(isOwn ? [{ key: 'saved' as Tab, label: 'Saved' }] : []),
  ]

  return (
    <Screen>
      <header className="flex flex-col items-center text-center">
        {profile.profile_photo_url ? (
          <Image
            src={profile.profile_photo_url}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-worth-soft text-3xl font-bold text-[#2f7a55]">
            {(profile.first_name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
          {profile.first_name}
        </h1>
        {where && <p className="mt-0.5 text-sm text-neutral-500">{where}</p>}
        {profile.is_founding_member && (
          <div className="mt-3">
            <FoundingMemberBadge />
          </div>
        )}
        {profile.bio && (
          <p className="mt-3 max-w-sm text-base leading-relaxed text-neutral-700">{profile.bio}</p>
        )}
      </header>

      <dl className="mt-6 grid grid-cols-4 gap-2 rounded-2xl border border-neutral-200 bg-white py-4">
        {[
          { label: 'Verdicts', value: stats.verdicts },
          { label: 'Helpful', value: stats.helpful },
          { label: 'Following', value: stats.following },
          { label: 'Followers', value: stats.followers },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <dd className="text-lg font-bold tabular-nums text-neutral-900">{stat.value}</dd>
            <dt className="text-xs text-neutral-500">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex gap-3">
        {isOwn ? (
          <Link href="/profile/edit" className="flex-1">
            <span className="block rounded-2xl border border-neutral-300 px-5 py-3 text-center text-base font-semibold text-neutral-700">
              Edit profile
            </span>
          </Link>
        ) : (
          <div className="flex-1">
            <FollowButton
              targetUserId={profile.id}
              initialFollowing={Boolean(followRow.data)}
              initialFollowers={stats.followers}
              signedIn={Boolean(user)}
              path={profileUrl}
            />
          </div>
        )}
        <ShareButton
          url={profileUrl}
          text={`See what ${profile.first_name} thinks is worth buying on RateMama.`}
          label="Share"
          toast="Profile link copied"
          className="px-4 py-3"
        />
      </div>

      <nav className="mt-8 flex gap-1 border-b border-neutral-200" aria-label="Profile sections">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`${profileUrl}?tab=${t.key}`}
            className={cn(
              'flex-1 border-b-2 px-2 py-3 text-center text-sm font-semibold transition-colors',
              tab === t.key
                ? 'border-worth text-neutral-900'
                : 'border-transparent text-neutral-500'
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {hidden ? (
        <p className="mt-8 rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm leading-relaxed text-neutral-600">
          {profile.first_name} keeps their verdicts for friends only. Follow each other to see them.
        </p>
      ) : tab === 'saved' ? (
        savedProducts.length === 0 ? (
          <p className="mt-8 text-center text-sm leading-relaxed text-neutral-500">
            Nothing saved yet. Tap save on any product to keep it here.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {savedProducts.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/products/${row.products?.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-3"
                >
                  {row.products?.image_url && (
                    <Image
                      src={row.products.image_url}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-xl bg-neutral-50 object-contain"
                      unoptimized
                    />
                  )}
                  <span className="min-w-0">
                    {row.products?.brand && (
                      <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {row.products.brand}
                      </span>
                    )}
                    <span className="block text-sm font-semibold text-neutral-900">
                      {row.products?.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : verdicts.length === 0 ? (
        <p className="mt-8 text-center text-sm leading-relaxed text-neutral-500">
          {isOwn
            ? 'Nothing here yet. Rate a product and it will show up.'
            : `${profile.first_name} has not posted here yet.`}
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {verdicts.map((v) => (
            <li key={v.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <Link href={`/products/${v.products?.slug}`} className="flex items-center gap-3">
                {v.products?.image_url && (
                  <Image
                    src={v.products.image_url}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-xl bg-neutral-50 object-contain"
                    unoptimized
                  />
                )}
                <span className="min-w-0 flex-1">
                  {v.products?.brand && (
                    <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {v.products.brand}
                    </span>
                  )}
                  <span className="block truncate text-sm font-semibold text-neutral-900">
                    {v.products?.name}
                  </span>
                </span>
                <VerdictBadge verdict={v.verdict} />
              </Link>

              <p className="mt-3 text-base leading-relaxed text-neutral-800">{v.reason}</p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                {v.price_paid != null && <span>Paid {formatPrice(v.price_paid)}</span>}
                <span>{supermarketLabel(v.supermarket)}</span>
                <span>{timeAgo(v.created_at)}</span>
              </div>

              <div className="mt-3">
                <HelpfulButton
                  verdictId={v.id}
                  initialCount={v.helpful_count ?? 0}
                  initialVoted={votedOn.has(v.id)}
                  isOwn={isOwn}
                  signedIn={Boolean(user)}
                  path={profileUrl}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="h-12" />
    </Screen>
  )
}
