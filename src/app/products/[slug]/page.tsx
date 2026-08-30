import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { VerdictCard, type VerdictWithContext } from '@/components/verdict-card'
import { VerdictForm } from './verdict-form'
import { Screen } from '@/components/ui'
import { formatPrice } from '@/lib/format'

export const revalidate = 60

const PRODUCT_FIELDS =
  'id, slug, name, brand, image_url, average_price_gbp, worth_it_count, not_worth_it_count, total_verdicts, worth_it_percentage'

async function getProduct(slug: string) {
  const supabase = createClient()
  const { data } = await supabase.from('products').select(PRODUCT_FIELDS).eq('slug', slug).maybeSingle()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product not found | RateMama' }

  const name = [product.brand, product.name].filter(Boolean).join(' ')
  const verdictLine =
    product.total_verdicts > 0
      ? `${product.worth_it_percentage} percent of families say it is worth it.`
      : 'Be the first to leave a verdict.'

  return {
    title: `${name} | RateMama`,
    description: `Is ${name} worth buying? ${verdictLine}`,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: verdicts } = await supabase
    .from('verdicts')
    .select(
      'id, verdict, price_paid, currency, supermarket, reason, alternative_product, helpful_count, created_at, user_id, users(first_name, city, profile_photo_url, is_founding_member)'
    )
    .eq('product_id', product.id)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const all = (verdicts ?? []) as unknown as (VerdictWithContext & { user_id: string })[]
  const mine = user ? all.find((v) => v.user_id === user.id) ?? null : null
  const others = all.filter((v) => v.id !== mine?.id)

  const worthPercent = Number(product.worth_it_percentage ?? 0)
  const averagePrice = formatPrice(product.average_price_gbp)

  return (
    <Screen>
      <Link href="/discover" className="mb-6 text-sm font-medium text-neutral-500">
        Back to products
      </Link>

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
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {product.brand}
            </p>
          )}
          <h1 className="mt-0.5 text-xl font-bold leading-snug text-neutral-900">{product.name}</h1>
          {averagePrice && (
            <p className="mt-1 text-sm text-neutral-500">Around {averagePrice}</p>
          )}
        </div>
      </div>

      {product.total_verdicts > 0 ? (
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-neutral-900">
              {worthPercent}
              <span className="text-lg font-semibold text-neutral-500"> percent worth it</span>
            </p>
            <p className="text-sm text-neutral-500">
              {product.total_verdicts} {product.total_verdicts === 1 ? 'verdict' : 'verdicts'}
            </p>
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-neutral-200">
            <div className="bg-worth" style={{ width: `${worthPercent}%` }} />
            <div className="bg-notworth" style={{ width: `${100 - worthPercent}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
            <span>{product.worth_it_count} Worth It</span>
            <span>{product.not_worth_it_count} Not Worth It</span>
          </div>
        </section>
      ) : (
        <p className="mt-6 rounded-2xl bg-neutral-100 px-4 py-4 text-sm leading-relaxed text-neutral-600">
          Nobody has rated this yet. Be the first and help other families decide.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-neutral-900">
          {mine ? 'Your verdict' : 'Leave your verdict'}
        </h2>
        {user ? (
          <div className="mt-4">
            <VerdictForm productId={product.id} slug={product.slug ?? params.slug} existing={mine} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-5 py-6">
            <p className="text-base leading-relaxed text-neutral-700">
              Join RateMama to share what you thought of this.
            </p>
            <Link
              href={`/login?next=/products/${params.slug}`}
              className="mt-3 inline-block font-semibold text-worth underline"
            >
              Log in or create an account
            </Link>
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-neutral-900">
            What other families say
          </h2>
          <div className="mt-4 space-y-4">
            {others.map((verdict) => (
              <VerdictCard key={verdict.id} verdict={verdict} />
            ))}
          </div>
        </section>
      )}

      <div className="h-12" />
    </Screen>
  )
}
