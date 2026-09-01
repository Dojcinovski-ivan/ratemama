'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GENDER_OPTIONS } from '@/lib/onboarding-options'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Note } from '@/components/ui'
import { ChoiceCard } from '../choice-card'
import { StepShell } from '../step-shell'

export default function GenderStep() {
  const router = useRouter()
  const [choice, setChoice] = useState('')

  useEffect(() => {
    const draft = readDraft()
    if (!draft.household) {
      router.replace('/onboarding/household')
      return
    }
    if (draft.gender) setChoice(draft.gender)
  }, [router])

  function next(value: string) {
    writeDraft({ gender: value })
    router.push('/onboarding/categories')
  }

  return (
    <StepShell
      step={2}
      heading="Anything else about you?"
      subheading="This is optional. It only helps us pick which products to show you first."
      back="/onboarding/household"
      action={
        <div className="space-y-3">
          <Button disabled={!choice} onClick={() => next(choice)}>
            Continue
          </Button>
          <button
            type="button"
            onClick={() => next('')}
            className="block w-full py-1 text-sm font-medium text-ink-soft"
          >
            Skip this question
          </button>
        </div>
      }
    >
      <p className="mb-3 text-base font-semibold text-ink">How do you describe yourself?</p>
      <div className="space-y-3">
        {GENDER_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            selected={choice === option.value}
            onSelect={() => setChoice(option.value)}
          />
        ))}
      </div>
      <div className="mt-5">
        <Note>
          Only you can see this. It never appears on your profile or on any rating you leave.
        </Note>
      </div>
    </StepShell>
  )
}
