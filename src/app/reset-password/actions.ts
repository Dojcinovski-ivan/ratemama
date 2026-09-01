'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ResetState = { error?: string }

export async function setNewPassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 8) {
    return { error: 'Please choose a password of at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Those two passwords do not match.' }
  }

  const supabase = createClient()
  // The recovery link already signed them in, so this updates the
  // account they arrived as. Without that session there is nothing to
  // update, which is what sends them back to ask for a fresh link.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'That link has expired. Please ask for a new one.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: 'We could not save that password. Please try again.' }
  }

  redirect('/feed')
}
