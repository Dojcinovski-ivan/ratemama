'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { forgotPasswordAction } from '../login/actions'
import { Button, FormError, Input, Screen } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending your link' : 'Send me a reset link'}
    </Button>
  )
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, {})

  if (state.sent) {
    return (
      <Screen className="justify-center">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Check your inbox.</h1>
        <p className="mt-3 text-base leading-relaxed text-neutral-600">
          If there is an account with that email, a reset link is on its way. It usually arrives
          within a minute.
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
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Forgot your password?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Happens to everyone. Pop your email in and we will send you a link to set a new one.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <FormError>{state.error}</FormError>
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="font-semibold text-worth underline">
          Back to log in
        </Link>
      </p>
    </Screen>
  )
}
