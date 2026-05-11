import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ className, label, hint, error, leftIcon, rightSlot, id, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 text-ink-muted">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-12 w-full rounded-xl border bg-surface-elevated px-4 text-sm font-medium text-ink-primary placeholder:text-ink-muted/70 transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-primary',
              leftIcon && 'pl-11',
              rightSlot && 'pr-11',
              error
                ? 'border-status-fake/60 focus:border-status-fake'
                : 'border-surface-border focus:border-primary',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightSlot && <span className="absolute right-3">{rightSlot}</span>}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-[10px] font-bold text-status-fake">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-[10px] font-mono text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
Field.displayName = 'Field'

export function Select({
  className,
  label,
  hint,
  error,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string }) {
  const selectId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'h-12 w-full cursor-pointer appearance-none rounded-xl border bg-surface-base px-4 pr-10 text-sm font-bold text-ink-primary transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-primary',
            error
              ? 'border-status-fake/60 focus:border-status-fake'
              : 'border-surface-border focus:border-primary',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error ? (
        <p className="text-[10px] font-bold text-status-fake">{error}</p>
      ) : hint ? (
        <p className="text-[10px] font-mono text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}
