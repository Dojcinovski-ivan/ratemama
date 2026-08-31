import Link from 'next/link'
import type { Metadata } from 'next'
import { Screen } from '@/components/ui'
import { searchProducts } from './actions'
import { DiscoverClient } from './discover-client'
import { Scanner } from './scanner'

export const metadata: Metadata = {
  title: 'Discover products | RateMama',
  description:
    'Browse products and see what real families think before you buy. Honest ratings on what is worth the money.',
}

export const revalidate = 60

export default async function DiscoverPage() {
  const initial = await searchProducts('', [], 'reviewed')

  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Discover</h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        Browse products and see what families actually think.
      </p>

      <div className="mt-5 space-y-3">
        <Scanner />
        <Link href="/products/add" className="block text-sm font-medium text-worth underline">
          Cannot find something? Add a product
        </Link>
      </div>

      <DiscoverClient initial={initial} />
      <div className="h-12" />
    </Screen>
  )
}
