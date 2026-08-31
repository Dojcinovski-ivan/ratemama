import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { FROM, button, foundingBadge, shell, siteUrl } from './layout'
import { unsubscribeUrl } from './unsubscribe-token'

type SendArgs = {
  userId: string
  to: string
  subject: string
  heading: string
  bodyHtml: string
  emailType: string
  /** What the email is about, so the same kind can send again for a different thing. */
  referenceId?: string
  includeUnsubscribe?: boolean
}

/**
 * Sends once and only once for a given person, kind and subject matter.
 *
 * The row in sent_emails is claimed before the send, so a retry or a
 * double trigger cannot produce a duplicate. If the send then fails the
 * claim is released so a later attempt can try again.
 */
export async function sendOnce({
  userId,
  to,
  subject,
  heading,
  bodyHtml,
  emailType,
  referenceId,
  includeUnsubscribe = true,
}: SendArgs): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set, skipping ${emailType}`)
    return { sent: false, reason: 'no api key' }
  }

  const admin = createAdminClient()

  const { error: claimError } = await admin
    .from('sent_emails')
    .insert({ user_id: userId, email_type: emailType, reference_id: referenceId ?? null })

  if (claimError) {
    if (claimError.code !== '23505') console.error(`[email] claim failed for ${emailType}`, claimError)
    return { sent: false, reason: 'already sent' }
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: shell({
        heading,
        bodyHtml,
        unsubscribeUrl: includeUnsubscribe ? unsubscribeUrl(userId) : undefined,
      }),
    })
    return { sent: true }
  } catch (error) {
    console.error(`[email] send failed for ${emailType}`, error)
    await admin
      .from('sent_emails')
      .delete()
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .eq('reference_id', referenceId ?? null)
    return { sent: false, reason: 'send failed' }
  }
}

const p = (text: string) =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#404040;">${text}</p>`

/** Email 1: welcome, sent after email confirmation. */
export async function sendWelcomeEmail(userId: string, to: string, firstName: string) {
  return sendOnce({
    userId,
    to,
    emailType: 'welcome',
    subject: 'Welcome to RateMama. Your ratings matter.',
    heading: 'You are in.',
    bodyHtml:
      foundingBadge() +
      p(firstName ? `Hi ${firstName},` : 'Hi,') +
      p(
        'You are one of our founding members. Every rating you leave helps real families make better decisions.'
      ) +
      button(`${siteUrl()}/feed`, 'Start exploring'),
  })
}

/** Email 3: someone found your rating helpful. */
export async function sendHelpfulEmail(args: {
  userId: string
  to: string
  actorName: string
  productName: string
  productSlug: string
  ratingId: string
}) {
  return sendOnce({
    userId: args.userId,
    to: args.to,
    emailType: 'helpful_vote',
    referenceId: args.ratingId,
    subject: `${args.actorName} found your rating helpful`,
    heading: 'Your rating is helping people.',
    bodyHtml:
      p(
        `Someone found your rating on ${args.productName} helpful. Your opinions are making a difference.`
      ) + button(`${siteUrl()}/products/${args.productSlug}`, 'See your rating'),
  })
}

/** Email 4: someone you follow rated something. */
export async function sendFriendRatingEmail(args: {
  userId: string
  to: string
  actorName: string
  actorCity: string | null
  productName: string
  productSlug: string
  rating: string
  reason: string
  ratingId: string
}) {
  const words = args.rating === 'worth_it' ? 'Worth It' : 'Not Worth It'
  const where = args.actorCity ? ` from ${args.actorCity}` : ''

  return sendOnce({
    userId: args.userId,
    to: args.to,
    emailType: 'friend_rating',
    referenceId: args.ratingId,
    subject: `${args.actorName} just rated ${args.productName}`,
    heading: 'A friend just rated something.',
    bodyHtml:
      p(`${args.actorName}${where} said ${args.productName} is ${words}.`) +
      `<p style="margin:0 0 16px;padding:14px 16px;background:#f6f6f4;border-radius:12px;font-size:16px;line-height:1.65;color:#404040;">${args.reason}</p>` +
      button(`${siteUrl()}/products/${args.productSlug}`, 'See the full rating'),
  })
}

/** Email 5: a product you rated early reached ten ratings. */
export async function sendMilestoneEmail(args: {
  userId: string
  to: string
  productName: string
  productSlug: string
  productId: string
}) {
  return sendOnce({
    userId: args.userId,
    to: args.to,
    emailType: 'milestone_ten',
    referenceId: args.productId,
    subject: 'Your rating is making an impact',
    heading: 'You were one of the first.',
    bodyHtml:
      p(
        `The product you rated, ${args.productName}, now has 10 ratings. You were one of the first.`
      ) + button(`${siteUrl()}/products/${args.productSlug}`, 'See all ratings'),
  })
}

/** Email 2: the Monday digest. */
export async function sendDigestEmail(args: {
  userId: string
  to: string
  firstName: string
  weekKey: string
  topHelpful: { product: string; slug: string; reason: string; name: string }[]
  forYou: { product: string; slug: string; reason: string; name: string }[]
  friends: { product: string; slug: string; reason: string; name: string }[]
}) {
  const section = (title: string, rows: typeof args.topHelpful) => {
    if (rows.length === 0) return ''
    return (
      `<p style="margin:24px 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#8a8a8a;">${title}</p>` +
      rows
        .map(
          (r) =>
            `<a href="${siteUrl()}/products/${r.slug}" style="display:block;margin:0 0 10px;padding:14px 16px;background:#f6f6f4;border-radius:12px;text-decoration:none;">
               <span style="display:block;font-size:15px;font-weight:600;color:#171717;">${r.product}</span>
               <span style="display:block;margin-top:4px;font-size:14px;line-height:1.6;color:#525252;">${r.reason}</span>
               <span style="display:block;margin-top:6px;font-size:13px;color:#8a8a8a;">${r.name}</span>
             </a>`
        )
        .join('')
    )
  }

  return sendOnce({
    userId: args.userId,
    to: args.to,
    emailType: 'weekly_digest',
    referenceId: args.weekKey,
    subject: 'This week on RateMama',
    heading: args.firstName ? `Here is your week, ${args.firstName}.` : 'Here is your week.',
    bodyHtml:
      p('The ratings families found most useful over the past seven days.') +
      section('Most helpful this week', args.topHelpful) +
      section('Picked for what you shop for', args.forYou) +
      section('From people you follow', args.friends) +
      `<div style="height:20px"></div>` +
      button(`${siteUrl()}/feed`, 'See all ratings'),
  })
}
