'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { submitVerdict, type VerdictState } from './actions'
import { MAX_REASON } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { Button, FormError, Input, Select, cn } from '@/components/ui'

const SHOPS = [
  { value: 'tesco', label: 'Tesco' },
  { value: 'sainsburys', label: 'Sainsburys' },
  { value: 'asda', label: 'Asda' },
  { value: 'lidl', label: 'Lidl' },
  { value: 'aldi', label: 'Aldi' },
  { value: 'waitrose', label: 'Waitrose' },
  { value: 'ocado', label: 'Ocado' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'other', label: 'Other' },
]

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Posting your verdict' : 'Post my verdict'}
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
    photo_url: string | null
  } | null
}) {
  const [choice, setChoice] = useState(existing?.verdict ?? '')
  const [reason, setReason] = useState(existing?.reason ?? '')
  const [photoUrl, setPhotoUrl] = useState(existing?.photo_url ?? '')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [state, formAction] = useFormState<VerdictState, FormData>(submitVerdict, {})

  const remaining = MAX_REASON - reason.length

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('That image is over 5 MB. Please pick a smaller one.')
      return
    }

    setPhotoBusy(true)
    setPhotoError('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setPhotoError('Your session has expired. Please log in again.')
      setPhotoBusy(false)
      return
    }

    const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, '')}`
    const { error } = await supabase.storage.from('verdict-photos').upload(path, file)
    if (error) {
      setPhotoError('We could not upload that just now. Your verdict works fine without it.')
      setPhotoBusy(false)
      return
    }
    const { data } = supabase.storage.from('verdict-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setPhotoBusy(false)
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-worth-soft px-5 py-6">
        <h2 className="text-xl font-bold text-[#2f7a55]">Your verdict is live.</h2>
        <p className="mt-2 text-base leading-relaxed text-neutral-700">
          You are helping real families make better decisions.
        </p>
        <div className="mt-6 space-y-3">
          <Link href={`/products/${slug}`} className="block">
            <Button>See all verdicts</Button>
          </Link>
          <Link href="/discover" className="block">
            <Button variant="secondary">Rate another product</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="verdict" value={choice} />
      <input type="hidden" name="photo_url" value={photoUrl} />

      <div>
        <p className="text-sm font-medium text-neutral-800">Your verdict</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChoice('worth_it')}
            aria-pressed={choice === 'worth_it'}
            className={cn(
              'rounded-2xl border-2 px-4 py-5 text-base font-bold transition-colors',
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
              'rounded-2xl border-2 px-4 py-5 text-base font-bold transition-colors',
              choice === 'not_worth_it'
                ? 'border-notworth bg-notworth text-notworth-fg'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-notworth'
            )}
          >
            Not Worth It
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="price_paid" className="block text-sm font-medium text-neutral-800">
          Price paid
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-neutral-500">
            £
          </span>
          <input
            id="price_paid"
            name="price_paid"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
            defaultValue={existing?.price_paid ?? ''}
            className="block w-full rounded-xl border border-neutral-300 bg-white py-3 pl-9 pr-4 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-worth"
          />
        </div>
      </div>

      <Select
        label="Where did you buy it"
        name="supermarket"
        required
        defaultValue={existing?.supermarket ?? ''}
      >
        <option value="" disabled>
          Choose a shop
        </option>
        {SHOPS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="reason" className="block text-sm font-medium text-neutral-800">
            Why in one sentence
          </label>
          <span
            className={cn(
              'text-xs tabular-nums',
              remaining < 0 ? 'text-notworth' : 'text-neutral-400'
            )}
          >
            {remaining}
          </span>
        </div>
        <textarea
          id="reason"
          name="reason"
          required
          rows={3}
          maxLength={MAX_REASON}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Be honest. One sentence is enough."
          className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline focus:outline-2 focus:outline-worth"
        />
      </div>

      {choice === 'not_worth_it' && (
        <Input
          label="Best alternative"
          name="alternative_product"
          defaultValue={existing?.alternative_product ?? ''}
          hint="Optional. What do you buy instead?"
        />
      )}

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-800">
          Photo of the product <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          disabled={photoBusy}
          className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-worth-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#2f7a55]"
        />
        {photoBusy && <p className="mt-1.5 text-sm text-neutral-500">Uploading your photo</p>}
        {photoUrl && !photoBusy && <p className="mt-1.5 text-sm text-[#2f7a55]">Photo added</p>}
        {photoError && <p className="mt-1.5 text-sm text-notworth">{photoError}</p>}
      </div>

      <FormError>{state.error}</FormError>

      <SubmitButton disabled={!choice || remaining < 0} />
    </form>
  )
}
