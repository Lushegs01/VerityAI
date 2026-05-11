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

const toneStyles: Record<NonNullable<StatCardProps['tone']>, { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' },
  success: { bg: 'bg-status-verified/10', text: 'text-status-verified', ring: 'ring-status-verified/20' },
  warning: { bg: 'bg-status-suspicious/10', text: 'text-status-suspicious', ring: 'ring-status-suspicious/20' },
  danger: { bg: 'bg-status-fake/10', text: 'text-status-fake', ring: 'ring-status-fake/20' },
  accent: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', ring: 'ring-accent-cyan/20' },
  info: { bg: 'bg-status-info/10', text: 'text-status-info', ring: 'ring-status-info/20' },
}

export function StatCard({ label, value, icon: Icon, tone = 'primary', delta, hint, className }: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-5 transition-colors hover:border-primary/30',
        className,
      )}
    >
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div className={cn('flex size-10 items-center justify-center rounded-xl ring-1', styles.bg, styles.ring)}>
          <Icon size={18} className={styles.text} />
        </div>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              delta.direction === 'up' && 'bg-status-verified/10 text-status-verified',
              delta.direction === 'down' && 'bg-status-fake/10 text-status-fake',
              delta.direction === 'neutral' && 'bg-surface-elevated text-ink-muted',
            )}
          >
            {delta.direction === 'up' && <ArrowUpRight size={11} />}
            {delta.direction === 'down' && <ArrowDownRight size={11} />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <p className="font-mono text-2xl font-bold text-ink-primary tracking-tight sm:text-3xl">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-xs font-medium text-ink-muted">{label}</p>
        {hint && <p className="mt-1 text-[11px] text-ink-muted/80">{hint}</p>}
      </div>
    </motion.div>
  )
}
