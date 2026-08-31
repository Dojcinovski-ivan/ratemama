'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'

const COOKIE = 'analytics_consent'

/** Public pages only. Never shown inside the signed in app. */
const PRIVATE_PREFIXES = [
  '/feed',
  '/friends',
  '/notifications',
  '/onboarding',
  '/settings',
  '/profile/edit',
]

function readChoice(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeChoice(value: 'true' | 'false') {
  const oneYear = 365 * 24 * 60 * 60
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`
}

export function CookieBanner() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (readChoice() === null) setShow(true)
  }, [])

  const isPrivate = PRIVATE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (!show || isPrivate) return null

  function choose(value: 'true' | 'false') {
    writeChoice(value)
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:rounded-2xl sm:border sm:shadow-lg"
    >
      <p className="text-sm leading-relaxed text-neutral-700">
        We use cookies to understand how people find and use RateMama. This helps us improve the
        experience for everyone.
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => choose('true')} className="py-2.5 text-sm">
          Accept
        </Button>
        <Button variant="secondary" onClick={() => choose('false')} className="py-2.5 text-sm">
          Decline
        </Button>
      </div>
    </div>
  )
}
