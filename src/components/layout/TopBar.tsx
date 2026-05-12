import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { BrandMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

interface TopBarProps {
  onMenuClick: () => void
}

interface Notification {
  id: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconClass: string
  title: string
  body: string
  time: string
  href?: string
  unread: boolean
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: ShieldCheck,
    iconClass: 'bg-status-verified-bg text-status-verified',
    title: 'Credential verified',
    body: 'VRT-A7K2P9 — Adebayo Adeniran returned a 91 trust score.',
    time: '2m ago',
    href: '/verification/VRT-A7K2P9',
    unread: true,
  },
  {
    id: 'n2',
    icon: AlertTriangle,
    iconClass: 'bg-status-suspicious-bg text-status-suspicious',
    title: 'Flagged for review',
    body: 'VRT-92HD3T was scored 54. Manual review recommended.',
    time: '1h ago',
    href: '/history',
    unread: true,
  },
  {
    id: 'n3',
    icon: CreditCard,
    iconClass: 'bg-primary/10 text-primary',
    title: 'Wallet topped up',
    body: '₦5,000.00 added via Squad. Reference REF-000001.',
    time: '4h ago',
    href: '/wallet',
    unread: true,
  },
  {
    id: 'n4',
    icon: Sparkles,
    iconClass: 'bg-accent-cyan/10 text-accent-cyan',
    title: 'New: Bulk verification',
    body: 'Verify up to 50 documents in a single batch — try /bulk.',
    time: 'Yesterday',
    href: '/bulk',
    unread: false,
  },
]

function NotificationsPanel({
  notifications,
  onClose,
  onMarkAll,
}: {
  notifications: Notification[]
  onClose: () => void
  onMarkAll: () => void
}) {
  const unreadCount = notifications.filter((n) => n.unread).length
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-black uppercase tracking-tight text-ink-primary">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMarkAll}
          disabled={unreadCount === 0}
          className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-colors hover:text-primary disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Bell size={20} className="mx-auto text-ink-muted" />
            <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              You're all caught up
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-border">
            {notifications.map((n) => {
              const inner = (
                <div className={cn('flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated/40', n.unread && 'bg-primary/[0.04]')}>
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', n.iconClass)}>
                    <n.icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink-primary">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary line-clamp-2">{n.body}</p>
                    <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                      {n.time}
                    </p>
                  </div>
                  {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                </div>
              )
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link to={n.href} onClick={onClose} className="block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-surface-border px-4 py-2">
        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center justify-center gap-1 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dark"
        >
          Notification settings →
        </Link>
      </div>
    </motion.div>
  )
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth()
  const balance = parseFloat(user?.walletBalance || '0')
  const initial = (user?.name || user?.fullName || user?.email || 'U').charAt(0).toUpperCase()
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const profileRef = useRef<HTMLDivElement | null>(null)
  const bellRef = useRef<HTMLDivElement | null>(null)

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications])

  // Close popovers on outside click + Escape.
  useEffect(() => {
    if (!profileOpen && !bellOpen) return
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (profileOpen && profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false)
      }
      if (bellOpen && bellRef.current && !bellRef.current.contains(t)) {
        setBellOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setBellOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [profileOpen, bellOpen])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

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

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={bellOpen}
              onClick={() => {
                setBellOpen((v) => !v)
                setProfileOpen(false)
              }}
              className={cn(
                'relative flex size-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary',
                bellOpen && 'bg-surface-elevated text-ink-primary',
              )}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-2.5 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary ring-2 ring-surface-card" />
                </span>
              )}
            </button>
            <AnimatePresence>
              {bellOpen && (
                <NotificationsPanel
                  notifications={notifications}
                  onClose={() => setBellOpen(false)}
                  onMarkAll={markAllRead}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-px bg-surface-border" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((v) => !v)
                setBellOpen(false)
              }}
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
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-2 shadow-2xl"
                >
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-secondary transition-colors hover:bg-surface-elevated hover:text-ink-primary"
                  >
                    <CheckCircle2 size={16} className="text-primary" />
                    Account Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
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
          <BrandMark size={26} />
          <span className="font-display text-base font-black lowercase tracking-tighter text-ink-primary">
            verity
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setBellOpen((v) => !v)}
              className="relative flex size-10 items-center justify-center rounded-xl text-ink-primary transition-colors hover:bg-surface-elevated"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-surface-card" />
              )}
            </button>
            <AnimatePresence>
              {bellOpen && (
                <NotificationsPanel
                  notifications={notifications}
                  onClose={() => setBellOpen(false)}
                  onMarkAll={markAllRead}
                />
              )}
            </AnimatePresence>
          </div>
          <Link
            to="/wallet"
            aria-label="Wallet"
            className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent-cyan text-sm font-black text-white shadow-md"
          >
            {initial}
          </Link>
        </div>
      </header>
    </>
  )
}
