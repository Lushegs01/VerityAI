import { NavLink, useLocation } from 'react-router'
import { History, LayoutDashboard, Layers, ShieldCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/verify', icon: ShieldCheck, label: 'Verify' },
  { to: '/bulk', icon: Layers, label: 'Bulk' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
]

export default function MobileTabBar() {
  const location = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-20 items-stretch border-t border-surface-border bg-surface-card/80 backdrop-blur-xl lg:hidden">
      {tabs.map((tab) => {
        const active =
          tab.to === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(tab.to)
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-all',
              active ? 'text-primary scale-110' : 'text-ink-muted',
            )}
          >
            <tab.icon size={20} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              {tab.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
