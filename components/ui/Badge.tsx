import { cn } from '@/src/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'verified' | 'suspicious' | 'fake' | 'neutral';
  className?: string;
}

import { ReactNode } from 'react';

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    verified: "bg-status-verified-bg text-status-verified border-status-verified/20",
    suspicious: "bg-status-suspicious-bg text-status-suspicious border-status-suspicious/20",
    fake: "bg-status-fake-bg text-status-fake border-status-fake/20",
    neutral: "bg-surface-elevated text-ink-muted border-surface-border"
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
