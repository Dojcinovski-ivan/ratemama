'use client'

import { useEffect, useState } from 'react'
import { readConsent, writeConsent } from '@/components/analytics'
import { Button } from '@/components/ui'

/**
 * Withdrawing consent has to be as easy as giving it, so this mirrors the
 * banner exactly and takes effect immediately rather than on next visit.
 */
export function CookieChoice() {
  const [choice, setChoice] = useState<'true' | 'false' | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setChoice(readConsent())
  }, [])

  function set(value: 'true' | 'false') {
    writeConsent(value)
    setChoice(value)
    setSaved(true)
  }

  const label =
    choice === 'true'
      ? 'Analytics cookies are on.'
      : choice === 'false'
        ? 'Analytics cookies are off.'
        : 'You have not chosen yet, so nothing is being set.'

  return (
    <section className="mt-10 rounded-2xl border border-neutral-200 p-5">
      <h2 className="text-lg font-bold text-neutral-900">Cookies</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        We use Google Analytics to see which pages people find useful. It never reads your ratings
        or your email. {label}
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => set('true')}
          className="py-2.5 text-sm"
          variant={choice === 'true' ? 'primary' : 'secondary'}
        >
          Allow
        </Button>
        <Button
          onClick={() => set('false')}
          className="py-2.5 text-sm"
          variant={choice === 'false' ? 'primary' : 'secondary'}
        >
          Turn off
        </Button>
      </div>
      {saved && (
        <p className="mt-3 text-sm font-medium text-worth">
          Saved.{' '}
          {choice === 'false' ? 'Analytics stopped and the cookies were cleared.' : 'Thank you.'}
        </p>
      )}
    </section>
  )
}
