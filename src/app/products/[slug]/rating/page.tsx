import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Screen } from '@/components/ui'
import { getProductBySlug } from '../queries'
import { RatingForm } from './rating-form'

export const metadata = { title: 'Share your rating | RateMama' }
export const dynamic = 'force-dynamic'

const EARLY_COMMUNITY_THRESHOLD = 5

export default async function RatingPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/products/${params.slug}/rating`)

  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const { data: existing } = await supabase
    .from('ratings')
    .select('rating, price_paid, supermarket, reason, alternative_product, photo_url')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .maybeSingle()

  const totalRatings = product.total_ratings ?? 0

  return (
    <Screen>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        {existing ? 'Edit your rating' : 'Share your rating'}
      </h1>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-3">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-xl bg-neutral-50 object-contain"
          />
        )}
        <div className="min-w-0">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {product.brand}
            </p>
          )}
          <p className="text-sm font-semibold leading-snug text-neutral-900">{product.name}</p>
        </div>
      </div>

      {totalRatings < EARLY_COMMUNITY_THRESHOLD && (
        <p className="mt-4 rounded-2xl bg-worth-soft px-4 py-3 text-sm leading-relaxed text-[#2f7a55]">
          You are one of the first people to review this. Your rating will be seen by everyone who
          looks at this product after you.
        </p>
      )}

      <div className="mt-6">
        <RatingForm
          productId={product.id}
          slug={params.slug}
          existing={existing ?? null}
        />
      </div>
      <div className="h-12" />
    </Screen>
  )
}
