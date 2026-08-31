import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Screen } from '@/components/ui'
import { EditProfileForm } from './edit-form'

export const metadata = { title: 'Edit your profile | RateMama' }
export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/edit')

  const { data: profile } = await supabase
    .from('users')
    .select('username, first_name, city, country, bio, profile_photo_url, privacy_setting')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/feed')

  return (
    <Screen>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Edit your profile</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Your address is ratemama.com/profile/{profile.username}
      </p>

      <div className="mt-6">
        <EditProfileForm profile={profile} />
      </div>
      <div className="h-12" />
    </Screen>
  )
}
