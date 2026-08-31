'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button, FormError, Input, Screen } from '@/components/ui'
import { resendConfirmation, type ResendState } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return <Button disabled={pending}>{pending ? 'Sending' : 'Send me a new link'}</Button>
}

export default function ResendForm({ initialEmail }: { initialEmail?: string }) {
  const [state, action] = useFormState<ResendState, FormData>(resendConfirmation, {})

  if (state.sent) {
    return (
      <Screen className="justify-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-worth-soft">
          <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 stroke-worth" fill="none" strokeWidth="2">
            <path d="M3 7l9 6 9-6M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7M3 7a1 1 0 011-1h16a1 1 0 011 1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check your inbox.</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          If that address has a RateMama account waiting to be confirmed, a new link is on its way.
          It usually arrives within a minute and the link is good for one hour.
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

  return (
    <Screen className="justify-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Send a new link.</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Enter the email address you signed up with and we will send a fresh confirmation link.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={initialEmail}
        />
        {state.error && <FormError>{state.error}</FormError>}
        <Submit />
      </form>

      <div className="mt-4">
        <Link href="/login" className="block">
          <Button variant="secondary">Back to log in</Button>
        </Link>
      </div>
    </Screen>
  )
}
