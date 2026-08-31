'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { updateProfile, type EditState } from './actions'
import { PINNED_COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries'
import { createClient } from '@/lib/supabase/client'
import { Button, FormError, Input, Select, cn } from '@/components/ui'

const MAX_BIO = 200

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving' : 'Save changes'}
    </Button>
  )
}

export function EditProfileForm({
  profile,
}: {
  profile: {
    username: string | null
    first_name: string | null
    city: string | null
    country: string | null
    bio: string | null
    profile_photo_url: string | null
    privacy_setting: string | null
  }
}) {
  const [bio, setBio] = useState(profile.bio ?? '')
  const [privacy, setPrivacy] = useState(profile.privacy_setting ?? 'public')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [state, formAction] = useFormState<EditState, FormData>(updateProfile, {})

  const remaining = MAX_BIO - bio.length

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
    const { error } = await supabase.storage.from('profile-photos').upload(path, file)
    if (error) {
      setPhotoError('We could not upload that just now. Please try again.')
      setPhotoBusy(false)
      return
    }
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setPhotoBusy(false)
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="profile_photo_url" value={photoUrl} />
      <input type="hidden" name="privacy_setting" value={privacy} />

      {state.ok && (
        <div className="rounded-xl bg-worth-soft px-4 py-3 text-sm font-medium text-[#2f7a55]">
          Saved. Your profile is up to date.
        </div>
      )}
      <FormError>{state.error}</FormError>

      <Input label="First name" name="first_name" required defaultValue={profile.first_name ?? ''} />
      <Input label="City" name="city" required defaultValue={profile.city ?? ''} />

      <Select label="Country" name="country" required defaultValue={profile.country ?? ''}>
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

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="bio" className="block text-sm font-medium text-neutral-800">
            Bio
          </label>
          <span className={cn('text-xs tabular-nums', remaining < 0 ? 'text-notworth' : 'text-neutral-400')}>
            {remaining}
          </span>
        </div>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={MAX_BIO}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A line about you and what you shop for."
          className="mt-1.5 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline focus:outline-2 focus:outline-worth"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-800">
          Profile photo
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
        {photoUrl && !photoBusy && <p className="mt-1.5 text-sm text-[#2f7a55]">New photo ready to save</p>}
        {photoError && <p className="mt-1.5 text-sm text-notworth">{photoError}</p>}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-neutral-800">Who can see your verdicts</legend>
        <div className="mt-2 space-y-3">
          {[
            {
              value: 'public',
              title: 'Public profile',
              body: 'Anyone can read your verdicts, including people who are not logged in. This helps other families find them.',
            },
            {
              value: 'friends',
              title: 'Friends only',
              body: 'Your name and city stay visible so people can find you, but only people you follow who also follow you back can read your verdicts.',
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPrivacy(option.value)}
              aria-pressed={privacy === option.value}
              className={cn(
                'block w-full rounded-2xl border-2 p-4 text-left transition-colors',
                privacy === option.value
                  ? 'border-worth bg-worth-soft'
                  : 'border-neutral-200 bg-white'
              )}
            >
              <span className="block text-sm font-semibold text-neutral-900">{option.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-neutral-600">
                {option.body}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <SubmitButton />

      {profile.username && (
        <Link href={`/profile/${profile.username}`} className="block">
          <Button variant="ghost">Back to my profile</Button>
        </Link>
      )}
    </form>
  )
}
