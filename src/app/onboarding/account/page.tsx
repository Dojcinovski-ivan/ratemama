'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAccount, type AccountState } from './actions'
import { PINNED_COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries'
import { clearDraft, readDraft, type OnboardingDraft } from '@/lib/onboarding-storage'
import { Button, Checkbox, FormError, Input, Select } from '@/components/ui'
import { StepShell } from '../step-shell'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" form="account-form" disabled={pending}>
      {pending ? 'Creating your account' : 'Create my account'}
    </Button>
  )
}

export default function AccountStep() {
  const router = useRouter()
  const [draft, setDraft] = useState<OnboardingDraft>({})

  useEffect(() => {
    const current = readDraft()
    if (!current.household) {
      router.replace('/onboarding/household')
      return
    }
    setDraft(current)
  }, [router])

  const [state, formAction] = useFormState<AccountState, FormData>(async (prev, data) => {
    const result = await createAccount(prev, data)
    if (result.ok) {
      clearDraft()
      // A full navigation so the new session cookie is picked up.
      window.location.href = '/feed'
    }
    return result
  }, {})

  const errors = state.fieldErrors ?? {}

  return (
    <StepShell
      step={5}
      heading="Your feed is ready. Save your progress."
      subheading="Create your free account to see your personalised ratings feed."
      back="/onboarding/swipe"
      action={<SubmitButton />}
    >
      <form id="account-form" action={formAction} className="space-y-5">
        <input type="hidden" name="draft" value={JSON.stringify(draft)} />

        <FormError>{state.error}</FormError>

        <Input label="First name" name="first_name" autoComplete="given-name" required error={errors.first_name} />
        <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" required error={errors.email} />
        <Input label="City" name="city" autoComplete="address-level2" required error={errors.city} />

        <Select label="Country" name="country" required defaultValue="" error={errors.country}>
          <option value="" disabled>
            Choose your country
          </option>
          <optgroup label="Most common">
            {PINNED_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {OTHER_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </Select>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          error={errors.password}
        />

        <div className="space-y-4 border-t border-cream-300 pt-5">
          <Checkbox
            name="email_marketing_consent"
            label="Send me weekly product ratings and updates by email (optional)"
          />
          <Checkbox
            name="terms"
            required
            error={errors.terms}
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
