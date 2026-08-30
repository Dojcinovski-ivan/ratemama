export function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Onboarding progress"
      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
    >
      <div
        className="h-full rounded-full bg-worth transition-[width] duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
