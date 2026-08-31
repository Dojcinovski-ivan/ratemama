'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar } from './progress-bar'

/**
 * One question per screen. The whole step fits the viewport so nobody
 * has to scroll to find the question, with the action pinned below it.
 */
export function StepShell({
  step,
  heading,
  subheading,
  back,
  children,
  action,
}: {
  step: number
  heading: string
  subheading?: string
  back?: string
  children: React.ReactNode
  action: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-6">
      <ProgressBar step={step} />

      {back && (
        <button
          type="button"
          onClick={() => router.push(back)}
          className="mt-5 self-start text-sm font-medium text-ink-soft hover:text-ink"
        >
          Back
        </button>
      )}

      <header className={back ? 'mt-4' : 'mt-8'}>
        <h1 className="font-serif text-3xl leading-tight text-ink">{heading}</h1>
        {subheading && (
          <p className="mt-2.5 text-base leading-relaxed text-ink-soft">{subheading}</p>
        )}
      </header>

      <div className="mt-6 flex-1 overflow-y-auto">{children}</div>

      <div className="sticky bottom-0 bg-white pb-[env(safe-area-inset-bottom)] pt-4">{action}</div>
    </div>
  )
}
