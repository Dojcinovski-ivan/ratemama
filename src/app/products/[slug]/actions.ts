'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleHelpful(verdictId: string, slug: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in first.' }

  // Nobody votes for their own verdict.
  const { data: target } = await supabase
    .from('verdicts')
    .select('user_id')
    .eq('id', verdictId)
    .maybeSingle()

  if (!target) return { error: 'That verdict is no longer here.' }
  if (target.user_id === user.id) return { error: 'You cannot vote on your own verdict.' }

  const { data: existing } = await supabase
    .from('verdict_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('verdict_id', verdictId)
    .maybeSingle()

  if (existing) {
    await supabase.from('verdict_votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('verdict_votes').insert({ user_id: user.id, verdict_id: verdictId })
  }

  revalidatePath(`/products/${slug}`)
  return { ok: true }
}
