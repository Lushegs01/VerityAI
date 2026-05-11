import { motion } from 'framer-motion'
import { Check, Clock, CreditCard, AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'

export type PaymentStatus = 'awaiting' | 'processing' | 'success' | 'failed'

interface PaymentStatusCardProps {
  status: PaymentStatus
  amount: number
  reference?: string
  purpose?: string
  date?: Date | string
  className?: string
}

const config = {
  awaiting: {
    icon: Clock,
    label: 'Awaiting Payment',
    tone: 'warning' as const,
    ring: 'ring-status-suspicious/30',
    text: 'text-status-suspicious',
    bg: 'bg-status-suspicious/10',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    tone: 'info' as const,
    ring: 'ring-status-info/30',
    text: 'text-status-info',
    bg: 'bg-status-info/10',
  },
  success: {
    icon: Check,
    label: 'Payment Successful',
    tone: 'success' as const,
    ring: 'ring-status-verified/30',
    text: 'text-status-verified',
    bg: 'bg-status-verified/10',
  },
  failed: {
    icon: AlertCircle,
    label: 'Payment Failed',
    tone: 'danger' as const,
    ring: 'ring-status-fake/30',
    text: 'text-status-fake',
    bg: 'bg-status-fake/10',
  },
}

export function PaymentStatusCard({ status, amount, reference, purpose, date, className }: PaymentStatusCardProps) {
  const c = config[status]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('overflow-hidden rounded-2xl border border-surface-border bg-surface-card', className)}
    >
      <div className="flex items-center justify-between border-b border-surface-border p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-xl ring-1', c.bg, c.ring)}>
            <Icon size={18} className={cn(c.text, status === 'processing' && 'animate-spin')} />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Payment Status</p>
            <p className="text-sm font-semibold text-ink-primary">{c.label}</p>
          </div>
        </div>
        <Badge tone={c.tone} dot>
          {c.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 sm:gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-muted">Amount</p>
          <p className="font-mono text-lg font-bold text-ink-primary">
            N{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {purpose && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-muted">Purpose</p>
            <p className="text-sm font-medium text-ink-primary truncate">{purpose}</p>
          </div>
        )}
        {reference && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-ink-muted">Reference</p>
            <p className="font-mono text-xs text-ink-secondary">{reference}</p>
          </div>
        )}
        {date && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-ink-muted">Date</p>
            <p className="text-xs text-ink-secondary">
              {new Date(date).toLocaleString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-surface-border bg-surface-elevated/40 px-4 py-3 sm:px-5">
        <CreditCard size={14} className="text-ink-muted" />
        <span className="text-[11px] font-medium text-ink-muted">
          Secured by <span className="text-ink-primary">Squad Payments</span>
        </span>
      </div>
    </motion.div>
  )
}
