import { useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandMark } from '@/components/brand/Logo'

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth()
  const balance = parseFloat(user?.walletBalance || '0')
  const initial = (user?.name || user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-0 z-30 hidden h-20 items-center border-b border-surface-border bg-surface-card/50 px-10 backdrop-blur-md lg:flex">
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-md">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              placeholder="Search forensic records..."
              className="h-11 w-full rounded-xl border border-surface-border bg-surface-base pl-11 pr-4 text-sm font-medium text-ink-primary placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/wallet" className="flex flex-col items-end leading-tight">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
              Balance
            </span>
            <span className="font-mono text-sm font-black tabular-nums text-ink-primary">
              ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-surface-card" />
          </button>

          <div className="h-8 w-px bg-surface-border" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-3"
            >
              <div className="text-right leading-tight">
                <p className="text-sm font-bold text-ink-primary">
                  {user?.fullName || user?.name || 'User'}
                </p>
                <p className="text-[11px] font-medium text-ink-muted">
                  {user?.companyName || user?.email || ''}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-black text-white shadow-md">
                {initial}
              </span>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 z-20 w-56 rounded-2xl border border-surface-border bg-surface-card p-2 shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-secondary transition-colors hover:bg-status-fake-bg/40 hover:text-status-fake"
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-surface-card/50 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="flex size-10 items-center justify-center rounded-xl text-ink-primary transition-colors hover:bg-surface-elevated"
        >
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <BrandMark size={22} />
          <span className="font-display text-base font-black uppercase tracking-tighter text-primary">
            VerityAI
          </span>
        </Link>
        <Link
          to="/wallet"
          aria-label="Wallet"
          className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-black text-white shadow-md"
        >
          {initial}
        </Link>
      </header>
    </>
  )
}
