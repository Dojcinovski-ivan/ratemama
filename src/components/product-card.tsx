import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/components/ui'
import { formatPrice } from '@/lib/format'

export type ProductSummary = {
  id: string
  slug: string | null
  name: string
  brand: string | null
  image_url: string | null
  total_ratings: number | null
  worth_it_percentage: number | null
  average_price_gbp: number | null
}

/** Green from 50 percent up, red below. */
export function isWorthIt(percentage: number) {
  return percentage >= 50
}

export function WorthItBadge({
  percentage,
  ratings,
  className,
}: {
  percentage: number
  ratings: number
  className?: string
}) {
  if (ratings === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500',
          className
        )}
      >
        No ratings yet
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        isWorthIt(percentage) ? 'bg-worth text-worth-fg' : 'bg-notworth text-notworth-fg',
        className
      )}
    >
      {Math.round(percentage)} percent Worth It
    </span>
  )
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const ratings = product.total_ratings ?? 0
  const percentage = Number(product.worth_it_percentage ?? 0)
  const price = formatPrice(product.average_price_gbp)

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
    >
      <div className="relative aspect-square w-full bg-neutral-50">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-contain p-3"
            unoptimized
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && (
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            {product.brand}
          </p>
        )}
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
          {product.name}
        </p>
        <div className="mt-auto pt-2">
          <WorthItBadge percentage={percentage} ratings={ratings} />
          <p className="mt-1.5 text-xs text-neutral-500">
            {ratings > 0 ? `${ratings} ${ratings === 1 ? 'rating' : 'ratings'}` : 'Be the first'}
            {price ? ` · around ${price}` : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
