'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HOUSEHOLD_TYPES } from '@/lib/onboarding-options'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Note } from '@/components/ui'
import { ChoiceCard } from '../choice-card'
import { StepShell } from '../step-shell'

export default function HouseholdStep() {
  const router = useRouter()
  const [choice, setChoice] = useState('')

  // Coming back mid flow restores whatever they already answered.
  useEffect(() => {
    const draft = readDraft()
    if (draft.household) setChoice(draft.household)
  }, [])

  function next() {
    writeDraft({ household: choice })
    router.push('/onboarding/categories')
  }

  return (
    <StepShell
      step={1}
      heading="First things first."
      subheading="Tell us a little about your household so we can show you the most relevant ratings."
      action={
        <Button disabled={!choice} onClick={next}>
          Continue
        </Button>
      }
    >
      <p className="mb-3 text-base font-semibold text-ink">Who is in your household?</p>
      <div className="space-y-3">
        {HOUSEHOLD_TYPES.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            selected={choice === option.value}
            onSelect={() => setChoice(option.value)}
          />
        ))}
      </div>
      <div className="mt-5">
        <Note>This helps us show you the most relevant products.</Note>
      </div>
    </StepShell>
  )
}
