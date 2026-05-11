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
  size?: BadgeSize
  dot?: boolean
  icon?: ReactNode
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-elevated text-ink-secondary border-surface-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-status-verified/10 text-status-verified border-status-verified/25',
  warning: 'bg-status-suspicious/10 text-status-suspicious border-status-suspicious/25',
  danger: 'bg-status-fake/10 text-status-fake border-status-fake/25',
  info: 'bg-status-info/10 text-status-info border-status-info/25',
  verified: 'bg-status-verified/10 text-status-verified border-status-verified/25',
  suspicious: 'bg-status-suspicious/10 text-status-suspicious border-status-suspicious/25',
  fake: 'bg-status-fake/10 text-status-fake border-status-fake/25',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
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

export function Badge({ className, tone = 'neutral', size = 'md', dot, icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wider rounded-full border whitespace-nowrap',
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotColors[tone])} />}
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
