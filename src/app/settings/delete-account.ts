'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type DeleteState = { error?: string }

const CONFIRM_WORD = 'DELETE'

/** Removes every file a user uploaded to one bucket. */
async function emptyUserFolder(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  userId: string
) {
  const { data, error } = await admin.storage.from(bucket).list(userId, { limit: 1000 })
  if (error || !data || data.length === 0) return
  const paths = data.map((f) => `${userId}/${f.name}`)
  const { error: removeError } = await admin.storage.from(bucket).remove(paths)
  if (removeError) console.error(`[delete account] ${bucket} cleanup failed`, removeError)
}

/**
 * Deletes the signed in account and everything attached to it.
 *
 * Rows in users, ratings, votes, swipes, saved products and notifications
 * all cascade from auth.users, but uploaded files do not, so those are
 * removed first. Without that step the photos would outlive the account,
 * which would make the erasure incomplete.
 */
export async function deleteAccount(_prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const typed = String(formData.get('confirm') ?? '').trim().toUpperCase()
  if (typed !== CONFIRM_WORD) {
    return { error: `Please type ${CONFIRM_WORD} to confirm.` }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  await emptyUserFolder(admin, 'profile-photos', user.id)
  await emptyUserFolder(admin, 'rating-photos', user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[delete account] failed', error)
    return { error: 'We could not delete the account just then. Please try again, or email hello@ratemama.com.' }
  }

  await supabase.auth.signOut()
  redirect('/goodbye')
}
