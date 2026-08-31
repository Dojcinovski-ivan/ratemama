'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Input, Note } from '@/components/ui'
import { StepShell } from '../step-shell'

const VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailStep() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const draft = readDraft()
    if (!draft.firstName) {
      router.replace('/onboarding/name')
      return
    }
    if (draft.email) setValue(draft.email)
  }, [router])

  const valid = VALID.test(value.trim())

  function next() {
    writeDraft({ email: value.trim().toLowerCase() })
    router.push('/onboarding/location')
  }

  return (
    <StepShell
      step={6}
      heading="What is your email?"
      subheading="We send one message to confirm it is really you, then only what you ask for."
      back="/onboarding/name"
      action={
        <Button disabled={!valid} onClick={next}>
          Continue
        </Button>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); if (valid) next() }}>
        <Input
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          error={touched && value.length > 0 && !valid ? 'That does not look like a valid email address.' : undefined}
        />
      </form>
      <div className="mt-4">
        <Note>Please double check it. You will need this email to get in.</Note>
      </div>
    </StepShell>
  )
}
