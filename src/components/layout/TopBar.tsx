import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { Bell, Menu, Search, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from './ThemeToggle'

const pageInfo: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Verification command center' },
  '/verify': { title: 'Verify', subtitle: 'Start a new AI verification' },
  '/history': { title: 'History', subtitle: 'Full audit trail of submissions' },
  '/wallet': { title: 'Wallet', subtitle: 'Squad payments & credit balance' },
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const balance = parseFloat(user?.walletBalance || '0')

  const matched = Object.keys(pageInfo).find((p) => location.pathname.startsWith(p))
  const info = matched ? pageInfo[matched] : { title: 'VerityAI' }

  const planLabel = (user?.plan || 'free').toUpperCase()
  const planTone =
    user?.plan === 'pro'
      ? 'bg-primary/10 text-primary border-primary/20'
      : user?.plan === 'enterprise'
        ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
        : 'bg-surface-elevated text-ink-muted border-surface-border'

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-base/85 backdrop-blur-xl">
      <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-primary transition-colors hover:bg-surface-hover lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold tracking-tight text-ink-primary leading-tight">
              {info.title}
            </h1>
            {info.subtitle && (
              <p className="hidden text-xs text-ink-muted sm:block">{info.subtitle}</p>
            )}
          </div>
        </div>

        <div className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              placeholder="Search verifications, IDs, applicants..."
              className="h-10 w-full rounded-xl border border-surface-border bg-surface-elevated pl-10 pr-3 text-sm text-ink-primary placeholder:text-ink-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search workspace"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-surface-border bg-surface-card px-1.5 py-0.5 font-mono text-[10px] text-ink-muted lg:inline-flex">
              N
            </kbd>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link to="/wallet" aria-label="Wallet balance">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="hidden items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2 transition-colors hover:border-primary/30 sm:flex"
            >
              <Wallet size={14} className="text-primary" />
              <span className="font-mono text-xs font-semibold text-ink-primary">
                N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          </Link>

          <div className={`hidden rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider sm:block ${planTone}`}>
            {planLabel}
          </div>

          <ThemeToggle />

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-surface-elevated" />
          </button>
        </div>
      </div>
    </header>
  )
}
