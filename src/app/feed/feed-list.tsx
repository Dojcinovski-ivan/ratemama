'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ProductCard, type ProductSummary } from '@/components/product-card'
import { Button } from '@/components/ui'
import { loadRecommendations } from './actions'
import { FEED_PAGE_SIZE as PAGE_SIZE } from '@/lib/constants'

export function FeedList({ initial }: { initial: ProductSummary[] }) {
  const [items, setItems] = useState(initial)
  const [done, setDone] = useState(initial.length < PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    const next = await loadRecommendations(items.length)
    setItems((current) => {
      const have = new Set(current.map((p) => p.id))
      return [...current, ...next.filter((p) => !have.has(p.id))]
    })
    if (next.length < PAGE_SIZE) setDone(true)
    setLoading(false)
  }, [items.length, loading, done])

  useEffect(() => {
    const node = sentinel.current
    if (!node || done) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, done])

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white px-5 py-8">
        <h2 className="text-lg font-bold text-neutral-900">Nothing to show yet.</h2>
        <p className="mt-2 text-base leading-relaxed text-neutral-600">
          Keep swiping and reviewing to improve your recommendations.
        </p>
        <div className="mt-6">
          <Link href="/discover" className="block">
            <Button>Rate more products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={sentinel} className="h-10" aria-hidden />

      {loading && <p className="py-3 text-center text-sm text-neutral-500">Loading more</p>}
      {done && items.length > 0 && (
        <p className="py-3 text-center text-sm text-neutral-500">That is everything for now.</p>
      )}
    </>
  )
}
