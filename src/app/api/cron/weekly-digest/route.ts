import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cronAuthorised } from '@/lib/cron-auth'
import { sendDigestEmail } from '@/lib/email/send'
import { tagsForFilters } from '@/lib/categories'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Row = { product: string; slug: string; reason: string; name: string }

/** ISO week key, so a digest can only send once per person per week. */
function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function toRows(rows: unknown[]): Row[] {
  return (rows as {
    reason: string
    users: { first_name: string | null; city: string | null } | null
    products: { name: string; slug: string } | null
  }[])
    .filter((r) => r.products)
    .map((r) => ({
      product: r.products!.name,
      slug: r.products!.slug,
      reason: r.reason,
      name: [r.users?.first_name, r.users?.city].filter(Boolean).join(' in ') || 'A member',
    }))
}

export async function GET(request: Request) {
  if (!cronAuthorised(request)) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  // Vercel Hobby can coerce a weekly schedule to daily, so the day is
  // checked here rather than trusted from the cron expression.
  const isMonday = new Date().getUTCDay() === 1
  const force = new URL(request.url).searchParams.get('force') === '1'
  if (!isMonday && !force) {
    return NextResponse.json({ ok: true, skipped: 'not Monday' })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const key = weekKey()

  const SELECT =
    'id, reason, helpful_count, created_at, user_id, users(first_name, city), products(name, slug, category)'

  const { data: weekRatings } = await admin
    .from('ratings')
    .select(SELECT)
    .gte('created_at', since)
    .order('helpful_count', { ascending: false })
    .limit(200)

  const week = (weekRatings ?? []) as unknown as {
    id: string
    user_id: string
    reason: string
    products: { name: string; slug: string; category: string } | null
  }[]

  const topHelpful = toRows(week.slice(0, 5))

  const { data: consenting } = await admin
    .from('users')
    .select('id, email, first_name')
    .eq('email_marketing_consent', true)

  let sent = 0
  let skipped = 0

  for (const user of (consenting ?? []) as { id: string; email: string; first_name: string }[]) {
    const [{ data: profile }, { data: followingRows }] = await Promise.all([
      admin.from('user_profiles').select('shopping_categories').eq('user_id', user.id).maybeSingle(),
      admin.from('follows').select('following_id').eq('follower_id', user.id),
    ])

    const tags = tagsForFilters((profile?.shopping_categories as string[]) ?? [])
    const forYou = toRows(
      week.filter((r) => r.products && tags.includes(r.products.category)).slice(0, 3)
    )

    const followingIds = new Set(
      ((followingRows ?? []) as { following_id: string }[]).map((f) => f.following_id)
    )
    const friends = toRows(week.filter((r) => followingIds.has(r.user_id)).slice(0, 3))

    // Nothing to say is better than an empty email.
    if (topHelpful.length === 0 && forYou.length === 0 && friends.length === 0) {
      skipped += 1
      continue
    }

    const result = await sendDigestEmail({
      userId: user.id,
      to: user.email,
      firstName: user.first_name,
      weekKey: key,
      topHelpful,
      forYou,
      friends,
    })
    if (result.sent) sent += 1
    else skipped += 1
  }

  return NextResponse.json({ ok: true, week: key, sent, skipped })
}
