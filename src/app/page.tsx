import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Footer } from '@/components/footer'
import {
  CATEGORIES,
  MEANINGS,
  MIN_REAL_RATINGS,
  SAMPLE_RATING,
  STEPS,
} from '@/components/landing/data'
import {
  CrossIcon,
  Logo,
  RatingPill,
  RealRatingCard,
  SampleRatingCard,
  TickIcon,
} from '@/components/landing/pieces'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'RateMama. Real Ratings from Real Families',
  description:
    'Find out what families really think about everyday supermarket products. Honest Worth It or Not Worth It ratings from real people.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RateMama. Real Ratings from Real Families',
    description:
      'Find out what families really think about everyday supermarket products. Honest Worth It or Not Worth It ratings from real people.',
    type: 'website',
    url: '/',
  },
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=70'

export default async function Home() {
  const supabase = createClient()

  // Real ratings replace the sample entirely, but only once there are
  // enough of them to look like a community rather than one lonely card.
  const { data } = await supabase
    .from('ratings')
    .select('id, rating, price_paid, supermarket, reason, users(first_name, city), products(slug, name)')
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  const rows = (data ?? []) as unknown as {
    id: string
    rating: string
    price_paid: number | null
    supermarket: string
    reason: string
    users: { first_name: string | null; city: string | null } | null
    products: { slug: string | null; name: string } | null
  }[]

  const realRatings = rows.filter((r) => r.products)
  const showReal = realRatings.length >= MIN_REAL_RATINGS

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cream-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-page items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" aria-label="RateMama home">
            <Logo />
          </Link>
          <Link
            href="#how"
            className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block"
          >
            What is RateMama?
          </Link>
          <Link
            href="/onboarding/household"
            className="rounded-full bg-worth px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-worth-deep"
          >
            Join free
          </Link>
        </div>
      </header>

      {/* Hero.
          On a phone the photograph is its own band below the words rather
          than a backdrop behind them: a wash heavy enough to make body text
          legible over a busy shelf also destroys the photograph, so neither
          worked. On desktop there is room beside the text, so the photo
          stays behind and a gradient clears it where the words sit. */}
      <section className="relative overflow-hidden bg-cream-100">
        <div className="absolute inset-0 hidden lg:block">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/95 to-cream-100/10" />
        </div>
        <div className="relative mx-auto max-w-page px-5 pb-0 pt-14 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-24 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-worth-deep">
              <ShieldIcon />
              Real ratings from real families
            </span>

            <h1 className="mt-6 font-serif text-[2.75rem] leading-[1.05] text-ink sm:text-6xl">
              Is it worth
              <br />
              the money?
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Real families rate everyday supermarket products. No sponsored content. No fake
              reviews. Just honest opinions from people who actually bought it.
            </p>

            <div className="mt-5 max-w-xl rounded-r-xl border-l-4 border-accent bg-accent-soft px-4 py-3">
              <p className="text-base font-semibold leading-relaxed text-ink">
                Join now and your ratings will be seen by everyone who searches for this product.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding/household"
                className="rounded-full bg-worth px-8 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-worth-deep"
              >
                Join free
              </Link>
              <Link
                href="/discover"
                className="rounded-full border border-cream-300 bg-white px-8 py-4 text-center text-base font-semibold text-ink transition-colors hover:border-ink-soft"
              >
                See ratings
              </Link>
            </div>
          </div>

          {/* The photograph, at full strength, on phones only */}
          <div className="relative -mx-5 mt-12 h-44 sm:-mx-8 sm:h-56 lg:hidden">
            <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>

          {/* Floating card stack, overlapping the band on phones */}
          <div className="relative -mt-10 pb-14 lg:mt-0 lg:pb-0">
            <div className="mx-auto max-w-sm rounded-[1.75rem] bg-white/70 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur">
              <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-cream-300" />

              <div className="space-y-3">
                <div className="rounded-card bg-worth-soft p-4">
                  <p className="text-sm font-bold text-ink">Aldi Mamia Nappies Size 4</p>
                  <div className="mt-2">
                    <RatingPill rating="worth_it" className="bg-white/70" />
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">£2.79 at Aldi</p>
                </div>

                <div className="rounded-card bg-notworth-soft p-4">
                  <p className="text-sm font-bold text-ink">Heinz Baby Biscotti</p>
                  <div className="mt-2">
                    <RatingPill rating="not_worth_it" className="bg-white/70" />
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">£2.50 at Tesco</p>
                </div>

                <div className="rounded-card bg-white p-4">
                  <p className="text-sm font-bold text-ink">Tesco Everyday Value Pasta</p>
                  <p className="mt-2 text-sm text-ink-soft">
                    Every product ends up with one of two answers, and the reason behind it.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-ink-soft">
              A sample, to show the format. Not real ratings.
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-accent-soft">
        <p className="mx-auto max-w-page px-5 py-5 text-center text-base font-medium text-accent-deep sm:px-8">
          RateMama is completely free. Every rating comes from a real person who paid for the
          product themselves.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-page px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="text-center font-serif text-4xl text-ink">How it works</h2>
        <p className="mt-3 text-center text-lg text-ink-soft">Three steps. Thirty seconds.</p>

        <div className="mt-14 space-y-16">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={800}
                  height={560}
                  className="aspect-[4/3] w-full rounded-card object-cover"
                />
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-worth-soft text-base font-bold text-worth-deep">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-serif text-3xl leading-tight text-ink">{step.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ratings, real ones when there are enough, otherwise the format */}
      <section className="bg-cream-100 py-20 sm:py-24">
        <div className="mx-auto max-w-page px-5 sm:px-8">
          <h2 className="text-center font-serif text-4xl text-ink">
            {showReal ? 'What families are saying right now' : 'This is how a rating works'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-ink-soft">
            {showReal
              ? 'Real ratings from real members. Nothing is edited or sponsored.'
              : 'Nobody has rated enough products yet to fill this space, so here is the format. Real ratings from real members appear here as families join.'}
          </p>

          {showReal ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {realRatings.map((r) => (
                <RealRatingCard
                  key={r.id}
                  entry={{
                    product: r.products!.name,
                    slug: r.products!.slug,
                    rating: r.rating,
                    price: r.price_paid != null ? `£${Number(r.price_paid).toFixed(2)}` : null,
                    shop: r.supermarket,
                    firstName: r.users?.first_name ?? null,
                    city: r.users?.city ?? null,
                    reason: r.reason,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-sm">
              <SampleRatingCard entry={SAMPLE_RATING} />
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream-100 py-20 sm:py-24">
        <div className="mx-auto max-w-page px-5 sm:px-8">
          <h2 className="mx-auto max-w-2xl text-center font-serif text-4xl leading-tight text-ink">
            Find ratings for what you actually buy every week
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="rounded-card border border-cream-300 bg-white p-6 transition-colors hover:border-worth"
              >
                <span aria-hidden className="text-2xl">
                  {category.emoji}
                </span>
                <p className="mt-3 text-base font-bold text-ink">{category.label}</p>
                <p className="mt-1 text-sm text-ink-soft">Browse ratings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Worth it versus not */}
      <section className="mx-auto max-w-page px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="text-center font-serif text-4xl text-ink">Only two answers</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-ink-soft">
          No stars, no scores out of ten. Every product gets one of two answers and a reason.
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {MEANINGS.map((m) => {
            const worth = m.kind === 'worth_it'
            return (
              <div
                key={m.kind}
                className={
                  worth
                    ? 'rounded-card border border-worth/30 bg-worth-soft p-6'
                    : 'rounded-card border border-notworth/30 bg-notworth-soft p-6'
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      worth
                        ? 'flex h-9 w-9 items-center justify-center rounded-full bg-worth text-white'
                        : 'flex h-9 w-9 items-center justify-center rounded-full bg-notworth text-white'
                    }
                  >
                    {worth ? <TickIcon /> : <CrossIcon />}
                  </span>
                  <h3 className="font-serif text-2xl text-ink">{m.title}</h3>
                </div>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">{m.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Closing */}
      <section className="texture-cream py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Stop buying products that let you down.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            RateMama is free. Real families rate real products. No sponsors, no algorithms, no
            guessing.
          </p>
          <Link
            href="/onboarding/household"
            className="mt-9 inline-block rounded-full bg-worth px-10 py-4.5 text-lg font-semibold text-white transition-colors hover:bg-worth-deep"
          >
            Join RateMama free
          </Link>
          <p className="mt-4 text-sm text-ink-soft">
            No credit card. No spam. Just honest ratings from real families.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 2.5l6 2.2v4.6c0 3.5-2.4 6.6-6 8.2-3.6-1.6-6-4.7-6-8.2V4.7z" strokeLinejoin="round" />
      <path d="M7.4 10.2l1.9 1.9 3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
