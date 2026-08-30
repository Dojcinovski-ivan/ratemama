import Link from 'next/link'
import { Button, Screen } from '@/components/ui'

export const metadata = { title: 'Check your email | RateMama' }

export default function CheckEmailPage() {
  return (
    <Screen className="justify-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-worth-soft">
        <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 stroke-worth" fill="none" strokeWidth="2">
          <path d="M3 7l9 6 9-6M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7M3 7a1 1 0 011-1h16a1 1 0 011 1" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check your inbox.</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        We have sent you a link to confirm your email. Tap it and you will be straight into
        RateMama. It usually arrives within a minute.
      </p>
      <p className="mt-4 text-base leading-relaxed text-neutral-600">
        Nothing there yet? Have a quick look in your spam folder, it sometimes lands there first.
      </p>

      <div className="mt-8">
        <Link href="/login" className="block">
          <Button variant="secondary">Back to log in</Button>
        </Link>
      </div>
    </Screen>
  )
}
