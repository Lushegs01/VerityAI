import { motion } from 'framer-motion'
import { Link } from 'react-router'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileSearch,
  Layers,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { trpc } from '@/providers/trpc'
import { demoActivity, demoRecent, demoStats } from '@/lib/demoData'
import ActivityChart from '@/components/charts/ActivityChart'
import {
  Badge,
  Button,
  Counter,
  Panel,
  Skeleton,
  StatCard,
  VerdictBadge,
} from '@/components/ui-system'

function ActiveJobs() {
  const jobs = [
    { id: 1, name: 'transcript_batch_42.pdf', progress: 68, status: 'PROCESSING' },
    { id: 2, name: 'finance_dept_15.pdf', progress: 92, status: 'FINALIZING' },
    { id: 3, name: 'engineering_22.pdf', progress: 34, status: 'PROCESSING' },
  ]
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
          Active Jobs
        </h3>
        <Badge tone="primary" size="sm">
          {jobs.length}
        </Badge>
      </div>
      <div className="mt-6 space-y-5">
        {jobs.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="truncate font-mono text-xs font-bold text-ink-primary">
                {j.name}
              </p>
              <span className="font-mono text-[10px] font-black tabular-nums text-primary">
                {j.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${j.progress}%` }}
                transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
              />
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {j.status}
            </p>
          </motion.div>
        ))}
      </div>
      <Link
        to="/bulk"
        className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-colors hover:border-primary/40 hover:text-primary"
      >
        View All Active Jobs <ArrowRight size={12} />
      </Link>
    </Panel>
  )
}

function WalletSection({ balance }: { balance: number }) {
  const transactions = [
    { id: 1, name: 'Wallet top-up', date: 'Today, 14:22', amount: 5000, kind: 'credit' as const },
    { id: 2, name: 'Verification scan', date: 'Today, 12:01', amount: -500, kind: 'debit' as const },
    { id: 3, name: 'Verification scan', date: 'Yesterday', amount: -500, kind: 'debit' as const },
    { id: 4, name: 'Wallet top-up', date: '2 days ago', amount: 10000, kind: 'credit' as const },
  ]
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Panel className="relative overflow-hidden p-8 lg:col-span-1 bg-gradient-to-br from-primary via-primary to-primary-dark text-white border-0">
        <Wallet
          size={160}
          className="pointer-events-none absolute -bottom-6 -right-6 opacity-10"
        />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
          Current Balance
        </p>
        <p className="mt-3 font-mono text-4xl font-black tabular-nums">
          ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-2 text-xs font-medium text-white/80">
          Funds {Math.floor(balance / 500)} verifications
        </p>
        <Link
          to="/wallet"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-white/90"
        >
          Top Up Wallet <ArrowRight size={14} />
        </Link>
      </Panel>

      <Panel className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
            Recent Transactions
          </h3>
          <Link
            to="/wallet"
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dark"
          >
            View All →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-surface-border">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-4 py-3">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${
                  t.kind === 'credit'
                    ? 'bg-status-verified-bg text-status-verified'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {t.kind === 'credit' ? <ArrowUpRight size={16} /> : <FileSearch size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-primary">{t.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {t.date}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-mono text-sm font-black tabular-nums ${
                    t.kind === 'credit' ? 'text-status-verified' : 'text-ink-primary'
                  }`}
                >
                  {t.kind === 'credit' ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}
                </p>
                <span className="mt-0.5 inline-flex font-mono text-[9px] font-bold uppercase tracking-widest text-status-verified">
                  Success
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const isDemo = useAuthStore((s) => s.isDemo)
  const liveStats = trpc.dashboard.stats.useQuery(undefined, { enabled: !isDemo })
  const liveRecent = trpc.dashboard.recent.useQuery(undefined, { enabled: !isDemo })
  const liveActivity = trpc.dashboard.activity.useQuery(undefined, { enabled: !isDemo })

  const stats = isDemo ? demoStats : liveStats.data
  const recent = isDemo ? demoRecent : liveRecent.data
  const activity = isDemo ? demoActivity : liveActivity.data
  const statsLoading = !isDemo && liveStats.isLoading
  const recentLoading = !isDemo && liveRecent.isLoading
  const activityLoading = !isDemo && liveActivity.isLoading

  const totalVerified = stats?.totalVerified || 0
  const totalSuspicious = stats?.totalSuspicious || 0
  const totalFake = stats?.totalFake || 0
  const totalAll = totalVerified + totalSuspicious + totalFake
  const balance = parseFloat(user?.walletBalance || '0')

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-ink-primary md:text-4xl">
            Forensics Node
          </h1>
          <p className="mt-2 font-mono text-xs font-bold uppercase tracking-widest text-ink-muted">
            Identity verified:{' '}
            <span className="text-primary">
              {user?.fullName || user?.name || 'Operator'}
            </span>{' '}
            <span className="mx-1">⚡</span> System latency: 142ms
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/verify">
            <Button leftIcon={<Sparkles size={16} />}>New Scan</Button>
          </Link>
          <Link to="/bulk">
            <Button variant="outline" leftIcon={<Layers size={16} />}>
              Bulk Upload
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Wallet Balance"
              value={`₦${balance.toLocaleString('en-NG', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={Wallet}
              tone="accent"
            />
            <StatCard
              label="Total Verifications"
              value={totalAll}
              icon={FileSearch}
              tone="primary"
            />
            <StatCard
              label="Verified Count"
              value={totalVerified}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="Flagged Count"
              value={totalSuspicious + totalFake}
              icon={AlertTriangle}
              tone="warning"
            />
          </>
        )}
      </div>

      {/* Chart + Active jobs */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Panel className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
                Verification Activity
              </h3>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                Submissions over time
              </p>
            </div>
            <select className="cursor-pointer rounded-xl border border-surface-border bg-surface-elevated px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-secondary focus:border-primary focus:outline-none">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This quarter</option>
            </select>
          </div>
          <div className="p-6">
            {activityLoading ? (
              <div className="grid h-[260px] grid-cols-12 items-end gap-2">
                {[40, 65, 50, 80, 45, 70, 60, 85, 55, 75, 50, 90].map((h, i) => (
                  <Skeleton key={i} className="rounded-md" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <ActivityChart data={activity || []} />
            )}
          </div>
        </Panel>

        <ActiveJobs />
      </div>

      {/* Recent forensic logs */}
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-5">
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              Recent Forensic Logs
            </h3>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              Latest verifications across your workspace
            </p>
          </div>
          <Link
            to="/history"
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dark"
          >
            Full Archive →
          </Link>
        </div>

        {recentLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : recent && recent.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Certificate', 'Institution', 'Date', 'Score', 'Verdict', ''].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {recent.map((cert) => {
                    const score = cert.trustScore || 0
                    const scoreColor =
                      score >= 70
                        ? 'text-status-verified'
                        : score >= 40
                          ? 'text-status-suspicious'
                          : 'text-status-fake'
                    return (
                      <tr
                        key={cert.id}
                        className="transition-colors hover:bg-surface-elevated/30"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-ink-primary">
                            {cert.applicantName || 'Unnamed'}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                            {cert.certificateType}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-ink-secondary">
                          {cert.institutionName || '—'}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-ink-muted">
                          {cert.createdAt
                            ? new Date(cert.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td
                          className={`px-6 py-4 font-mono text-sm font-black tabular-nums ${scoreColor}`}
                        >
                          {score}
                        </td>
                        <td className="px-6 py-4">
                          <VerdictBadge verdict={cert.verdict} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/verification/${cert.publicId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-secondary transition-colors hover:border-primary hover:text-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-surface-border md:hidden">
              {recent.map((cert) => {
                const score = cert.trustScore || 0
                const scoreColor =
                  score >= 70
                    ? 'text-status-verified'
                    : score >= 40
                      ? 'text-status-suspicious'
                      : 'text-status-fake'
                return (
                  <Link
                    key={cert.id}
                    to={`/verification/${cert.publicId}`}
                    className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-elevated/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-bold text-ink-primary">
                          {cert.applicantName || 'Unnamed'}
                        </p>
                        <VerdictBadge verdict={cert.verdict} size="sm" />
                      </div>
                      <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        {cert.certificateType}
                        {cert.institutionName && ` · ${cert.institutionName}`}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-2xl font-black tabular-nums ${scoreColor}`}
                    >
                      {score}
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              No forensic logs yet
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              Run your first scan to populate the archive.
            </p>
            <Link to="/verify" className="mt-6 inline-block">
              <Button leftIcon={<Sparkles size={14} />}>Start First Scan</Button>
            </Link>
          </div>
        )}
      </Panel>

      <WalletSection balance={balance} />

      {/* Footer counter */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-surface-border pt-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Today's throughput:{' '}
          <Counter value={totalAll} className="font-black text-primary" />
        </p>
      </div>
    </div>
  )
}
