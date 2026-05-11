import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  History,
  LayoutDashboard,
  ShieldCheck,
  Wallet,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandLockup } from '@/components/brand/Logo'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', description: 'Command center' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify', description: 'New verification' },
  { to: '/history', icon: History, label: 'History', description: 'Audit trail' },
  { to: '/wallet', icon: Wallet, label: 'Wallet', description: 'Payments' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function Brand() {
  return (
    <NavLink to="/dashboard" className="block">
      <BrandLockup size={40} gapColor="hsl(var(--sidebar-background))" />
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
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        Workspace
      </p>
      {navItems.map((item) => {
        const active = isActivePath(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onSelect}
            className={({ isActive }) =>
              `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150 ${
                isActive || active
                  ? 'bg-primary/12 text-primary'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`
            }
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <item.icon size={17} strokeWidth={active ? 2.4 : 2} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function UserProfile() {
  const { user, logout } = useAuth()
  const initial = (user?.name || user?.fullName || 'U').charAt(0).toUpperCase()

  return (
    <div className="border-t border-surface-border p-3">
      <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-xs font-bold text-white shadow-glow">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-primary">
              {user?.fullName || user?.name || 'User'}
            </p>
            <p className="truncate text-[11px] text-ink-muted">
              {user?.email || 'Signed in'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs font-medium text-ink-secondary transition-colors hover:border-status-fake/30 hover:bg-status-fake/5 hover:text-status-fake"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  )
}

function UpgradeBanner() {
  const { user } = useAuth()
  if (user?.plan === 'pro' || user?.plan === 'enterprise') return null
  return (
    <div className="mx-3 mb-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent-cyan/5 to-transparent p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <p className="text-xs font-semibold text-ink-primary">Upgrade to Pro</p>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-ink-muted">
        Bulk verifications, team seats, and detailed reports.
      </p>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-surface-border bg-sidebar lg:flex lg:flex-col">
        <div className="border-b border-surface-border p-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <NavItems />
        </div>
        <UpgradeBanner />
        <UserProfile />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-surface-border bg-sidebar lg:hidden"
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
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:text-ink-primary"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <NavItems onSelect={onMobileClose} />
              </div>
              <UpgradeBanner />
              <UserProfile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
