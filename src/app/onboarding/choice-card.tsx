import { cn } from '@/components/ui'

export function ChoiceCard({
  label,
  selected,
  multi,
  onSelect,
}: {
  label: string
  selected: boolean
  multi?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-worth',
        selected
          ? 'border-worth bg-worth-soft text-neutral-900'
          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors',
          multi ? 'rounded-md' : 'rounded-full',
          selected ? 'border-worth bg-worth' : 'border-neutral-300 bg-white'
        )}
      >
        {selected && (
          <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-white">
            <path d="M6.2 11.3L3 8.1l1.1-1.1 2.1 2.1 5.7-5.7L13 4.5z" />
          </svg>
        )}
      </span>
      <span className="leading-snug">{label}</span>
    </button>
  )
}
