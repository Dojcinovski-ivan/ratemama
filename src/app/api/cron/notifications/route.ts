import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cronAuthorised } from '@/lib/cron-auth'
import { sendFriendRatingEmail, sendHelpfulEmail, sendMilestoneEmail } from '@/lib/email/send'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LOOKBACK_HOURS = 26

/**
 * Daily pass over yesterday's activity, sending emails 3, 4 and 5.
 * Every send is deduplicated in sent_emails, so an overlapping window
 * or a retry cannot send the same message twice.
 */
export async function GET(request: Request) {
  if (!cronAuthorised(request)) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const admin = createAdminClient()
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString()
  const counts = { helpful: 0, friend: 0, milestone: 0, skipped: 0 }

  // Only people who asked for email hear from us.
  const { data: consenting } = await admin
    .from('users')
    .select('id, email, first_name')
    .eq('email_marketing_consent', true)

  const allowed = new Map(
    ((consenting ?? []) as { id: string; email: string; first_name: string }[]).map((u) => [u.id, u])
  )

  // Email 3: helpful votes on your ratings.
  const { data: votes } = await admin
    .from('rating_votes')
    .select('rating_id, user_id, created_at')
    .gte('created_at', since)

  for (const vote of (votes ?? []) as { rating_id: string; user_id: string }[]) {
    const { data: rating } = await admin
      .from('ratings')
      .select('id, user_id, products(name, slug)')
      .eq('id', vote.rating_id)
      .maybeSingle()

    const author = rating?.user_id ? allowed.get(rating.user_id) : undefined
    if (!rating || !author || rating.user_id === vote.user_id) {
      counts.skipped += 1
      continue
    }

    const { data: actor } = await admin
      .from('users')
      .select('first_name')
      .eq('id', vote.user_id)
      .maybeSingle()

    const product = rating.products as unknown as { name: string; slug: string } | null
    if (!product) continue

    const result = await sendHelpfulEmail({
      userId: author.id,
      to: author.email,
      actorName: actor?.first_name ?? 'Someone',
      productName: product.name,
      productSlug: product.slug,
      ratingId: rating.id,
    })
    if (result.sent) counts.helpful += 1
  }

  // Email 4: ratings from people you follow.
  const { data: recent } = await admin
    .from('ratings')
    .select('id, user_id, rating, reason, created_at, products(name, slug)')
    .gte('created_at', since)

  for (const r of (recent ?? []) as {
    id: string
    user_id: string
    rating: string
    reason: string
    products: unknown
  }[]) {
    const { data: followers } = await admin
      .from('follows')
      .select('follower_id')
      .eq('following_id', r.user_id)

    const { data: actor } = await admin
      .from('users')
      .select('first_name, city')
      .eq('id', r.user_id)
      .maybeSingle()

    const product = r.products as { name: string; slug: string } | null
    if (!product) continue

    for (const f of (followers ?? []) as { follower_id: string }[]) {
      const recipient = allowed.get(f.follower_id)
      if (!recipient) continue

      const result = await sendFriendRatingEmail({
        userId: recipient.id,
        to: recipient.email,
        actorName: actor?.first_name ?? 'Someone',
        actorCity: actor?.city ?? null,
        productName: product.name,
        productSlug: product.slug,
        rating: r.rating,
        reason: r.reason,
        ratingId: r.id,
      })
      if (result.sent) counts.friend += 1
    }
  }

  // Email 5: products that have just reached ten ratings.
  const { data: milestones } = await admin
    .from('products')
    .select('id, name, slug, total_ratings')
    .gte('total_ratings', 10)
    .limit(200)

  for (const product of (milestones ?? []) as {
    id: string
    name: string
    slug: string
  }[]) {
    const { data: raters } = await admin
      .from('ratings')
      .select('user_id')
      .eq('product_id', product.id)

    for (const row of (raters ?? []) as { user_id: string }[]) {
      const recipient = allowed.get(row.user_id)
      if (!recipient) continue

      const result = await sendMilestoneEmail({
        userId: recipient.id,
        to: recipient.email,
        productName: product.name,
        productSlug: product.slug,
        productId: product.id,
      })
      if (result.sent) counts.milestone += 1
    }
  }

  return NextResponse.json({ ok: true, ...counts })
}
