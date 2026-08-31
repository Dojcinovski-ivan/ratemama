import Image from 'next/image'
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
export function ExampleRatingCard({
  entry,
}: {
  entry: {
    product: string
    rating: string
    price: string
    shop: string
    person: string
    place: string
    initials: string
    reason: string
    helpful: number
  }
}) {
  return (
    <article className="flex h-full flex-col rounded-card border border-cream-300 bg-white p-5">
      <h3 className="font-sans text-base font-bold leading-snug text-ink">{entry.product}</h3>

      <div className="mt-3">
        <RatingPill rating={entry.rating} />
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {entry.price} at {entry.shop}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-ink-soft">
          {entry.initials}
        </span>
        <span className="text-sm font-semibold text-ink">
          {entry.person} from {entry.place}
        </span>
      </div>

      <p className="mt-3 text-base leading-relaxed text-ink-soft">{entry.reason}</p>

      <div className="mt-auto flex items-center gap-2 border-t border-cream-300 pt-4 text-sm text-ink-soft">
        <ThumbIcon />
        {entry.helpful} families found this helpful
      </div>
    </article>
  )
}

export function VoiceCard({
  voice,
}: {
  voice: { quote: string; person: string; place: string; photo: string }
}) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-cream-300 bg-white p-6">
      <blockquote className="font-serif text-xl leading-snug text-ink">
        “{voice.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        <Image
          src={voice.photo}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover"
          unoptimized
        />
        <span className="text-sm font-semibold text-ink">
          {voice.person}, {voice.place}
        </span>
      </figcaption>
    </figure>
  )
}
