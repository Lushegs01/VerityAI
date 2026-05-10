import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Wallet, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function TopBar() {
  const { user } = useAuth()
  const balance = parseFloat(user?.walletBalance || '0')

  return (
    <header className="sticky top-0 z-20 bg-surface-card/80 backdrop-blur-md border-b border-surface-border px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left - breadcrumb placeholder */}
        <div className="ml-8 lg:ml-0">
          <span className="text-xs text-ink-muted font-medium">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Right - actions */}
        <div className="flex items-center gap-3">
          {/* Wallet balance */}
          <Link to="/wallet">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border hover:border-primary/30 transition-colors"
            >
              <Wallet size={15} className="text-primary" />
              <span className="font-mono text-sm font-semibold text-ink-primary">
                N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          </Link>

          {/* Plan badge */}
          <div className={`px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
            user?.plan === 'pro'
              ? 'bg-primary/10 text-primary'
              : user?.plan === 'enterprise'
                ? 'bg-status-suspicious/10 text-status-suspicious'
                : 'bg-surface-elevated text-ink-muted'
          }`}>
            {user?.plan || 'Free'}
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}
