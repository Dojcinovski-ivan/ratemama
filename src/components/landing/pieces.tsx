import { cn } from '@/components/ui'

export function RatingPill({ rating, className }: { rating: string; className?: string }) {
  const worth = rating === 'worth_it'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
        worth ? 'bg-worth-soft text-worth-deep' : 'bg-notworth-soft text-notworth-deep',
        className
      )}
    >
      {worth ? <TickIcon /> : <CrossIcon />}
      {worth ? 'Worth It' : 'Not Worth It'}
    </span>
  )
}

export function TickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 10.5l3.2 3.2L15 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export function ThumbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 20V10l4.5-6.5c1.2 0 2 .9 2 2V9h4.2c1.2 0 2.1 1.1 1.8 2.3l-1.6 6.4c-.2.8-1 1.3-1.8 1.3H7z" strokeLinejoin="round" />
      <path d="M7 10H4.5v10H7" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-worth text-white">
        <TickIcon className="h-4.5 w-4.5" />
      </span>
      <span className={cn('font-serif text-xl leading-none', dark ? 'text-white' : 'text-ink')}>
        RateMama
      </span>
    </span>
  )
}

/** One example rating card. Always presented as an example. */
/**
 * The sample card. It has no avatar, no name, no place and no helpful
 * count, because nobody wrote it. It exists to show the shape of a
 * rating and is always introduced as a sample.
 */
export function SampleRatingCard({
  entry,
}: {
  entry: { product: string; rating: string; price: string; shop: string; reason: string }
}) {
  return (
    <article className="flex h-full flex-col rounded-card border border-dashed border-cream-300 bg-white p-5">
      <span className="mb-3 inline-flex w-fit items-center rounded-full bg-cream-200 px-2.5 py-1 text-xs font-semibold text-ink-soft">
        Sample
      </span>
      <h3 className="font-sans text-base font-bold leading-snug text-ink">{entry.product}</h3>

      <div className="mt-3">
        <RatingPill rating={entry.rating} />
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {entry.price} at {entry.shop}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{entry.reason}</p>
    </article>
  )
}

/** A genuine member rating, straight from the database. */
export function RealRatingCard({
  entry,
}: {
  entry: {
    product: string
    slug: string | null
    rating: string
    price: string | null
    shop: string
    firstName: string | null
    city: string | null
    reason: string
  }
}) {
  const initial = (entry.firstName ?? '?').charAt(0).toUpperCase()
  return (
    <article className="flex h-full flex-col rounded-card border border-cream-300 bg-white p-5">
      <h3 className="font-sans text-base font-bold leading-snug text-ink">{entry.product}</h3>

      <div className="mt-3">
        <RatingPill rating={entry.rating} />
      </div>

      {entry.price && (
        <p className="mt-3 text-sm text-ink-soft">
          {entry.price} at {entry.shop}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-worth-soft text-xs font-bold text-worth-deep">
          {initial}
        </span>
        <span className="text-sm font-semibold text-ink">
          {entry.firstName ?? 'A member'}
          {entry.city ? <span className="font-normal text-ink-soft"> from {entry.city}</span> : null}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{entry.reason}</p>
    </article>
  )
}

