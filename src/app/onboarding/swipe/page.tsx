'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { readDraft, writeDraft, type SwipeAnswer } from '@/lib/onboarding-storage'
import { Button } from '@/components/ui'
import { StepShell } from '../step-shell'
import { formatPrice } from '@/lib/format'

type Product = {
  id: string
  name: string
  brand: string | null
  image_url: string
  average_price_gbp: number | null
}

export default function SwipeStep() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<SwipeAnswer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const draft = readDraft()
    if (!draft.supermarkets || draft.supermarkets.length === 0) {
      router.replace('/onboarding/supermarkets')
      return
    }
    if (draft.swipes) setAnswers(draft.swipes)

    const params = new URLSearchParams({ categories: (draft.categories ?? []).join(',') })
    fetch(`/api/onboarding/products?${params}`)
      .then((r) => r.json())
      .then((j) => setProducts(j.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [router])

  function respond(response: string) {
    const product = products[index]
    if (!product) return
    const next = [...answers.filter((a) => a.productId !== product.id), { productId: product.id, response }]
    setAnswers(next)
    writeDraft({ swipes: next })
    setIndex((i) => i + 1)
  }

  function finish() {
    writeDraft({ swipes: answers })
    router.push('/onboarding/account')
  }

  const product = products[index]
  const done = !loading && (products.length === 0 || index >= products.length)

  return (
    <StepShell
      step={4}
      heading={done ? 'Your feed is ready.' : 'Quick question. Have you tried these?'}
      subheading={
        done
          ? 'Create your free account to see it.'
          : 'Swipe or tap to tell us what you think. You can stop after 5.'
      }
      back="/onboarding/supermarkets"
      action={
        done ? (
          <Button onClick={finish}>Create my free account</Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => respond('worth_it')} disabled={!product}>
                Worth It
              </Button>
              <Button
                onClick={() => respond('not_worth_it')}
                disabled={!product}
                className="bg-notworth hover:bg-notworth-deep"
              >
                Not Worth It
              </Button>
            </div>
            <Button variant="secondary" onClick={() => respond('never_tried')} disabled={!product}>
              Never tried
            </Button>
            {index >= 5 && (
              <button
                type="button"
                onClick={finish}
                className="block w-full py-1 text-sm font-medium text-ink-soft"
              >
                You can stop here
              </button>
            )}
          </div>
        )
      }
    >
      {loading && <p className="text-base text-ink-soft">Getting your products ready</p>}

      {!loading && product && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">
            {index + 1} of {products.length}
          </p>
          <div className="overflow-hidden rounded-card border border-cream-300 bg-white">
            <div className="relative aspect-square w-full bg-cream-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 480px) 100vw, 448px"
                className="object-contain p-6"
                unoptimized
              />
            </div>
            <div className="border-t border-cream-200 px-5 py-4">
              {product.brand && (
                <p className="text-sm font-medium uppercase tracking-wide text-ink-soft">
                  {product.brand}
                </p>
              )}
              <p className="mt-0.5 text-lg font-semibold leading-snug text-ink">{product.name}</p>
              {product.average_price_gbp != null && (
                <p className="mt-1 text-sm text-ink-soft">
                  About {formatPrice(product.average_price_gbp)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {done && (
        <p className="rounded-card bg-worth-soft px-4 py-5 text-base leading-relaxed text-worth-deep">
          {answers.length > 0
            ? `Thank you. Those ${answers.length} answers already make your feed better.`
            : 'We will fill your feed as soon as your account exists.'}
        </p>
      )}
    </StepShell>
  )
}
