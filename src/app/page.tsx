import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Button, Screen, cn } from '@/components/ui'
import { Footer } from '@/components/footer'
import { RatingBadge } from '@/components/rating-card'
import { formatPrice, supermarketLabel } from '@/lib/format'

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

const STEPS = [
  {
    title: 'Tell us what you shop for',
    body: 'Quick setup. It takes about 30 seconds.',
  },
  {
    title: 'See what families really think',
    body: 'Honest ratings from real people, not sponsored reviews.',
  },
  {
    title: 'Share your rating',
    body: 'Help the next person make a better decision.',
  },
]

const REASONS = [
  {
    title: 'No sponsored content. Ever.',
    body: 'Every rating comes from a real person who bought the product with their own money.',
  },
  {
    title: 'Worth It or Not Worth It.',
    body: 'No confusing star ratings. Just a clear honest answer.',
  },
  {
    title: 'Real families, real prices.',
    body: 'See exactly what people paid and where they bought it.',
  },
]

export default async function Home() {
  const supabase = createClient()

  // Only ever real ratings. A review site should not put invented
  // reviews on its own front page.
  const { data } = await supabase
    .from('ratings')
    .select(
      'id, rating, price_paid, supermarket, reason, created_at, users(first_name, city), products(slug, name, brand, image_url)'
    )
    .order('created_at', { ascending: false })
    .limit(3)

  const examples = (data ?? []) as unknown as {
    id: string
    rating: string
    price_paid: number | null
    supermarket: string
    reason: string
    users: { first_name: string | null; city: string | null } | null
    products: { slug: string | null; name: string; brand: string | null; image_url: string | null } | null
  }[]

  return (
    <>
      <Screen className="sm:max-w-3xl">
        <section className="pt-6">
          <p className="text-lg font-bold text-worth">RateMama</p>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Real families. Honest ratings.
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Find out what is actually worth your money at the supermarket, from people who have
            already bought it.
          </p>

          <div className="mt-8 space-y-3 sm:flex sm:gap-3 sm:space-y-0">
            <Link href="/register" className="block sm:w-48">
              <Button>Join free</Button>
            </Link>
            <Link href="/discover" className="block sm:w-48">
              <Button variant="secondary">Browse products</Button>
            </Link>
          </div>

          <p className="mt-6 rounded-2xl bg-worth-soft px-4 py-4 text-sm leading-relaxed text-[#2f7a55]">
            We are just getting started. Join now and your ratings will be seen by everyone who
            searches for this product.
          </p>
        </section>

        {examples.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {examples.length === 1 ? 'The latest rating' : 'The latest ratings'}
            </h2>
            <div className="mt-4 space-y-3">
              {examples.map((r) => (
                <Link
                  key={r.id}
                  href={`/products/${r.products?.slug}`}
                  className="block rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    {r.products?.image_url && (
                      <Image
                        src={r.products.image_url}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-xl bg-neutral-50 object-contain"
                        unoptimized
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {r.products?.brand && (
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                          {r.products.brand}
                        </p>
                      )}
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {r.products?.name}
                      </p>
                    </div>
                    <RatingBadge rating={r.rating} />
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-neutral-800">{r.reason}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    {r.users?.first_name}
                    {r.users?.city ? ` in ${r.users.city}` : ''}
                    {r.price_paid != null ? `, paid ${formatPrice(r.price_paid)}` : ''}
                    {` at ${supermarketLabel(r.supermarket)}`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">How it works</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-worth text-base font-bold text-worth-fg">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-base font-semibold text-neutral-900">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-base leading-relaxed text-neutral-600">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Why RateMama</h2>
          <div className="mt-6 space-y-4">
            {REASONS.map((reason, index) => (
              <div
                key={reason.title}
                className={cn(
                  'rounded-2xl px-5 py-5',
                  index === 1 ? 'bg-worth-soft' : 'bg-neutral-100'
                )}
              >
                <p className="text-base font-bold text-neutral-900">{reason.title}</p>
                <p className="mt-1.5 text-base leading-relaxed text-neutral-700">{reason.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-worth px-6 py-10 text-center">
          <h2 className="text-2xl font-bold leading-snug text-worth-fg">
            Be one of the first voices.
          </h2>
          <p className="mt-2 text-base leading-relaxed text-worth-fg opacity-90">
            Founding members shape what this community becomes.
          </p>
          <Link href="/register" className="mt-6 block">
            <span className="block rounded-2xl bg-white px-5 py-3.5 text-base font-semibold text-[#2f7a55]">
              Join free
            </span>
          </Link>
        </section>
      </Screen>

      <Footer />
    </>
  )
}
