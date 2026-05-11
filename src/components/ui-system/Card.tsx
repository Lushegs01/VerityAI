import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  hover?: boolean
  bordered?: boolean
  padded?: boolean
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, glass, hover, bordered = true, padded, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-surface-card shadow-sm transition-all duration-200',
          bordered && 'border border-surface-border',
          glass && 'glass',
          hover && 'hover:border-primary/30 hover:shadow-soft hover:-translate-y-0.5',
          padded && 'p-5 sm:p-6',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Panel.displayName = 'Panel'

/** Alias matching the spec naming. */
export const Card = Panel

export function PanelHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between border-b border-surface-border px-5 py-4 sm:px-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display text-base font-bold uppercase tracking-tight text-ink-primary', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function PanelDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-ink-muted mt-0.5', className)} {...props}>
      {children}
    </p>
  )
}

export function PanelBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-surface-border px-5 py-4 sm:px-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
