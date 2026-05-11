import { motion } from 'framer-motion'
import { Link } from 'react-router'
import {
  ShieldCheck,
  AlertTriangle,
  Wallet,
  ArrowRight,
  Clock,
  FileSearch,
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import ActivityChart from '@/components/charts/ActivityChart'
import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  StatCard,
  VerdictBadge,
  Skeleton,
} from '@/components/ui-system'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery()
  const { data: recent, isLoading: recentLoading } = trpc.dashboard.recent.useQuery()
  const { data: activity, isLoading: activityLoading } = trpc.dashboard.activity.useQuery()

  const totalVerified = stats?.totalVerified || 0
  const totalSuspicious = stats?.totalSuspicious || 0
  const totalFake = stats?.totalFake || 0
  const totalAll = totalVerified + totalSuspicious + totalFake
  const balance = parseFloat(user?.walletBalance || '0')

  const planLimit = user?.plan === 'pro' ? 200 : user?.plan === 'enterprise' ? Infinity : 5
  const used = user?.verificationCount || 0
  const usagePercent = planLimit === Infinity ? 0 : Math.min((used / planLimit) * 100, 100)

  // Compute average trust score from recent verifications as a soft heuristic
  const avgTrust =
    recent && recent.length > 0
      ? Math.round(
          recent.reduce((sum, c) => sum + (c.trustScore || 0), 0) / recent.length,
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Here's how your verification workflow is performing today.
          </p>
        </div>
        <Link to="/verify" className="shrink-0">
          <Button size="lg" rightIcon={<ArrowRight size={16} />} leftIcon={<Sparkles size={15} />}>
            Start AI Verification
          </Button>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Verifications"
              value={totalAll}
              icon={FileSearch}
              tone="primary"
              hint={`${totalAll === 0 ? 'No' : totalAll} processed all-time`}
            />
            <StatCard
              label="Verified Documents"
              value={totalVerified}
              icon={ShieldCheck}
              tone="success"
              hint="Approved by AI engine"
            />
            <StatCard
              label="Flagged Submissions"
              value={totalSuspicious + totalFake}
              icon={AlertTriangle}
              tone="warning"
              hint={`${totalFake} likely fake, ${totalSuspicious} suspicious`}
            />
            <StatCard
              label="Wallet Balance"
              value={`N${balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              tone="accent"
              hint={`Funds ${Math.floor(balance / 500)} verifications`}
            />
          </>
        )}
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2 overflow-hidden">
          <PanelHeader>
            <div>
              <PanelTitle>Verification Activity</PanelTitle>
              <p className="mt-0.5 text-xs text-ink-muted">Submissions across the last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-status-verified/20 bg-status-verified/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-status-verified">
              <TrendingUp size={11} />
              Live
            </div>
          </PanelHeader>
          <PanelBody>
            {activityLoading ? (
              <Skeleton className="h-[260px]" />
            ) : (
              <ActivityChart data={activity || []} />
            )}
          </PanelBody>
        </Panel>

        <div className="space-y-4">
          {/* Trust score widget */}
          <Panel padded>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Average Trust Score
                </p>
                <p className="mt-2 font-mono text-3xl font-bold text-ink-primary">{avgTrust || '—'}</p>
                <p className="mt-1 text-xs text-ink-muted">Across recent verifications</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent-cyan/10 text-primary border border-primary/20">
                <Activity size={18} />
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${avgTrust}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${
                  avgTrust >= 80
                    ? 'bg-gradient-to-r from-status-verified to-accent-cyan'
                    : avgTrust >= 50
                      ? 'bg-gradient-to-r from-status-suspicious to-amber-400'
                      : avgTrust > 0
                        ? 'bg-gradient-to-r from-status-fake to-primary'
                        : 'bg-surface-border'
                }`}
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-ink-muted">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </Panel>

          {/* Quick actions */}
          <Panel padded>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Quick actions</p>
            <div className="mt-3 space-y-2">
              <Link
                to="/verify"
                className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 transition-colors hover:bg-primary/10"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <ShieldCheck size={15} />
                </span>
                <span className="flex-1 text-sm font-medium text-ink-primary">Run AI verification</span>
                <ArrowUpRight size={13} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                to="/wallet"
                className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 transition-colors hover:border-primary/20"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
                  <Wallet size={15} />
                </span>
                <span className="flex-1 text-sm font-medium text-ink-primary">Top up wallet</span>
                <ArrowUpRight size={13} className="text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                to="/history"
                className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated px-3 py-2.5 transition-colors hover:border-primary/20"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-emerald/15 text-accent-emerald">
                  <FileSearch size={15} />
                </span>
                <span className="flex-1 text-sm font-medium text-ink-primary">Export verification report</span>
                <ArrowUpRight size={13} className="text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>

            <div className="mt-5 border-t border-surface-border pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-secondary">Plan usage</span>
                <span className="font-mono text-ink-primary">
                  {used} / {planLimit === Infinity ? '∞' : planLimit}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-muted capitalize">
                {user?.plan || 'free'} plan
              </p>
            </div>
          </Panel>
        </div>
      </div>

      {/* Recent verifications */}
      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Recent Verifications</PanelTitle>
            <p className="mt-0.5 text-xs text-ink-muted">Latest submissions across your workspace</p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        </PanelHeader>

        <div className="divide-y divide-surface-border">
          {recentLoading ? (
            <div className="p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <Skeleton className="size-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recent && recent.length > 0 ? (
            recent.map((cert, i) => {
              const score = cert.trustScore || 0
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    to={`/verification/${cert.publicId}`}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-hover/60"
                  >
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                        score >= 80
                          ? 'bg-status-verified/10 text-status-verified ring-1 ring-status-verified/20'
                          : score >= 50
                            ? 'bg-status-suspicious/10 text-status-suspicious ring-1 ring-status-suspicious/20'
                            : 'bg-status-fake/10 text-status-fake ring-1 ring-status-fake/20'
                      }`}
                    >
                      {score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-primary">
                        {cert.applicantName || 'Unnamed applicant'}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        <span className="font-mono">{cert.publicId}</span>
                        <span className="mx-1.5">&middot;</span>
                        {cert.certificateType}
                        {cert.institutionName && <> &middot; {cert.institutionName}</>}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <VerdictBadge verdict={cert.verdict} size="sm" />
                      <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-muted">
                        <Clock size={10} />
                        {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <ArrowUpRight size={14} className="hidden text-ink-muted sm:block" />
                  </Link>
                </motion.div>
              )
            })
          ) : (
            <EmptyState
              icon={FileSearch}
              title="No verifications yet"
              description="Run your first AI verification to populate the activity feed and trust score."
              action={
                <Link to="/verify">
                  <Button leftIcon={<Sparkles size={14} />}>Start AI Verification</Button>
                </Link>
              }
            />
          )}
        </div>
      </Panel>
    </div>
  )
}

