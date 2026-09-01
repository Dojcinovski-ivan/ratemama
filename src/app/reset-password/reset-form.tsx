'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button, FormError, Input, Screen } from '@/components/ui'
import { setNewPassword, type ResetState } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return <Button disabled={pending}>{pending ? 'Saving' : 'Save my new password'}</Button>
}

export default function ResetForm() {
  const [state, action] = useFormState<ResetState, FormData>(setNewPassword, {})

  return (
    <Screen className="justify-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Choose a new password.</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Pick something at least 8 characters long. You will be taken straight into RateMama once it
        is saved.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Input
          label="Confirm new password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state.error && <FormError>{state.error}</FormError>}
        <Submit />
      </form>

      <div className="mt-4">
        <Link href="/forgot-password" className="block">
          <Button variant="secondary">Send me a new reset link</Button>
        </Link>
      </div>
    </Screen>
  )
}
