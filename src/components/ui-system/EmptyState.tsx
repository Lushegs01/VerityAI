import type { LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 px-6 py-12 text-center', className)}>
      <div className="relative flex size-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-elevated">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent" />
        <Icon size={22} className="relative text-ink-muted" />
      </div>
      <div className="max-w-sm">
        <p className="font-display text-base font-semibold text-ink-primary">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
