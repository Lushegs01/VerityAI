import { useParams } from 'react-router'
import { motion } from 'framer-motion'
import { ShieldCheck, Clock, Eye } from 'lucide-react'
import TrustScoreRing from '@/components/trust/TrustScoreRing'
import { trpc } from '@/providers/trpc'

export default function PublicBadge() {
  const { token } = useParams<{ token: string }>()
  const { data: badge, isLoading } = trpc.public.badge.useQuery(
    { token: token! },
    { enabled: !!token }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!badge) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
        <div className="text-center">
          <ShieldCheck size={48} className="text-ink-muted mx-auto mb-4" />
          <h1 className="font-display text-xl text-ink-primary mb-2">Badge Not Found</h1>
          <p className="text-sm text-ink-muted">This verification badge doesn't exist or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-base noise-overlay flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <span className="font-display font-bold text-ink-primary">Verity</span>
          </div>
          <p className="text-sm text-ink-muted">Verified Academic Credential</p>
        </div>

        {/* Badge Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          {/* Verdict banner */}
          <div className={`py-3 px-6 text-center ${
            badge.verdict === 'VERIFIED'
              ? 'bg-status-verified/10 border-b border-status-verified/20'
              : badge.verdict === 'SUSPICIOUS'
                ? 'bg-status-suspicious/10 border-b border-status-suspicious/20'
                : 'bg-status-fake/10 border-b border-status-fake/20'
          }`}>
            <span className={`text-sm font-bold uppercase tracking-wider ${
              badge.verdict === 'VERIFIED'
                ? 'text-status-verified'
                : badge.verdict === 'SUSPICIOUS'
                  ? 'text-status-suspicious'
                  : 'text-status-fake'
            }`}>
              {badge.verdict}
            </span>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <TrustScoreRing
                score={badge.trustScore || 0}
                verdict={badge.verdict || 'SUSPICIOUS'}
                size={160}
              />
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display text-xl text-ink-primary mb-1">
                {badge.applicantName}
              </h2>
              <p className="text-sm text-ink-muted">
                {badge.certificateType} - {badge.institutionName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <Clock size={14} className="text-ink-muted mx-auto mb-1" />
                <p className="text-[10px] text-ink-muted uppercase">Verified On</p>
                <p className="text-xs font-medium text-ink-primary">
                  {badge.verifiedAt ? new Date(badge.verifiedAt).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <Eye size={14} className="text-ink-muted mx-auto mb-1" />
                <p className="text-[10px] text-ink-muted uppercase">Views</p>
                <p className="text-xs font-medium text-ink-primary">{badge.viewCount || 0}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border">
              <p className="text-[10px] text-ink-muted text-center uppercase tracking-wider mb-1">
                This badge expires on
              </p>
              <p className="text-xs font-mono text-center text-ink-primary">
                {badge.expiresAt ? new Date(badge.expiresAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-surface-border text-center">
            <p className="text-[10px] text-ink-muted">
              Verified by Verity - Nigeria's AI Truth Engine for Academic Credentials
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
