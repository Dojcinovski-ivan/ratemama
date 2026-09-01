'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Input, Note } from '@/components/ui'
import { StepShell } from '../step-shell'

export default function NameStep() {
  const router = useRouter()
  const [value, setValue] = useState('')

  useEffect(() => {
    const draft = readDraft()
    if (!draft.household) {
      router.replace('/onboarding/household')
      return
    }
    if (draft.firstName) setValue(draft.firstName)
  }, [router])

  function next() {
    writeDraft({ firstName: value.trim() })
    router.push('/onboarding/email')
  }

  return (
    <StepShell
      step={6}
      heading="What should we call you?"
      subheading="Just your first name. It is the only name other families ever see."
      back="/onboarding/swipe"
      action={
        <Button disabled={value.trim().length === 0} onClick={next}>
          Continue
        </Button>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) next() }}>
        <Input
          label="First name"
          name="first_name"
          autoComplete="given-name"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </form>
      <div className="mt-4">
        <Note>We never ask for your surname.</Note>
      </div>
    </StepShell>
  )
}
