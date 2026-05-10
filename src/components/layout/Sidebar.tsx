import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  Wallet,
  Menu,
  X,
  Award,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
]

const bottomNavItems = [
  { to: '/institutions', icon: Building2, label: 'Institutions' },
  { to: '/badge', icon: Award, label: 'Badge Lookup' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-surface-card border border-surface-border text-ink-primary hover:bg-surface-hover transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-surface-card border-r border-surface-border
          flex flex-col z-40
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-surface-border">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-ink-primary leading-tight">
                Verity
              </h1>
              <p className="text-[10px] text-ink-muted font-medium tracking-wider uppercase">
                Trust, Verified.
              </p>
            </div>
          </NavLink>
        </div>

        {/* Main nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive: active }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active || isActive(item.to)
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover border-l-2 border-transparent'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-surface-border">
            <p className="px-3 text-[10px] text-ink-muted uppercase tracking-wider font-semibold mb-2">
              Resources
            </p>
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active || isActive(item.to)
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover border-l-2 border-transparent'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-elevated">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {(user?.name || user?.fullName || 'U')?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-[11px] text-ink-muted truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
