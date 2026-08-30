'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Note } from '@/components/ui'
import type { DeckProduct } from './actions'

const MIN_BEFORE_STOPPING = 5

export function SwipeDeck({
  products,
  onSwipe,
  onFinish,
  finishing,
}: {
  products: DeckProduct[]
  onSwipe: (productId: string, response: string) => Promise<{ error?: string }>
  onFinish: () => void
  finishing: boolean
}) {
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)

  const product = products[index]
  const answered = index
  const canStop = answered >= MIN_BEFORE_STOPPING

  // Nothing came back from the catalogue. Do not strand anyone here.
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
          We are still stocking the shelves.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          There is nothing to rate just yet. You can head to your feed and start exploring instead.
        </p>
        <div className="mt-8">
          <Button onClick={onFinish} disabled={finishing}>
            {finishing ? 'One moment' : 'Take me to my feed'}
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
          That is all of them.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          Thank you. That already makes your feed better.
        </p>
        <div className="mt-8">
          <Button onClick={onFinish} disabled={finishing}>
            {finishing ? 'One moment' : 'Continue'}
          </Button>
        </div>
      </div>
    )
  }

  async function respond(response: string) {
    if (saving || !product) return
    setSaving(true)
    await onSwipe(product.id, response)
    setSaving(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-neutral-900">
        Quick question. Have you tried these?
      </h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        Swipe or tap to tell us what you think. You can stop after 5.
      </p>

      <p className="mt-6 text-sm font-medium text-neutral-500">
        {index + 1} of {products.length}
      </p>

      <div className="mt-3 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="relative aspect-square w-full bg-neutral-50">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-contain p-6"
            unoptimized
          />
        </div>
        <div className="border-t border-neutral-100 px-5 py-4">
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {product.brand}
            </p>
          )}
          <p className="mt-0.5 text-lg font-semibold leading-snug text-neutral-900">
            {product.name}
          </p>

          {/* Price and verdict count only appear once they hold real data. */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
            {product.average_price_gbp != null && (
              <span>About {formatPrice(product.average_price_gbp)}</span>
            )}
            {product.total_verdicts > 0 && (
              <span>
                {product.total_verdicts} {product.total_verdicts === 1 ? 'verdict' : 'verdicts'} so
                far
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          onClick={() => respond('worth_it')}
          disabled={saving}
          className="bg-worth text-worth-fg"
        >
          Worth It
        </Button>
        <Button
          onClick={() => respond('not_worth_it')}
          disabled={saving}
          className="bg-notworth text-notworth-fg hover:bg-[#cc5151] active:bg-[#b84a4a]"
        >
          Not Worth It
        </Button>
      </div>

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={() => respond('never_tried')}
          disabled={saving}
          className="text-neutral-600"
        >
          Never tried
        </Button>
      </div>

      {canStop && (
        <div className="mt-6 space-y-3">
          <Note>You have done enough to get started.</Note>
          <Button variant="ghost" onClick={onFinish} disabled={finishing}>
            {finishing ? 'One moment' : 'You can stop here'}
          </Button>
        </div>
      )}
    </div>
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}
