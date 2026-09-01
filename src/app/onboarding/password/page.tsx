'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { finishSignup, type SignupState } from './actions'
import { clearDraft, readDraft, type OnboardingDraft } from '@/lib/onboarding-storage'
import { Button, Checkbox, FormError, Input } from '@/components/ui'
import { StepShell } from '../step-shell'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" form="signup-form" disabled={pending || disabled}>
      {pending ? 'Creating your account' : 'Create my account'}
    </Button>
  )
}

export default function PasswordStep() {
  const router = useRouter()
  const [draft, setDraft] = useState<OnboardingDraft>({})
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)

  useEffect(() => {
    const current = readDraft()
    if (!current.city || !current.country) {
      router.replace('/onboarding/location')
      return
    }
    setDraft(current)
  }, [router])

  const [state, formAction] = useFormState<SignupState, FormData>(async (prev, data) => {
    const result = await finishSignup(prev, data)
    if (result.ok) {
      const email = readDraft().email ?? ''
      clearDraft()
      router.push(`/onboarding/confirm?email=${encodeURIComponent(email)}`)
    }
    return result
  }, {})

  const ready = password.length >= 8 && terms

  return (
    <StepShell
      step={9}
      heading="Last step. Choose a password."
      subheading="Then we send one email to confirm your address and you are in."
      back="/onboarding/location"
      action={<SubmitButton disabled={!ready} />}
    >
      <form id="signup-form" action={formAction} className="space-y-5">
        <input type="hidden" name="draft" value={JSON.stringify(draft)} />

        <FormError>{state.error}</FormError>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          autoFocus
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters."
        />

        <div className="space-y-4 border-t border-cream-300 pt-5">
          <Checkbox
            name="email_marketing_consent"
            label="Send me weekly product ratings and updates by email (optional)"
          />
          <Checkbox
            name="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            label={
              <>
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-worth underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-worth underline">
                  Privacy Policy
                </Link>
              </>
            }
          />
        </div>
      </form>
    </StepShell>
  )
}
