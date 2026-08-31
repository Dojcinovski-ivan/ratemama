'use client'

import { useState } from 'react'

const DISMISS_KEY = 'ratemama_verify_dismissed'

/**
 * Shown until the email is confirmed. Dismissable, and gone for good
 * once the account is verified because the server stops rendering it.
 */
export function VerifyBanner({ justVerified }: { justVerified?: boolean }) {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  if (hidden) return null

  function dismiss() {
    setHidden(true)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Storage being unavailable should not keep the banner stuck.
    }
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-card bg-accent-soft px-4 py-3.5">
      <p className="flex-1 text-sm leading-relaxed text-accent-deep">
        {justVerified === false
          ? 'That confirmation link did not work. Check your inbox for the most recent email, or ask us for a new one.'
          : 'Check your inbox to confirm your email. This helps us keep your account secure.'}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-accent-deep hover:bg-white/50"
      >
        <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
