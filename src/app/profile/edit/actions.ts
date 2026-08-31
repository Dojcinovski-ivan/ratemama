'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidCountry } from '@/lib/countries'

export type EditState = { error?: string; ok?: boolean }

export async function updateProfile(_prev: EditState, formData: FormData): Promise<EditState> {
  const firstName = String(formData.get('first_name') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const privacy = String(formData.get('privacy_setting') ?? 'public')
  const photoUrl = String(formData.get('profile_photo_url') ?? '').trim()

  if (!firstName) return { error: 'Please keep a first name so people know who you are.' }
  if (!city) return { error: 'Please add your city.' }
  if (!isValidCountry(country)) return { error: 'Please choose a country from the list.' }
  if (bio.length > 200) return { error: 'Please keep your bio under 200 characters.' }
  if (!['public', 'friends'].includes(privacy)) return { error: 'Please choose a privacy setting.' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const update: Record<string, unknown> = {
    first_name: firstName,
    city,
    country,
    bio: bio || null,
    privacy_setting: privacy,
  }
  if (photoUrl) update.profile_photo_url = photoUrl

  const { error } = await supabase.from('users').update(update).eq('id', user.id)

  if (error) {
    console.error('[profile] update failed', error)
    return { error: 'We could not save that just then. Please try again.' }
  }

  const { data } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  if (data?.username) revalidatePath(`/profile/${data.username}`)
  revalidatePath('/profile/edit')

  return { ok: true }
}
