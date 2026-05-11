import { motion } from 'framer-motion'
import { Link } from 'react-router'
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Wallet,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import ActivityChart from '@/components/charts/ActivityChart'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats } = trpc.dashboard.stats.useQuery()
  const { data: recent } = trpc.dashboard.recent.useQuery()
  const { data: activity } = trpc.dashboard.activity.useQuery()

  const statCards = [
    {
      label: 'Total Verified',
      value: stats?.totalVerified || 0,
      icon: ShieldCheck,
      color: 'text-status-verified',
      bg: 'bg-status-verified/10',
      border: 'border-status-verified/20',
    },
    {
      label: 'Suspicious',
      value: stats?.totalSuspicious || 0,
      icon: AlertTriangle,
      color: 'text-status-suspicious',
      bg: 'bg-status-suspicious/10',
      border: 'border-status-suspicious/20',
    },
    {
      label: 'Likely Fake',
      value: stats?.totalFake || 0,
      icon: XCircle,
      color: 'text-status-fake',
      bg: 'bg-status-fake/10',
      border: 'border-status-fake/20',
    },
    {
      label: 'Wallet Balance',
      value: `N${parseFloat(user?.walletBalance || '0').toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
  ]

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED':
        return 'bg-status-verified/10 text-status-verified border-status-verified/20'
      case 'SUSPICIOUS':
        return 'bg-status-suspicious/10 text-status-suspicious border-status-suspicious/20'
      case 'LIKELY_FAKE':
        return 'bg-status-fake/10 text-status-fake border-status-fake/20'
      default:
        return 'bg-surface-elevated text-ink-muted'
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl text-ink-primary sm:text-3xl">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Here's what's happening with your verifications today.
          </p>
        </div>
        <Link
          to="/verify"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Verify Certificate
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={item}
            className={`rounded-lg border ${card.border} bg-surface-card p-5 transition-colors hover:border-surface-border`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
              <ArrowUpRight size={14} className="text-ink-muted" />
            </div>
            <p className="text-2xl font-mono font-bold text-ink-primary">
              {typeof card.value === 'number'
                ? card.value.toLocaleString()
                : card.value}
            </p>
            <p className="text-xs text-ink-muted mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-surface-border bg-surface-card p-5 sm:p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-ink-primary">
              Verification Activity
            </h2>
            <span className="text-xs text-ink-muted">Last 30 days</span>
          </div>
          <ActivityChart data={activity || []} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-surface-border bg-surface-card p-5 sm:p-6"
        >
          <h2 className="font-display text-lg text-ink-primary mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <Link
              to="/verify"
              className="group flex min-h-12 items-center gap-3 rounded-lg border border-primary/15 bg-primary/5 px-3 transition-colors hover:bg-primary/10"
            >
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-sm font-medium text-ink-primary">Verify Certificate</span>
              <ArrowUpRight size={14} className="text-primary opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
            </Link>
            <Link
              to="/wallet"
              className="group flex min-h-12 items-center gap-3 rounded-lg border border-surface-border bg-surface-elevated px-3 transition-colors hover:border-primary/20"
            >
              <Wallet size={18} className="text-primary" />
              <span className="text-sm font-medium text-ink-primary">Top Up Wallet</span>
              <ArrowUpRight size={14} className="text-ink-muted opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-border">
            <p className="text-xs text-ink-muted mb-2">Plan Usage</p>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-secondary">Verifications used</span>
              <span className="font-mono text-ink-primary">
                {user?.verificationCount || 0} / {user?.plan === 'pro' ? 200 : user?.plan === 'enterprise' ? 'Unlimited' : 5}
              </span>
            </div>
            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((user?.verificationCount || 0) /
                      (user?.plan === 'pro' ? 200 : 5)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Verifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="overflow-hidden rounded-lg border border-surface-border bg-surface-card"
      >
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-display text-lg text-ink-primary">
            Recent Verifications
          </h2>
          <Link to="/history" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="divide-y divide-surface-border">
          {recent && recent.length > 0 ? (
            recent.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono ${getVerdictBadge(cert.verdict || '')}`}>
                    {cert.trustScore || 0}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {cert.applicantName || 'Unknown'}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {cert.certificateType} {cert.institutionName && `- ${cert.institutionName}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getVerdictBadge(cert.verdict || '')}`}>
                    {cert.verdict}
                  </span>
                  <p className="text-[10px] text-ink-muted mt-1 flex items-center justify-end gap-1">
                    <Clock size={10} />
                    {cert.createdAt
                      ? new Date(cert.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <ShieldCheck size={32} className="text-ink-muted mx-auto mb-2" />
              <p className="text-sm text-ink-muted">No verifications yet</p>
              <Link to="/verify" className="text-xs text-primary hover:underline mt-1 inline-block">
                Start your first verification
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
