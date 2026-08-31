'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PINNED_COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Input, Note, Select } from '@/components/ui'
import { StepShell } from '../step-shell'

export default function LocationStep() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    const draft = readDraft()
    if (!draft.email) {
      router.replace('/onboarding/email')
      return
    }
    if (draft.city) setCity(draft.city)
    if (draft.country) setCountry(draft.country)
  }, [router])

  const ready = city.trim().length > 0 && country.length > 0

  function next() {
    writeDraft({ city: city.trim(), country })
    router.push('/onboarding/password')
  }

  return (
    <StepShell
      step={7}
      heading="Where do you shop?"
      subheading="Prices and availability change by area, so this makes your ratings far more useful."
      back="/onboarding/email"
      action={
        <Button disabled={!ready} onClick={next}>
          Continue
        </Button>
      }
    >
      <div className="space-y-5">
        <Input
          label="City"
          name="city"
          autoComplete="address-level2"
          autoFocus
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <Select
          label="Country"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
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
      </div>
      <div className="mt-4">
        <Note>Your city is shown on your ratings. Your full address never is.</Note>
      </div>
    </StepShell>
  )
}
