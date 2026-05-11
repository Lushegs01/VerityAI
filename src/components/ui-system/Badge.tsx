import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'verified'
  | 'suspicious'
  | 'fake'

type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Spec-aligned alias for `tone`. */
  variant?: 'verified' | 'suspicious' | 'fake'
  size?: BadgeSize
  dot?: boolean
  icon?: ReactNode
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-elevated text-ink-secondary border-surface-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-status-verified-bg text-status-verified border-status-verified/20',
  warning: 'bg-status-suspicious-bg text-status-suspicious border-status-suspicious/25',
  danger: 'bg-status-fake-bg text-status-fake border-status-fake/25',
  info: 'bg-status-info-bg text-status-info border-status-info/25',
  verified: 'bg-status-verified-bg text-status-verified border-status-verified/20',
  suspicious: 'bg-status-suspicious-bg text-status-suspicious border-status-suspicious/25',
  fake: 'bg-status-fake-bg text-status-fake border-status-fake/25',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'text-[9px] px-2 py-0.5 gap-1',
  md: 'text-[10px] px-3 py-1 gap-1.5',
}

const dotColors: Record<BadgeTone, string> = {
  neutral: 'bg-ink-muted',
  primary: 'bg-primary',
  success: 'bg-status-verified',
  warning: 'bg-status-suspicious',
  danger: 'bg-status-fake',
  info: 'bg-status-info',
  verified: 'bg-status-verified',
  suspicious: 'bg-status-suspicious',
  fake: 'bg-status-fake',
}

export function Badge({ className, tone, variant, size = 'md', dot, icon, children, ...props }: BadgeProps) {
  const resolvedTone: BadgeTone = (variant as BadgeTone) ?? tone ?? 'neutral'
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-black uppercase tracking-widest rounded-full border whitespace-nowrap',
        tones[resolvedTone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotColors[resolvedTone])} />}
      {icon}
      {children}
    </span>
  )
}

interface VerdictBadgeProps {
  verdict: string | null
  size?: BadgeSize
}

export function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  if (!verdict) return null

  const map: Record<string, { tone: BadgeTone; label: string }> = {
    VERIFIED: { tone: 'verified', label: 'Verified' },
    SUSPICIOUS: { tone: 'suspicious', label: 'Suspicious' },
    LIKELY_FAKE: { tone: 'fake', label: 'Likely Fake' },
    AUTHENTIC: { tone: 'verified', label: 'Authentic' },
  }

  const m = map[verdict] || { tone: 'neutral' as BadgeTone, label: verdict }

  return (
    <Badge tone={m.tone} size={size} dot>
      {m.label}
    </Badge>
  )
}
