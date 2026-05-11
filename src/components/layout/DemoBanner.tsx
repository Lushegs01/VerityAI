import { useAuth } from '@/hooks/useAuth'

export default function DemoBanner() {
  const { user } = useAuth()
  const email = user?.email || 'demo@verity.app'
  return (
    <div className="relative flex h-8 w-full items-center justify-center border-b border-surface-border bg-surface-elevated">
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-primary/5" aria-hidden />
      <div className="relative flex items-center gap-2">
        <span className="relative flex size-2 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
          Demo Mode — Logged in as {email}
        </span>
      </div>
    </div>
  )
}
