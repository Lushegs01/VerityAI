import { NavLink, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  History,
  LayoutDashboard,
  ShieldCheck,
  Award,
  Layers,
  Settings,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandLockup } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify Certificate' },
  { to: '/bulk', icon: Layers, label: 'Bulk Verify' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/badge', icon: Award, label: 'Badge' },
]

const preferenceItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function Brand() {
  return (
    <NavLink to="/dashboard" className="flex items-center">
      <BrandLockup size={32} glow showSubtitle={false} />
    </NavLink>
  )
}

interface NavItemDef {
  to: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
}

function NavItem({ item, onSelect }: { item: NavItemDef; onSelect?: () => void }) {
  const location = useLocation()
  const isActive =
    item.to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(item.to)
  return (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors border-l-4',
        isActive
          ? 'bg-primary/10 text-primary border-l-primary'
          : 'border-l-transparent text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary',
      )}
    >
      <item.icon size={20} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
      <span className="truncate flex-1">{item.label}</span>
      {isActive && <ChevronRight size={14} className="text-primary" />}
    </NavLink>
  )
}

function NavGroup({
  label,
  items,
  onSelect,
}: {
  label: string
  items: NavItemDef[]
  onSelect?: () => void
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.to} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function NavItems({ onSelect }: { onSelect?: () => void }) {
  return (
    <nav className="space-y-6 px-3 py-4">
      <NavGroup label="Navigation" items={navItems} onSelect={onSelect} />
      <NavGroup label="Preferences" items={preferenceItems} onSelect={onSelect} />
    </nav>
  )
}

function SidebarFooter() {
  const { user, logout } = useAuth()
  const balance = parseFloat(user?.walletBalance || '0')
  return (
    <div className="border-t border-surface-border p-4 space-y-3">
      <div className="rounded-2xl border border-surface-border bg-surface-base p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          Wallet Balance
        </p>
        <p className="mt-1 font-mono text-lg font-black tabular-nums text-ink-primary">
          ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
        <NavLink
          to="/wallet"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-dark"
        >
          Top Up Account →
        </NavLink>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-secondary transition-colors hover:bg-status-fake-bg/40 hover:text-status-fake"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-surface-border bg-surface-card lg:flex">
        <div className="p-6">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <NavItems />
        </div>
        <SidebarFooter />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r border-surface-border bg-surface-card lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-6">
                <Brand />
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={onMobileClose}
                  className="flex size-9 items-center justify-center rounded-xl bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <NavItems onSelect={onMobileClose} />
              </div>
              <SidebarFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
