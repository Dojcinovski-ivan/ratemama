import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { VerdictCard } from '@/components/verdict-card'
import { isWorthIt } from '@/components/product-card'
import { Button, Screen, cn } from '@/components/ui'
import { formatPrice } from '@/lib/format'
import { categoryLabel } from '@/lib/categories'
import { buildLink, retailersFor } from '@/lib/retailers'
import { HelpfulButton } from '@/components/helpful-button'
import { ShareButton } from '@/components/share-button'
import { SaveButton } from '@/components/save-button'
import { getProductBySlug, priceStats, topAlternative, VERDICT_FIELDS, type VerdictRow } from './queries'

export const revalidate = 60

const PAGE_SIZE = 10
const EARLY_COMMUNITY_THRESHOLD = 5

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Product not found | RateMama' }

  const name = [product.brand, product.name].filter(Boolean).join(' ')
  const verdicts = product.total_verdicts ?? 0
  const percentage = Math.round(Number(product.worth_it_percentage ?? 0))

  const title = `${name}. Worth It or Not? | RateMama`
  const description =
    verdicts > 0
      ? `${percentage} percent of RateMama members say ${name} is worth the money. Read ${verdicts} honest ${verdicts === 1 ? 'verdict' : 'verdicts'} from real families.`
      : `Nobody has rated ${name} yet. Be the first to tell other families whether it is worth the money.`

  return {
    title,
    description,
    alternates: { canonical: `/products/${params.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/products/${params.slug}`,
      images: product.image_url ? [{ url: product.image_url, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const supabase = createClient()
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const page = Math.max(1, Number(searchParams.page ?? '1') || 1)
  const from = (page - 1) * PAGE_SIZE

  const [{ data: pageRows, count }, { data: allRows }, profileResult, votesResult] =
    await Promise.all([
      supabase
        .from('verdicts')
        .select(VERDICT_FIELDS, { count: 'exact' })
        .eq('product_id', product.id)
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1),
      // Small enough to pull for the price picture and top verdicts.
      supabase
        .from('verdicts')
        .select('user_id, verdict, price_paid, alternative_product, helpful_count')
        .eq('product_id', product.id)
        .limit(500),
      user
        ? supabase.from('user_profiles').select('preferred_supermarkets').eq('user_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from('verdict_votes').select('verdict_id').eq('user_id', user.id)
        : Promise.resolve({ data: null }),
    ])

  const { data: savedRow } = user
    ? await supabase
        .from('saved_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle()
    : { data: null }

  const verdicts = (pageRows ?? []) as unknown as VerdictRow[]
  const summary = (allRows ?? []) as {
    user_id: string
    verdict: string
    price_paid: number | null
    alternative_product: string | null
    helpful_count: number | null
  }[]

  const votedOn = new Set(((votesResult.data ?? []) as { verdict_id: string }[]).map((v) => v.verdict_id))
  const totalVerdicts = count ?? product.total_verdicts ?? 0
  const percentage = Math.round(Number(product.worth_it_percentage ?? 0))
  const worth = isWorthIt(percentage)
  const prices = priceStats(summary)
  const alternative = topAlternative(summary)
  const mine = user ? verdicts.find((v) => v.user_id === user.id) : undefined
  const hasMineAnywhere = user ? summary.some((v) => v.user_id === user.id) : false

  const bestWorth = summary.filter((v) => v.verdict === 'worth_it').sort((a, b) => (b.helpful_count ?? 0) - (a.helpful_count ?? 0))[0]
  const bestNotWorth = summary.filter((v) => v.verdict === 'not_worth_it').sort((a, b) => (b.helpful_count ?? 0) - (a.helpful_count ?? 0))[0]

  const retailers = retailersFor(profileResult.data?.preferred_supermarkets as string[] | undefined)
  const searchTerm = [product.brand, product.name].filter(Boolean).join(' ')
  const totalPages = Math.max(1, Math.ceil(totalVerdicts / PAGE_SIZE))

  // Structured data is only valid with at least one review, so an empty
  // product emits none rather than an aggregate rating of zero.
  const jsonLd =
    totalVerdicts > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: searchTerm,
          image: product.image_url ?? undefined,
          brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
          gtin: product.barcode ?? undefined,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (percentage / 20).toFixed(1),
            bestRating: '5',
            worstRating: '1',
            ratingCount: totalVerdicts,
          },
          review: verdicts.slice(0, 5).map((v) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: v.users?.first_name ?? 'RateMama member' },
            datePublished: v.created_at,
            reviewBody: v.reason,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: v.verdict === 'worth_it' ? '5' : '1',
              bestRating: '5',
              worstRating: '1',
            },
          })),
        }
      : null

  return (
    <Screen>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Link href="/discover" className="mb-5 text-sm font-medium text-neutral-500">
        Back to products
      </Link>

      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        {product.image_url && (
          <div className="relative aspect-square w-full bg-neutral-50">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 100vw, 448px"
              className="object-contain p-6"
              unoptimized
              priority
            />
          </div>
        )}
        <div className="border-t border-neutral-100 px-5 py-4">
          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
            {categoryLabel(product.category)}
          </span>
          {product.brand && (
            <p className="mt-2 text-sm font-medium uppercase tracking-wide text-neutral-500">
              {product.brand}
            </p>
          )}
          <h1 className="mt-0.5 text-xl font-bold leading-snug text-neutral-900">{product.name}</h1>
          {product.barcode && (
            <p className="mt-2 text-xs text-neutral-400">Barcode {product.barcode}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SaveButton
          productId={product.id}
          initialSaved={Boolean(savedRow)}
          signedIn={Boolean(user)}
          path={`/products/${params.slug}`}
        />
        <ShareButton
          url={`/products/${params.slug}`}
          text={`Check out what people think of ${product.name} on RateMama.${
            totalVerdicts > 0 ? ` ${percentage} percent say it is worth it.` : ''
          }`}
        />
      </div>

      {/* Verdict summary */}
      <section className="mt-6">
        {totalVerdicts > 0 ? (
          <>
            <p className={cn('text-4xl font-bold', worth ? 'text-worth' : 'text-notworth')}>
              {percentage} percent Worth It
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Based on {totalVerdicts} {totalVerdicts === 1 ? 'verdict' : 'verdicts'}
            </p>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-neutral-200">
              <div className="bg-worth" style={{ width: `${percentage}%` }} />
              <div className="bg-notworth" style={{ width: `${100 - percentage}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
              <span>{product.worth_it_count} Worth It</span>
              <span>{product.not_worth_it_count} Not Worth It</span>
            </div>
            {totalVerdicts < EARLY_COMMUNITY_THRESHOLD && (
              <p className="mt-4 rounded-2xl bg-worth-soft px-4 py-3 text-sm leading-relaxed text-[#2f7a55]">
                Only {totalVerdicts} {totalVerdicts === 1 ? 'verdict' : 'verdicts'} so far. Be one of
                the first to review this product.
              </p>
            )}
          </>
        ) : (
          <p className="rounded-2xl bg-worth-soft px-4 py-4 text-sm leading-relaxed text-[#2f7a55]">
            No verdicts so far. Be one of the first to review this product and help other families
            decide.
          </p>
        )}
      </section>

      {/* Price */}
      {prices && (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
          <p className="text-base font-semibold text-neutral-900">
            Community pays around {formatPrice(prices.average)}
          </p>
          {prices.min !== prices.max && (
            <p className="mt-1 text-sm text-neutral-500">
              {formatPrice(prices.min)} to {formatPrice(prices.max)}
            </p>
          )}
        </section>
      )}

      {/* Where to buy */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-neutral-900">Where to buy</h2>
        <p className="mt-1 text-xs text-neutral-500">
          These are shopping links. They open the retailer website.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {retailers.map((retailer) => (
            <li key={retailer.value}>
              <a
                href={buildLink(retailer, searchTerm)}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="inline-flex rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:border-neutral-400"
              >
                {retailer.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Top verdicts */}
      {(bestWorth || bestNotWorth || alternative) && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-neutral-900">The standout verdicts</h2>
          <div className="mt-3 space-y-3">
            {verdicts
              .filter((v) => v.id && (v.verdict === 'worth_it' || v.verdict === 'not_worth_it'))
              .slice(0, 2)
              .map((v) => (
                <VerdictCard key={`top-${v.id}`} verdict={v} />
              ))}
          </div>
          {alternative && alternative.count > 0 && (
            <p className="mt-3 rounded-2xl bg-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-700">
              Most suggested alternative: <span className="font-semibold">{alternative.label}</span>
              {alternative.count > 1 ? `, mentioned ${alternative.count} times` : ''}
            </p>
          )}
        </section>
      )}

      {/* Submit */}
      <section className="mt-8">
        {!user ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-6">
            <p className="text-base leading-relaxed text-neutral-700">
              Join RateMama to share your verdict.
            </p>
            <Link href={`/register`} className="mt-4 block">
              <Button>Join RateMama to share your verdict</Button>
            </Link>
          </div>
        ) : hasMineAnywhere && mine ? (
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Your verdict</h2>
            <div className="mt-3">
              <VerdictCard verdict={mine} />
            </div>
            <Link href={`/products/${params.slug}/verdict`} className="mt-3 block">
              <Button variant="secondary">Edit my verdict</Button>
            </Link>
          </div>
        ) : (
          <Link href={`/products/${params.slug}/verdict`} className="block">
            <Button>Share your verdict</Button>
          </Link>
        )}
      </section>

      {/* All verdicts */}
      {verdicts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-neutral-900">All verdicts</h2>
          <div className="mt-4 space-y-4">
            {verdicts.map((v) => (
              <div key={v.id}>
                <VerdictCard verdict={v} />
                <div className="mt-2 pl-1">
                  <HelpfulButton
                    verdictId={v.id}
                    initialCount={v.helpful_count ?? 0}
                    initialVoted={votedOn.has(v.id)}
                    isOwn={v.user_id === user?.id}
                    signedIn={Boolean(user)}
                    path={`/products/${params.slug}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-between" aria-label="Verdict pages">
              {page > 1 ? (
                <Link
                  href={`/products/${params.slug}?page=${page - 1}`}
                  className="text-sm font-semibold text-worth underline"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/products/${params.slug}?page=${page + 1}`}
                  className="text-sm font-semibold text-worth underline"
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
      )}

      <div className="h-12" />
    </Screen>
  )
}
