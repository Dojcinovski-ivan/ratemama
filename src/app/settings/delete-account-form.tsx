'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Button, FormError, Input } from '@/components/ui'
import { deleteAccount, type DeleteState } from './delete-account'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button
      disabled={pending}
      className="bg-notworth hover:bg-notworth-deep"
    >
      {pending ? 'Deleting' : 'Delete my account permanently'}
    </Button>
  )
}

export function DeleteAccountForm() {
  const [state, action] = useFormState<DeleteState, FormData>(deleteAccount, {})
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-10 rounded-2xl border border-notworth/30 p-5">
      <h2 className="text-lg font-bold text-neutral-900">Delete your account</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        This removes your account, your ratings, your saved products, your photos and everything
        else we hold about you. It happens immediately and cannot be undone.
      </p>

      {!open ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setOpen(true)} className="py-2.5 text-sm">
            Delete my account
          </Button>
        </div>
      ) : (
        <form action={action} className="mt-5 space-y-4">
          <Input
            label={'Type DELETE to confirm'}
            name="confirm"
            autoComplete="off"
            autoFocus
            required
          />
          {state.error && <FormError>{state.error}</FormError>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Submit />
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Keep my account
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
