import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, supermarketLabel, timeAgo } from '@/lib/format'
import { cn } from '@/components/ui'

export type RatingAuthor = {
  first_name: string | null
  city: string | null
  profile_photo_url: string | null
  is_founding_member: boolean | null
}

export type RatingWithContext = {
  id: string
  rating: string
  price_paid: number | null
  currency: string | null
  supermarket: string
  reason: string
  alternative_product: string | null
  helpful_count: number | null
  created_at: string
  users: RatingAuthor | null
  products?: {
    slug: string | null
    name: string
    brand: string | null
    image_url: string | null
  } | null
}

export function RatingBadge({ rating }: { rating: string }) {
  const worth = rating === 'worth_it'
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

function Avatar({ author }: { author: RatingAuthor | null }) {
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
export function RatingCard({
  rating,
  showProduct = false,
}: {
  rating: RatingWithContext
  showProduct?: boolean
}) {
  const price = formatPrice(rating.price_paid, rating.currency ?? 'GBP')

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4">
      {showProduct && rating.products && (
        <Link
          href={rating.products.slug ? `/products/${rating.products.slug}` : '#'}
          className="mb-3 flex items-center gap-3"
        >
          {rating.products.image_url && (
            <Image
              src={rating.products.image_url}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl bg-neutral-50 object-contain"
              unoptimized
            />
          )}
          <span className="min-w-0">
            {rating.products.brand && (
              <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
                {rating.products.brand}
              </span>
            )}
            <span className="block truncate text-sm font-semibold text-neutral-900">
              {rating.products.name}
            </span>
          </span>
        </Link>
      )}

      <div className="flex items-start gap-3">
        <Avatar author={rating.users} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-neutral-900">
              {rating.users?.first_name ?? 'Someone'}
            </span>
            {rating.users?.city && (
              <span className="text-sm text-neutral-500">{rating.users.city}</span>
            )}
            {rating.users?.is_founding_member && (
              <span className="rounded-full bg-worth-soft px-2 py-0.5 text-xs font-semibold text-[#2f7a55]">
                Founding member
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400">{timeAgo(rating.created_at)}</p>
        </div>
        <RatingBadge rating={rating.rating} />
      </div>

      <p className="mt-3 text-base leading-relaxed text-neutral-800">{rating.reason}</p>

      {rating.alternative_product && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Buys instead: <span className="font-medium">{rating.alternative_product}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
        {price && <span>Paid {price}</span>}
        <span>{supermarketLabel(rating.supermarket)}</span>
        {(rating.helpful_count ?? 0) > 0 && (
          <span>
            {rating.helpful_count} found this helpful
          </span>
        )}
      </div>
    </article>
  )
}
