import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { Bell, Menu, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/verify': 'Verify',
  '/history': 'History',
  '/wallet': 'Wallet',
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const balance = parseFloat(user?.walletBalance || '0')
  const title = pageTitles[location.pathname] ?? 'Verity'

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-card/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-primary transition-colors hover:bg-surface-hover lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink-primary lg:hidden">
              {title}
            </p>
            <span className="hidden text-xs font-medium text-ink-muted lg:inline">
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/wallet" aria-label="Wallet balance">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-2.5 py-1.5 transition-colors hover:border-primary/30 sm:px-3"
            >
              <Wallet size={15} className="text-primary" />
              <span className="font-mono text-xs font-semibold text-ink-primary sm:text-sm">
                N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          </Link>

          <div className={`hidden rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider sm:block ${
            user?.plan === 'pro'
              ? 'bg-primary/10 text-primary'
              : user?.plan === 'enterprise'
                ? 'bg-status-suspicious/10 text-status-suspicious'
                : 'bg-surface-elevated text-ink-muted'
          }`}>
            {user?.plan || 'Free'}
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  )
}
