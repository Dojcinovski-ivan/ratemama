import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Own profile: send people to their public address. */
export default async function ProfileRedirect() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profile')

  const { data } = await supabase.from('users').select('username').eq('id', user.id).maybeSingle()
  if (!data?.username) redirect('/feed')

  redirect(`/profile/${data.username}`)
}
