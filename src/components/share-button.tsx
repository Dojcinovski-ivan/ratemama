'use client'

import { useState } from 'react'
import { cn } from '@/components/ui'

/**
 * Native share sheet on mobile, clipboard with a small toast on desktop.
 */
export function ShareButton({
  url,
  text,
  label = 'Share',
  toast = 'Link copied',
  className,
}: {
  url: string
  text: string
  label?: string
  toast?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const absolute = url.startsWith('http')
      ? url
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: `${text} ${absolute}`, url: absolute })
        return
      } catch {
        // The person dismissed the sheet, or sharing is blocked. Fall
        // through to the clipboard so the button still does something.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${absolute}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={share}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400',
          className
        )}
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 15V3.5M12 3.5L8.5 7M12 3.5L15.5 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 13v6a1 1 0 001 1h12a1 1 0 001-1v-6" strokeLinecap="round" />
        </svg>
        {label}
      </button>
      {copied && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          {toast}
        </span>
      )}
    </span>
  )
}
