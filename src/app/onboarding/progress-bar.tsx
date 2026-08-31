import { TOTAL_STEPS } from '@/lib/onboarding-storage'

export function ProgressBar({ step }: { step: number }) {
  const percent = Math.round((step / TOTAL_STEPS) * 100)
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-cream-300"
      >
        <div
          className="h-full rounded-full bg-worth transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Step {step} of {TOTAL_STEPS}
      </p>
    </div>
  )
}
