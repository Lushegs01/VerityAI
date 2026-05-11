import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'info'
  delta?: { value: string; direction: 'up' | 'down' | 'neutral' }
  hint?: string
  className?: string
}

const toneStyles: Record<
  NonNullable<StatCardProps['tone']>,
  { bg: string; text: string }
> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-status-verified-bg', text: 'text-status-verified' },
  warning: { bg: 'bg-status-suspicious-bg', text: 'text-status-suspicious' },
  danger: { bg: 'bg-status-fake-bg', text: 'text-status-fake' },
  accent: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
  info: { bg: 'bg-status-info-bg', text: 'text-status-info' },
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  delta,
  hint,
  className,
}: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 shadow-sm transition-all hover:border-primary/30',
        className,
      )}
    >
      {/* Giant watermark icon */}
      <Icon
        size={128}
        className={cn(
          'pointer-events-none absolute -bottom-4 -right-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]',
          styles.text,
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className={cn('flex size-10 items-center justify-center rounded-xl bg-surface-elevated', styles.text)}>
          <Icon size={18} />
        </div>
        {delta ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest',
              delta.direction === 'up' && 'bg-status-verified-bg text-status-verified',
              delta.direction === 'down' && 'bg-status-fake-bg text-status-fake',
              delta.direction === 'neutral' && 'bg-surface-elevated text-ink-muted',
            )}
          >
            {delta.direction === 'up' && <ArrowUpRight size={11} />}
            {delta.direction === 'down' && <ArrowDownRight size={11} />}
            {delta.value}
          </span>
        ) : (
          <ArrowUpRight size={16} className="text-ink-muted/50" />
        )}
      </div>
      <div className="relative mt-6">
        <p className="font-mono text-2xl font-black tabular-nums text-ink-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          {label}
        </p>
        {hint && (
          <p className="mt-1 font-mono text-[10px] text-ink-muted/80 uppercase tracking-wider">
            {hint}
          </p>
        )}
      </div>
    </motion.div>
  )
}
