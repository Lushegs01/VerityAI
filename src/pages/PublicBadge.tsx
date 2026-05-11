import { useParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  Eye,
  Lock,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import TrustScoreRing from '@/components/trust/TrustScoreRing'
import { trpc } from '@/providers/trpc'
import { Button, EmptyState } from '@/components/ui-system'

export default function PublicBadge() {
  const { token } = useParams<{ token: string }>()
  const { data: badge, isLoading } = trpc.public.badge.useQuery(
    { token: token! },
    { enabled: !!token },
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!badge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
        <EmptyState
          icon={ShieldCheck}
          title="Badge not found"
          description="This verification badge doesn't exist or has expired."
          action={
            <Link to="/">
              <Button variant="secondary" rightIcon={<ArrowRight size={14} />}>
                Visit VerityAI
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const verdict = badge.verdict || 'SUSPICIOUS'

  return (
    <div className="relative min-h-screen bg-surface-base px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.4]" aria-hidden />
      <div className="absolute left-1/2 top-1/3 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5 group">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-600 to-accent-cyan shadow-glow">
            <ShieldCheck className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-ink-primary">
            VerityAI
          </span>
        </Link>

        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Public verification badge
        </p>

        <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-2xl">
          <div
            className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] ${
              verdict === 'VERIFIED'
                ? 'bg-status-verified/10 text-status-verified border-b border-status-verified/25'
                : verdict === 'SUSPICIOUS'
                  ? 'bg-status-suspicious/10 text-status-suspicious border-b border-status-suspicious/25'
                  : 'bg-status-fake/10 text-status-fake border-b border-status-fake/25'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${
                  verdict === 'VERIFIED'
                    ? 'bg-status-verified animate-pulse'
                    : verdict === 'SUSPICIOUS'
                      ? 'bg-status-suspicious'
                      : 'bg-status-fake'
                }`}
              />
              {verdict.replace('_', ' ')}
            </span>
          </div>

          <div className="p-7">
            <div className="flex justify-center">
              <TrustScoreRing
                score={badge.trustScore || 0}
                verdict={verdict}
                size={160}
              />
            </div>

            <div className="mt-6 text-center">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink-primary">
                {badge.applicantName}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {badge.certificateType}
                {badge.institutionName && <> &middot; {badge.institutionName}</>}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-3 text-center">
                <Clock size={13} className="mx-auto text-ink-muted" />
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Verified on
                </p>
                <p className="mt-0.5 text-xs font-semibold text-ink-primary">
                  {badge.verifiedAt
                    ? new Date(badge.verifiedAt).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-3 text-center">
                <Eye size={13} className="mx-auto text-ink-muted" />
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Public views
                </p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-ink-primary">
                  {badge.viewCount || 0}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-surface-border bg-surface-elevated/60 p-3">
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Badge expires
              </p>
              <p className="mt-1 text-center font-mono text-xs font-semibold text-ink-primary">
                {badge.expiresAt
                  ? new Date(badge.expiresAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-surface-border bg-surface-elevated/40 px-6 py-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-ink-muted">
              <Lock size={11} /> Verified by VerityAI
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Learn more
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          This badge is generated by VerityAI's institutional trust engine.
        </p>
      </motion.div>
    </div>
  )
}
