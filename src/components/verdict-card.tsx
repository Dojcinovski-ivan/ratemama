import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, supermarketLabel, timeAgo } from '@/lib/format'
import { cn } from '@/components/ui'

export type VerdictAuthor = {
  first_name: string | null
  city: string | null
  profile_photo_url: string | null
  is_founding_member: boolean | null
}

export type VerdictWithContext = {
  id: string
  verdict: string
  price_paid: number | null
  currency: string | null
  supermarket: string
  reason: string
  alternative_product: string | null
  helpful_count: number | null
  created_at: string
  users: VerdictAuthor | null
  products?: {
    slug: string | null
    name: string
    brand: string | null
    image_url: string | null
  } | null
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const worth = verdict === 'worth_it'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold',
        worth ? 'bg-worth text-worth-fg' : 'bg-notworth text-notworth-fg'
      )}
    >
      {worth ? 'Worth It' : 'Not Worth It'}
    </span>
  )
}

function Avatar({ author }: { author: VerdictAuthor | null }) {
  const initial = (author?.first_name ?? '?').charAt(0).toUpperCase()
  if (author?.profile_photo_url) {
    return (
      <Image
        src={author.profile_photo_url}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        unoptimized
      />
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-worth-soft text-sm font-semibold text-[#2f7a55]">
      {initial}
    </span>
  )
}

/** Only ever renders first name. Surname is never exposed. */
export function VerdictCard({
  verdict,
  showProduct = false,
}: {
  verdict: VerdictWithContext
  showProduct?: boolean
}) {
  const price = formatPrice(verdict.price_paid, verdict.currency ?? 'GBP')

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4">
      {showProduct && verdict.products && (
        <Link
          href={verdict.products.slug ? `/products/${verdict.products.slug}` : '#'}
          className="mb-3 flex items-center gap-3"
        >
          {verdict.products.image_url && (
            <Image
              src={verdict.products.image_url}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl bg-neutral-50 object-contain"
              unoptimized
            />
          )}
          <span className="min-w-0">
            {verdict.products.brand && (
              <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
                {verdict.products.brand}
              </span>
            )}
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {verdict.products.name}
            </span>
          </span>
        </Link>
      )}

      <div className="flex items-start gap-3">
        <Avatar author={verdict.users} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-neutral-900">
              {verdict.users?.first_name ?? 'Someone'}
            </span>
            {verdict.users?.city && (
              <span className="text-sm text-neutral-500">{verdict.users.city}</span>
            )}
            {verdict.users?.is_founding_member && (
              <span className="rounded-full bg-worth-soft px-2 py-0.5 text-xs font-semibold text-[#2f7a55]">
                Founding member
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400">{timeAgo(verdict.created_at)}</p>
        </div>
        <VerdictBadge verdict={verdict.verdict} />
      </div>

      <p className="mt-3 text-base leading-relaxed text-neutral-800">{verdict.reason}</p>

      {verdict.alternative_product && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Buys instead: <span className="font-medium">{verdict.alternative_product}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
        {price && <span>Paid {price}</span>}
        <span>{supermarketLabel(verdict.supermarket)}</span>
        {(verdict.helpful_count ?? 0) > 0 && (
          <span>
            {verdict.helpful_count} found this helpful
          </span>
        )}
      </div>
    </article>
  )
}
