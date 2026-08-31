'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerAction, type RegisterState } from './actions'
import { PINNED_COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries'
import { createClient } from '@/lib/supabase/client'
import {
  Button,
  Checkbox,
  FormError,
  Input,
  Screen,
  Select,
} from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating your account' : 'Create my account'}
    </Button>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [state, formAction] = useFormState<RegisterState, FormData>(
    async (prev, formData) => {
      const result = await registerAction(prev, formData)
      if (!result.error && !result.fieldErrors) {
        router.push('/register/check-email')
      }
      return result
    },
    {}
  )

  const errors = state.fieldErrors ?? {}

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
    // Photos upload before the account exists, so they go into a shared
    // pending folder and get claimed once the profile row is created.
    const path = `pending/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, '')}`
    const { error } = await supabase.storage.from('profile-photos').upload(path, file)

    if (error) {
      setPhotoError('We could not upload that just now. You can always add a photo later.')
      setPhotoBusy(false)
      return
    }

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setPhotoName(file.name)
    setPhotoBusy(false)
  }

  return (
    <Screen>
      <header className="mb-8">
        <p className="text-lg font-bold text-worth">RateMama</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
          Create your account
        </h1>
        <p className="mt-2 text-base leading-relaxed text-neutral-600">
          Join the families helping each other work out what is actually worth buying.
        </p>
      </header>

      <form action={formAction} className="space-y-5">
        <FormError>{state.error}</FormError>

        <Input
          label="First name"
          name="first_name"
          autoComplete="given-name"
          required
          error={errors.first_name}
        />

        <Input
          label="Surname"
          name="surname"
          autoComplete="family-name"
          required
          hint="Kept private. We never show your surname to anyone."
          error={errors.surname}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          error={errors.email}
        />

        <Input label="City" name="city" autoComplete="address-level2" required error={errors.city} />

        <Select label="Country" name="country" required defaultValue="" error={errors.country}>
          <option value="" disabled>
            Choose your country
          </option>
          <optgroup label="Most common">
            {PINNED_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {OTHER_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </Select>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          error={errors.password}
        />

        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-neutral-800">
            Profile photo <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            disabled={photoBusy}
            className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-worth-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#2f7a55]"
          />
          <input type="hidden" name="profile_photo_url" value={photoUrl} />
          <p className="mt-1.5 text-sm text-neutral-500">
            Profiles with a photo get more helpful votes. You can add one now or later.
          </p>
          {photoBusy && <p className="mt-1.5 text-sm text-neutral-500">Uploading your photo</p>}
          {photoName && !photoBusy && (
            <p className="mt-1.5 text-sm text-[#2f7a55]">Added {photoName}</p>
          )}
          {photoError && <p className="mt-1.5 text-sm text-notworth">{photoError}</p>}
        </div>

        <div className="space-y-4 border-t border-neutral-200 pt-5">
          <Checkbox
            name="email_marketing_consent"
            label="Send me weekly product ratings and updates by email (optional)"
          />
          <Checkbox
            name="terms"
            required
            error={errors.terms}
            label={
              <>
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-worth underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-worth underline">
                  Privacy Policy
                </Link>
              </>
            }
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-worth underline">
          Log in
        </Link>
      </p>
    </Screen>
  )
}
