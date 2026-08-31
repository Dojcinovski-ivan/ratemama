'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleSave } from '@/lib/social-actions'
import { cn } from '@/components/ui'

export function SaveButton({
  productId,
  initialSaved,
  signedIn,
  path,
  className,
}: {
  productId: string
  initialSaved: boolean
  signedIn: boolean
  path?: string
  className?: string
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  function press() {
    if (!signedIn) {
      router.push('/login')
      return
    }
    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const result = await toggleSave(productId, path)
      if (result.error) setSaved(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={press}
      disabled={pending}
      aria-pressed={saved}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        saved
          ? 'border-worth bg-worth-soft text-[#2f7a55]'
          : 'border-neutral-300 text-neutral-600 hover:border-neutral-400',
        className
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path d="M6.5 3.5h11a1 1 0 011 1v16l-6.5-4-6.5 4v-16a1 1 0 011-1z" strokeLinejoin="round" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
