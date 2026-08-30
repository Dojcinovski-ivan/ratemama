'use client'

import { useEffect, useState, useTransition } from 'react'
import { ProductCard, type ProductSummary } from '@/components/product-card'
import { CATEGORY_FILTERS } from '@/lib/categories'
import { cn } from '@/components/ui'
import { searchProducts, type SortKey } from './actions'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'reviewed', label: 'Most reviewed' },
  { value: 'worth', label: 'Highest Worth It' },
  { value: 'controversial', label: 'Most controversial' },
  { value: 'newest', label: 'Newest' },
]

export function DiscoverClient({ initial }: { initial: ProductSummary[] }) {
  const [term, setTerm] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('reviewed')
  const [items, setItems] = useState(initial)
  const [pending, startTransition] = useTransition()
  const [touched, setTouched] = useState(false)

  // Debounced by 300ms so typing does not fire a query per keystroke.
  useEffect(() => {
    if (!touched) return
    const timer = setTimeout(() => {
      startTransition(async () => {
        setItems(await searchProducts(term, categories, sort))
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [term, categories, sort, touched])

  function toggleCategory(value: string) {
    setTouched(true)
    setCategories((current) =>
      current.includes(value) ? current.filter((c) => c !== value) : [...current, value]
    )
  }

  return (
    <>
      <input
        type="search"
        value={term}
        onChange={(e) => {
          setTouched(true)
          setTerm(e.target.value)
        }}
        placeholder="Search by product or brand"
        aria-label="Search products"
        className="mt-6 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline focus:outline-2 focus:outline-worth"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTouched(true)
            setCategories([])
          }}
          aria-pressed={categories.length === 0}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            categories.length === 0
              ? 'border-worth bg-worth text-worth-fg'
              : 'border-neutral-300 text-neutral-600'
          )}
        >
          All
        </button>
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => toggleCategory(c.value)}
            aria-pressed={categories.includes(c.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              categories.includes(c.value)
                ? 'border-worth bg-worth text-worth-fg'
                : 'border-neutral-300 text-neutral-600'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              setTouched(true)
              setSort(s.value)
            }}
            aria-pressed={sort === s.value}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              sort === s.value ? 'bg-neutral-900 text-white' : 'text-neutral-500'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {pending && <p className="mt-4 text-sm text-neutral-500">Searching</p>}

      {items.length === 0 && !pending ? (
        <p className="mt-8 text-base leading-relaxed text-neutral-600">
          Nothing matched that. Try another word or clear the filters.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}
