'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction, type LoginState } from './actions'
import { createClient } from '@/lib/supabase/client'
import { Button, FormError, Input, Screen } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Logging you in' : 'Log in'}
    </Button>
  )
}

export default function LoginForm({
  next,
  oauthError,
}: {
  next?: string
  oauthError?: boolean
}) {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, {})

  async function signInWithGoogle() {
    const supabase = createClient()
    const siteUrl = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    })
  }

  return (
    <Screen className="justify-center">
      <header className="mb-8">
        <p className="text-lg font-bold text-worth">RateMama</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
          Welcome back.
        </h1>
        <p className="mt-2 text-base leading-relaxed text-neutral-600">
          Log in to see what families are saying this week.
        </p>
      </header>

      <form action={formAction} className="space-y-5">
        <FormError>
          {state.error ??
            (oauthError ? 'We could not log you in with Google just then. Please try again.' : null)}
        </FormError>

        <input type="hidden" name="next" value={next ?? ''} />

        <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-worth underline">
            Forgot your password?
          </Link>
        </div>

        <SubmitButton />
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-sm text-neutral-500">or</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <Button variant="secondary" type="button" onClick={signInWithGoogle}>
        <svg viewBox="0 0 24 24" aria-hidden className="mr-2.5 h-5 w-5">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 01-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 01-10.7-3.8H1.3v3.1A12 12 0 0012 24z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 010-4.6V6.6H1.3a12 12 0 000 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 001.3 6.6l4 3.1A7.2 7.2 0 0112 4.8z" />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-neutral-600">
        New to RateMama?{' '}
        <Link href="/register" className="font-semibold text-worth underline">
          Create an account
        </Link>
      </p>
    </Screen>
  )
}
