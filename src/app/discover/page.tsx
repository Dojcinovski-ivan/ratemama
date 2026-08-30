import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Screen } from '@/components/ui'

export const revalidate = 60
export const metadata = {
  title: 'Discover products | RateMama',
  description: 'Browse products and see what real families think before you buy.',
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const query = (searchParams.q ?? '').trim()

  let request = supabase
    .from('products')
    .select('id, slug, name, brand, image_url, total_verdicts, worth_it_percentage')
    .not('image_url', 'is', null)
    .order('total_verdicts', { ascending: false })
    .limit(60)

  if (query) request = request.ilike('name', `%${query}%`)

  const { data: products } = await request

  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Discover</h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        Browse products and see what families actually think.
      </p>

      <form className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products"
          className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline focus:outline-2 focus:outline-worth"
        />
      </form>

      {!products || products.length === 0 ? (
        <p className="mt-8 text-base leading-relaxed text-neutral-600">
          {query ? 'Nothing matched that. Try another word.' : 'No products yet.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300"
              >
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl bg-neutral-50 object-contain"
                    unoptimized
                  />
                )}
                <span className="min-w-0 flex-1">
                  {product.brand && (
                    <span className="block text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {product.brand}
                    </span>
                  )}
                  <span className="block text-sm font-semibold leading-snug text-neutral-900">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {product.total_verdicts > 0
                      ? `${product.worth_it_percentage} percent worth it, ${product.total_verdicts} ${
                          product.total_verdicts === 1 ? 'verdict' : 'verdicts'
                        }`
                      : 'No verdicts yet'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="h-12" />
    </Screen>
  )
}
