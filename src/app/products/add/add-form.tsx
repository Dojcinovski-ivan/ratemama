'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { addProduct, type AddState } from './actions'
import { CATEGORY_FILTERS } from '@/lib/categories'
import { createClient } from '@/lib/supabase/client'
import { Button, FormError, Input, Select } from '@/components/ui'

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

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding the product' : 'Add this product'}
    </Button>
  )
}

export function AddProductForm({ barcode }: { barcode: string }) {
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [state, formAction] = useFormState<AddState, FormData>(async (prev, data) => {
    const result = await addProduct(prev, data)
    if (result.slug) router.push(`/products/${result.slug}/rating?added=1`)
    return result
  }, {})

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
    const { error } = await supabase.storage.from('rating-photos').upload(path, file)
    if (error) {
      setPhotoError('We could not upload that just now. You can add it without a photo.')
      setPhotoBusy(false)
      return
    }
    const { data } = supabase.storage.from('rating-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setPhotoBusy(false)
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="photo_url" value={photoUrl} />

      <FormError>{state.error}</FormError>

      <Input label="Product name" name="name" required />
      <Input label="Brand" name="brand" required />

      <Select label="Category" name="category" required defaultValue="">
        <option value="" disabled>
          Choose a category
        </option>
        {CATEGORY_FILTERS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      <Input
        label="Barcode"
        name="barcode"
        inputMode="numeric"
        defaultValue={barcode}
        hint="Optional. Helps other people find it by scanning."
      />

      <Select label="Where did you find it" name="supermarket" required defaultValue="">
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
        <label htmlFor="price" className="block text-sm font-medium text-neutral-800">
          Approximate price
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-neutral-500">
            £
          </span>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
            className="block w-full rounded-xl border border-neutral-300 bg-white py-3 pl-9 pr-4 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-worth"
          />
        </div>
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-800">
          Product photo <span className="font-normal text-neutral-500">(optional)</span>
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

      <SubmitButton />
    </form>
  )
}
