'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPERMARKETS } from '@/lib/onboarding-options'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Note } from '@/components/ui'
import { ChoiceCard } from '../choice-card'
import { StepShell } from '../step-shell'

export default function SupermarketsStep() {
  const router = useRouter()
  const [chosen, setChosen] = useState<string[]>([])

  useEffect(() => {
    const draft = readDraft()
    if (!draft.categories || draft.categories.length === 0) {
      router.replace('/onboarding/categories')
      return
    }
    if (draft.supermarkets) setChosen(draft.supermarkets)
  }, [router])

  function toggle(value: string) {
    setChosen((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]))
  }

  function next() {
    writeDraft({ supermarkets: chosen })
    router.push('/onboarding/swipe')
  }

  return (
    <StepShell
      step={3}
      heading="Where do you usually shop?"
      back="/onboarding/categories"
      action={
        <Button disabled={chosen.length === 0} onClick={next}>
          Continue
        </Button>
      }
    >
      <div className="space-y-3">
        {SUPERMARKETS.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            multi
            selected={chosen.includes(option.value)}
            onSelect={() => toggle(option.value)}
          />
        ))}
      </div>
      <div className="mt-5">
        <Note>We use this to show you relevant prices and where to buy.</Note>
      </div>
    </StepShell>
  )
}
