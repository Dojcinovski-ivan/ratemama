'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitVerdict, type VerdictState } from './actions'
import { SUPERMARKETS } from '@/lib/onboarding-options'
import { Button, FormError, Input, Select, cn } from '@/components/ui'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Saving your verdict' : 'Post my verdict'}
    </Button>
  )
}

export function VerdictForm({
  productId,
  slug,
  existing,
}: {
  productId: string
  slug: string
  existing: {
    verdict: string
    price_paid: number | null
    supermarket: string
    reason: string
    alternative_product: string | null
  } | null
}) {
  const [choice, setChoice] = useState(existing?.verdict ?? '')
  const [state, formAction] = useFormState<VerdictState, FormData>(submitVerdict, {})

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-worth-soft px-5 py-6">
        <p className="text-lg font-semibold text-[#2f7a55]">Thank you. Your verdict is live.</p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          Other families can see it now. You can change it any time.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="verdict" value={choice} />

      <div>
        <p className="text-sm font-medium text-neutral-800">What is your verdict?</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChoice('worth_it')}
            aria-pressed={choice === 'worth_it'}
            className={cn(
              'rounded-2xl border-2 px-4 py-3.5 text-base font-semibold transition-colors',
              choice === 'worth_it'
                ? 'border-worth bg-worth text-worth-fg'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-worth'
            )}
          >
            Worth It
          </button>
          <button
            type="button"
            onClick={() => setChoice('not_worth_it')}
            aria-pressed={choice === 'not_worth_it'}
            className={cn(
              'rounded-2xl border-2 px-4 py-3.5 text-base font-semibold transition-colors',
              choice === 'not_worth_it'
                ? 'border-notworth bg-notworth text-notworth-fg'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-notworth'
            )}
          >
            Not Worth It
          </button>
        </div>
      </div>

      <Input
        label="What did you pay?"
        name="price_paid"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        required
        defaultValue={existing?.price_paid ?? ''}
        hint="In pounds. Roughly is fine."
      />

      <Select
        label="Where did you buy it?"
        name="supermarket"
        required
        defaultValue={existing?.supermarket ?? ''}
      >
        <option value="" disabled>
          Choose a shop
        </option>
        {SUPERMARKETS.filter((s) => s.value !== 'mix').map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
        <option value="other">Somewhere else</option>
      </Select>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-neutral-800">
          Why?
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          rows={4}
          maxLength={1000}
          defaultValue={existing?.reason ?? ''}
          placeholder="What made it worth it, or not? Other families find the honest detail most useful."
          className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline focus:outline-2 focus:outline-worth"
        />
      </div>

      <Input
        label="Better alternative"
        name="alternative_product"
        defaultValue={existing?.alternative_product ?? ''}
        hint="Optional. What do you buy instead?"
      />

      <FormError>{state.error}</FormError>

      <SubmitButton disabled={!choice} />
    </form>
  )
}
