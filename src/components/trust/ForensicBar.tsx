import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ForensicBarProps {
  label: string
  score: number
  className?: string
  delay?: number
}

function colorFor(score: number) {
  if (score >= 70) return 'bg-status-verified'
  if (score >= 40) return 'bg-status-suspicious'
  return 'bg-status-fake'
}

function textFor(score: number) {
  if (score >= 70) return 'text-status-verified'
  if (score >= 40) return 'text-status-suspicious'
  return 'text-status-fake'
}

export default function ForensicBar({ label, score, className, delay = 0 }: ForensicBarProps) {
  const safeScore = Math.max(0, Math.min(100, score))
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          {label}
        </span>
        <span className={cn('font-mono text-[11px] font-black tabular-nums', textFor(safeScore))}>
          {safeScore}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeScore}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
          className={cn('h-full rounded-full', colorFor(safeScore))}
        />
      </div>
    </div>
  )
}

export { ForensicBar }
