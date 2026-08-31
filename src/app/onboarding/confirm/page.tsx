import Link from 'next/link'
import { Button } from '@/components/ui'

export const metadata = { title: 'Confirm your email | RateMama' }

export default function ConfirmStep({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email ?? ''

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col justify-center px-5 py-8">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-worth-soft">
        <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 stroke-worth" fill="none" strokeWidth="2">
          <path d="M3 7l9 6 9-6M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7M3 7a1 1 0 011-1h16a1 1 0 011 1" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl leading-tight text-ink">
        Confirm your email address.
      </h1>

      <p className="mt-3 text-base leading-relaxed text-ink-soft">
        Your account is ready and your answers are saved. We have sent a confirmation link
        {email ? ' to ' : ''}
        {email && <span className="font-semibold text-ink">{email}</span>}. Tap it and you will
        land straight in your feed.
      </p>

      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Nothing there yet? Have a quick look in your spam folder, it sometimes arrives there first.
      </p>

      <div className="mt-8 space-y-3">
        <Link href="/discover" className="block">
          <Button variant="secondary">Browse products while you wait</Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="ghost">Back to log in</Button>
        </Link>
      </div>
    </div>
  )
}
