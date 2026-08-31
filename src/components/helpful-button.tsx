'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleHelpful } from '@/lib/social-actions'
import { cn } from '@/components/ui'

export function HelpfulButton({
  verdictId,
  initialCount,
  initialVoted,
  isOwn,
  signedIn,
  path,
}: {
  verdictId: string
  initialCount: number
  initialVoted: boolean
  isOwn: boolean
  signedIn: boolean
  path?: string
}) {
  const router = useRouter()
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(initialVoted)
  const [pending, startTransition] = useTransition()

  // Nobody votes on their own verdict, so it reads as a plain count.
  if (isOwn) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
        <ThumbIcon filled={false} />
        {count} found this helpful
      </span>
    )
  }

  function press() {
    if (!signedIn) {
      router.push('/login')
      return
    }
    const next = !voted
    setVoted(next)
    setCount((c) => c + (next ? 1 : -1))
    startTransition(async () => {
      const result = await toggleHelpful(verdictId, path)
      if (result.error) {
        setVoted(!next)
        setCount((c) => c + (next ? -1 : 1))
      }
    })
  }

  return (
    <button
      type="button"
      onClick={press}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? 'Remove your helpful vote' : 'Mark this verdict helpful'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        voted
          ? 'border-worth bg-worth-soft text-[#2f7a55]'
          : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
      )}
    >
      <ThumbIcon filled={voted} />
      Helpful
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  )
}

function ThumbIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M7 20V10l4.5-6.5c1.2 0 2 .9 2 2V9h4.2c1.2 0 2.1 1.1 1.8 2.3l-1.6 6.4c-.2.8-1 1.3-1.8 1.3H7z" strokeLinejoin="round" />
      <path d="M7 10H4.5v10H7" strokeLinejoin="round" />
    </svg>
  )
}
