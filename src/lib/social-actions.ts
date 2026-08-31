'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Shared social actions used by product pages, profiles and the friends
 * feed. Counts on ratings and products are maintained by database
 * triggers, so nothing here touches them.
 */

export async function toggleHelpful(ratingId: string, path?: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const { data: target } = await supabase
    .from('ratings')
    .select('user_id')
    .eq('id', ratingId)
    .maybeSingle()

  if (!target) return { error: 'That rating is no longer here.' }
  if (target.user_id === user.id) return { error: 'You cannot vote on your own rating.' }

  const { data: existing } = await supabase
    .from('rating_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('rating_id', ratingId)
    .maybeSingle()

  if (existing) {
    await supabase.from('rating_votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('rating_votes').insert({ user_id: user.id, rating_id: ratingId })
  }

  if (path) revalidatePath(path)
  return { ok: true, voted: !existing }
}

export async function toggleFollow(targetUserId: string, path?: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }
  if (user.id === targetUserId) return { error: 'You cannot follow yourself.' }

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error) return { error: 'We could not follow just then. Please try again.' }
  }

  if (path) revalidatePath(path)
  return { ok: true, following: !existing }
}

export async function toggleSave(productId: string, path?: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  const { data: existing } = await supabase
    .from('saved_products')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await supabase.from('saved_products').delete().eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('saved_products')
      .insert({ user_id: user.id, product_id: productId })
    if (error) return { error: 'We could not save that just then.' }
  }

  if (path) revalidatePath(path)
  return { ok: true, saved: !existing }
}

export async function markNotificationRead(id: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/notifications')
  return { ok: true }
}

export async function markAllNotificationsRead() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  revalidatePath('/notifications')
  return { ok: true }
}
