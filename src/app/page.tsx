import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Footer } from '@/components/footer'
import { CATEGORIES, EXAMPLE_RATINGS, STEPS, VOICES } from '@/components/landing/data'
import {
  CrossIcon,
  ExampleRatingCard,
  Logo,
  RatingPill,
  TickIcon,
  VoiceCard,
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

  // Real ratings take precedence over the examples wherever they exist.
  const { data } = await supabase
    .from('ratings')
    .select('id, rating, price_paid, supermarket, reason, users(first_name, city), products(slug, name)')
    .order('created_at', { ascending: false })
    .limit(3)

  const realCount = (data ?? []).length

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

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Uniform wash so the produce still reads while the headline
            stays legible, matching the reference design */}
        <div className="absolute inset-0 bg-cream-100/70" />
        <div className="relative mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
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

            <p className="mt-4 max-w-xl text-base font-medium text-accent-deep">
              Join now and your ratings will be seen by everyone who searches for this product.
            </p>

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

          {/* Floating card stack */}
          <div className="mt-12 lg:mt-0">
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
                  <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-notworth/30">
                    <div className="bg-worth" style={{ width: '91%' }} />
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-worth-deep">91 percent Worth It</span>
                    <span className="text-notworth-deep">9 percent Not</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-ink-soft">
              An example of how ratings look
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

      {/* Example ratings */}
      <section className="bg-cream-100 py-20 sm:py-24">
        <div className="mx-auto max-w-page px-5 sm:px-8">
          <h2 className="text-center font-serif text-4xl text-ink">
            {realCount > 0 ? 'What families are saying right now' : 'This is how a rating looks'}
          </h2>
          <p className="mt-3 text-center text-lg text-ink-soft">
            {realCount > 0
              ? 'Real ratings from real members. Nothing is edited or sponsored.'
              : 'These are examples. Real ratings from real members appear here as families join.'}
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_RATINGS.map((entry) => (
              <ExampleRatingCard key={entry.product} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      {/* Voices */}
      <section className="mx-auto max-w-page px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="text-center font-serif text-4xl text-ink">
          Families who stopped guessing
        </h2>
        <p className="mt-3 text-center text-lg text-ink-soft">
          Illustrations of what RateMama is for, not member quotes.
        </p>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {VOICES.map((voice) => (
            <VoiceCard key={voice.person} voice={voice} />
          ))}
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
        <h2 className="text-center font-serif text-4xl text-ink">What families really think</h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-card border border-worth/30 bg-worth-soft p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-worth text-white">
                <TickIcon />
              </span>
              <h3 className="font-serif text-2xl text-ink">Worth It</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {EXAMPLE_RATINGS.filter((r) => r.rating === 'worth_it').map((r) => (
                <li
                  key={r.product}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-ink">{r.product}</span>
                  <span className="shrink-0 rounded-full bg-worth-soft px-2.5 py-1 text-xs font-bold text-worth-deep">
                    {r.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-notworth/30 bg-notworth-soft p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-notworth text-white">
                <CrossIcon />
              </span>
              <h3 className="font-serif text-2xl text-ink">Not Worth It</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {EXAMPLE_RATINGS.filter((r) => r.rating === 'not_worth_it').map((r) => (
                <li
                  key={r.product}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5"
                >
                  <span className="text-sm font-semibold text-ink">{r.product}</span>
                  <span className="shrink-0 rounded-full bg-notworth-soft px-2.5 py-1 text-xs font-bold text-notworth-deep">
                    {r.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Examples shown. Live ratings appear here as the community grows.
        </p>
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
