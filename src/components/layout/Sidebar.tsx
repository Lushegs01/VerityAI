import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  History,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function Brand() {
  return (
    <NavLink to="/dashboard" className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-glow">
        <ShieldCheck className="text-white" size={21} />
      </div>
      <div className="min-w-0">
        <h1 className="font-display text-lg font-bold leading-tight text-ink-primary">
          Verity
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
          Trust, Verified.
        </p>
      </div>
    </NavLink>
  )
}

function NavItems({ onSelect }: { onSelect?: () => void }) {
  const location = useLocation()

  const isActivePath = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onSelect}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
              isActive || isActivePath(item.to)
                ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
            }`
          }
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function UserProfile() {
  const { user } = useAuth()
  const initial = (user?.name || user?.fullName || 'U').charAt(0).toUpperCase()

  return (
    <div className="border-t border-surface-border p-4">
      <div className="flex min-w-0 items-center gap-3 rounded-xl bg-surface-elevated px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <span className="text-xs font-semibold text-primary">{initial}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-primary">
            {user?.fullName || user?.name || 'User'}
          </p>
          <p className="truncate text-[11px] text-ink-muted">
            {user?.email || 'Signed in'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-surface-border bg-surface-card lg:flex lg:flex-col">
        <div className="border-b border-surface-border p-6">
          <Brand />
        </div>
        <div className="flex-1">
          <NavItems />
        </div>
        <UserProfile />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-surface-border bg-surface-card shadow-2xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            >
              <div className="flex items-center justify-between border-b border-surface-border p-5">
                <Brand />
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={onMobileClose}
                  className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:text-ink-primary"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <NavItems onSelect={onMobileClose} />
              </div>
              <UserProfile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
