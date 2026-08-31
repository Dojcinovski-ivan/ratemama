import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribe } from '@/lib/email/unsubscribe-token'
import { Button, Screen } from '@/components/ui'

export const metadata = { title: 'Unsubscribe | RateMama', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token ?? ''
  const userId = token ? verifyUnsubscribe(token) : null

  let done = false
  if (userId) {
    const admin = createAdminClient()
    const { error } = await admin
      .from('users')
      .update({ email_marketing_consent: false, email_marketing_consent_date: null })
      .eq('id', userId)
    done = !error
  }

  return (
    <Screen className="justify-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        {done ? 'You have been unsubscribed.' : 'We could not unsubscribe you.'}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        {done
          ? 'You will no longer receive emails from RateMama. Your account and your ratings are untouched, and you can turn email back on any time in your settings.'
          : 'That link did not work. It may have been cut short by your email app. Email hello@ratemama.com and we will take care of it for you.'}
      </p>

      <div className="mt-8">
        <Link href="/" className="block">
          <Button variant="secondary">Back to RateMama</Button>
        </Link>
      </div>
    </Screen>
  )
}
