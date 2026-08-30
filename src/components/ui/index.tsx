import { forwardRef } from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Full width primary action. Mobile first: large tap target. */
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
  }
>(function Button({ className, variant = 'primary', ...props }, ref) {
  const styles = {
    primary:
      'bg-worth text-worth-fg hover:bg-[#439c6e] active:bg-[#3b8a61] disabled:bg-neutral-300 disabled:text-neutral-500',
    secondary:
      'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
    ghost: 'bg-transparent text-neutral-600 hover:text-neutral-900',
  }[variant]

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-base font-semibold transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-worth',
        'disabled:cursor-not-allowed',
        styles,
        className
      )}
      {...props}
    />
  )
})

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }
>(function Input({ label, hint, error, id, className, ...props }, ref) {
  const inputId = id ?? props.name
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          'mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400',
          'focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-worth',
          error ? 'border-notworth' : 'border-neutral-300',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-notworth">
          {error}
        </p>
      )}
    </div>
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }
>(function Select({ label, error, id, className, children, ...props }, ref) {
  const selectId = id ?? props.name
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'mt-1.5 block w-full appearance-none rounded-xl border bg-white px-4 py-3 text-base text-neutral-900',
          'focus:outline focus:outline-2 focus:outline-worth',
          error ? 'border-notworth' : 'border-neutral-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-sm text-notworth">{error}</p>}
    </div>
  )
})

export function Checkbox({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; error?: string }) {
  const id = props.id ?? props.name
  return (
    <div>
      <div className="flex gap-3">
        <input
          type="checkbox"
          id={id}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-400 text-worth focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-worth"
          {...props}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-neutral-700">
          {label}
        </label>
      </div>
      {error && <p className="mt-1.5 text-sm text-notworth">{error}</p>}
    </div>
  )
}

/** Warm inline note used under onboarding questions. */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-neutral-500">{children}</p>
}

export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="rounded-xl bg-notworth-soft px-4 py-3 text-sm leading-relaxed text-[#a03a3a]"
    >
      {children}
    </div>
  )
}

export function Screen({ className, ...props }: DivProps) {
  return (
    <div
      className={cn('mx-auto flex min-h-dvh w-full max-w-app flex-col px-5 py-8', className)}
      {...props}
    />
  )
}

export function FoundingMemberBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-worth-soft px-3 py-1.5 text-sm font-semibold text-[#2f7a55]">
      <svg viewBox="0 0 20 20" aria-hidden className="h-4 w-4 fill-current">
        <path d="M10 1.5l2.4 5.1 5.6.7-4.1 3.9 1.1 5.6L10 14.1 4.9 16.8 6 11.2 1.9 7.3l5.6-.7z" />
      </svg>
      Founding member
    </span>
  )
}
