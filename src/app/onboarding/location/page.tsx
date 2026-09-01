'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PINNED_COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries'
import { citiesFor, hasCityList, OTHER_CITY } from '@/lib/cities'
import { readDraft, writeDraft } from '@/lib/onboarding-storage'
import { Button, Input, Note, Select } from '@/components/ui'
import { StepShell } from '../step-shell'

export default function LocationStep() {
  const router = useRouter()
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  // Set when someone picks Other from the list, or when their country has
  // no list at all, so nobody is ever blocked by a town we left out.
  const [freeCity, setFreeCity] = useState('')

  useEffect(() => {
    const draft = readDraft()
    if (!draft.email) {
      router.replace('/onboarding/email')
      return
    }
    if (draft.country) setCountry(draft.country)
    if (draft.city) {
      const list = draft.country ? citiesFor(draft.country) : null
      if (list && list.includes(draft.city)) setCity(draft.city)
      else {
        setCity(OTHER_CITY)
        setFreeCity(draft.city)
      }
    }
  }, [router])

  const list = country ? citiesFor(country) : null
  const needsFreeText = !country || !hasCityList(country) || city === OTHER_CITY
  const chosenCity = needsFreeText ? freeCity.trim() : city

  const ready = country.length > 0 && chosenCity.length > 0

  function onCountryChange(value: string) {
    setCountry(value)
    // A city from the previous country would be wrong, so clear it.
    setCity('')
    setFreeCity('')
  }

  function next() {
    writeDraft({ city: chosenCity, country })
    router.push('/onboarding/password')
  }

  return (
    <StepShell
      step={8}
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
        <Select
          label="Country"
          name="country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
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

        {list ? (
          <>
            <Select
              label="City or town"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="" disabled>
                Choose your city or town
              </option>
              {list.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER_CITY}>Other</option>
            </Select>

            {city === OTHER_CITY && (
              <Input
                label="Your city or town"
                name="city_other"
                autoComplete="address-level2"
                autoFocus
                value={freeCity}
                onChange={(e) => setFreeCity(e.target.value)}
              />
            )}
          </>
        ) : (
          <Input
            label="City or town"
            name="city"
            autoComplete="address-level2"
            disabled={!country}
            value={freeCity}
            onChange={(e) => setFreeCity(e.target.value)}
          />
        )}
      </div>
      <div className="mt-4">
        <Note>Your city is shown on your ratings. Your full address never is.</Note>
      </div>
    </StepShell>
  )
}
