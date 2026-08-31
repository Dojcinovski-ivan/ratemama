'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SHOPPING_CATEGORIES } from '@/lib/onboarding-options'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button } from '@/components/ui'
import { ChoiceCard } from '../choice-card'
import { StepShell } from '../step-shell'

export default function CategoriesStep() {
  const router = useRouter()
  const [chosen, setChosen] = useState<string[]>([])

  useEffect(() => {
    const draft = readDraft()
    if (!draft.household) {
      router.replace('/onboarding/household')
      return
    }
    if (draft.categories) setChosen(draft.categories)
  }, [router])

  function toggle(value: string) {
    setChosen((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]))
  }

  function next() {
    writeDraft({ categories: chosen })
    router.push('/onboarding/supermarkets')
  }

  return (
    <StepShell
      step={2}
      heading="What do you mostly shop for?"
      subheading="Select everything that applies. You can always change this later."
      back="/onboarding/household"
      action={
        <Button disabled={chosen.length === 0} onClick={next}>
          Continue
        </Button>
      }
    >
      <div className="space-y-3">
        {SHOPPING_CATEGORIES.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            multi
            selected={chosen.includes(option.value)}
            onSelect={() => toggle(option.value)}
          />
        ))}
      </div>
    </StepShell>
  )
}
