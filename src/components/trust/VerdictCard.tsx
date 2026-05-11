import { motion } from 'framer-motion'
import {
  Copy,
  Download,
  Share2,
  Flag,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import TrustScoreRing from './TrustScoreRing'
import { Badge, Button, Panel, PanelBody, PanelHeader, PanelTitle } from '@/components/ui-system'

interface FlagItem {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  field: string
  description: string
}

interface VerdictCardProps {
  certificate: {
    publicId: string
    trustScore: number | null
    verdict: string | null
    applicantName: string | null
    institutionName: string | null
    certificateType: string | null
    graduationYear: number | null
    regNumber: string | null
    aiVisualIntegrity: number | null
    aiDataPlausibility: number | null
    aiAnomaly: number | null
    aiInstitution: number | null
    aiSecurityFeatures: number | null
    aiConfidence: number | null
    aiVerdict: string | null
    aiReasoning: string | null
    aiFlags: FlagItem[] | string | null
    ruleScore: number | null
    imageQuality: string | null
    processingTimeMs: number | null
    createdAt: Date | string | null
  }
}

function normalizeFlags(value: FlagItem[] | string | null): FlagItem[] {
  if (Array.isArray(value)) return value
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as FlagItem[]) : []
  } catch {
    return []
  }
}

const verdictMeta: Record<
  string,
  { tone: 'verified' | 'suspicious' | 'fake'; title: string; icon: typeof ShieldCheck; recommend: string; risk: string }
> = {
  VERIFIED: {
    tone: 'verified',
    title: 'Document Verified',
    icon: ShieldCheck,
    recommend: 'Approve',
    risk: 'Low',
  },
  SUSPICIOUS: {
    tone: 'suspicious',
    title: 'Manual Review Recommended',
    icon: AlertTriangle,
    recommend: 'Request Review',
    risk: 'Medium',
  },
  LIKELY_FAKE: {
    tone: 'fake',
    title: 'Likely Forgery Detected',
    icon: XCircle,
    recommend: 'Reject',
    risk: 'High',
  },
}

export default function VerdictCard({ certificate }: VerdictCardProps) {
  const [copied, setCopied] = useState(false)
  const [showAllFlags, setShowAllFlags] = useState(false)

  const flags = normalizeFlags(certificate.aiFlags)
  const meta = verdictMeta[certificate.verdict || ''] || verdictMeta.SUSPICIOUS
  const VerdictIcon = meta.icon

  const copyId = () => {
    navigator.clipboard.writeText(certificate.publicId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(certificate, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${certificate.publicId}-report.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareReport = async () => {
    const url = `${window.location.origin}/verification/${certificate.publicId}`
    if (navigator.share) {
      await navigator.share({
        title: `Verification ${certificate.publicId}`,
        text: `${certificate.applicantName || 'Certificate'} verification result`,
        url,
      })
      return
    }

    await navigator.clipboard.writeText(url)
    toast.success('Report link copied')
  }

  const severityColor = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'border-status-fake/30 bg-status-fake/8'
      case 'HIGH':
        return 'border-status-fake/25 bg-status-fake/5'
      case 'MEDIUM':
        return 'border-status-suspicious/25 bg-status-suspicious/5'
      default:
        return 'border-surface-border bg-surface-elevated'
    }
  }

  const severityBadgeTone = (s: string): 'danger' | 'warning' | 'neutral' => {
    if (s === 'CRITICAL' || s === 'HIGH') return 'danger'
    if (s === 'MEDIUM') return 'warning'
    return 'neutral'
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-status-verified'
    if (score >= 50) return 'text-status-suspicious'
    return 'text-status-fake'
  }

  return (
    <div className="space-y-4">
      {/* Top: Trust score + summary */}
      <Panel className="overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr] lg:p-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface-elevated/40 p-5">
            <TrustScoreRing
              score={certificate.trustScore || 0}
              verdict={certificate.verdict || 'SUSPICIOUS'}
              size={180}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                    ID: {certificate.publicId}
                  </span>
                  <button
                    onClick={copyId}
                    className="rounded-md p-1 transition-colors hover:bg-surface-hover"
                    aria-label="Copy ID"
                  >
                    {copied ? (
                      <CheckCircle2 size={11} className="text-status-verified" />
                    ) : (
                      <Copy size={11} className="text-ink-muted" />
                    )}
                  </button>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-primary truncate">
                  {certificate.applicantName || 'Unknown Applicant'}
                </h2>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {certificate.certificateType}
                  {certificate.institutionName && <> &middot; {certificate.institutionName}</>}
                </p>
              </div>
              <Badge tone={meta.tone} dot>
                <VerdictIcon size={11} />
                {certificate.verdict?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Trust Score" value={`${certificate.trustScore || 0}%`} highlight={meta.tone} />
              <Stat label="Risk Level" value={meta.risk} highlight={meta.tone} />
              <Stat
                label="AI Confidence"
                value={`${certificate.aiConfidence ?? 0}%`}
              />
              <Stat
                label="Processing"
                value={
                  certificate.processingTimeMs
                    ? `${(certificate.processingTimeMs / 1000).toFixed(1)}s`
                    : '—'
                }
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              {certificate.graduationYear && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Year</p>
                  <p className="text-ink-primary">{certificate.graduationYear}</p>
                </div>
              )}
              {certificate.regNumber && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Reg No</p>
                  <p className="font-mono text-ink-primary">{certificate.regNumber}</p>
                </div>
              )}
              {certificate.imageQuality && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Quality</p>
                  <p className="text-ink-primary capitalize">{certificate.imageQuality}</p>
                </div>
              )}
              {certificate.createdAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">Verified</p>
                  <p className="text-ink-primary">
                    {new Date(certificate.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* AI Findings */}
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>AI Findings</PanelTitle>
            <p className="mt-0.5 text-xs text-ink-muted">Score breakdown across forensic checks</p>
          </div>
          <Sparkles size={14} className="text-primary" />
        </PanelHeader>
        <PanelBody className="space-y-3">
          {[
            { label: 'Visual Integrity', score: certificate.aiVisualIntegrity || 0 },
            { label: 'Data Plausibility', score: certificate.aiDataPlausibility || 0 },
            { label: 'Institution Match', score: certificate.aiInstitution || 0 },
            { label: 'Security Features', score: certificate.aiSecurityFeatures || 0 },
            { label: 'Anomaly Score', score: certificate.aiAnomaly || 0 },
            { label: 'Rule Engine', score: certificate.ruleScore || 0 },
          ].map((item, i) => (
            <div key={item.label} className="grid grid-cols-[140px_1fr_56px] items-center gap-3">
              <span className="text-xs font-medium text-ink-secondary truncate">{item.label}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.05 }}
                  className={`h-full rounded-full ${
                    item.score >= 80
                      ? 'bg-gradient-to-r from-status-verified to-accent-cyan'
                      : item.score >= 50
                        ? 'bg-gradient-to-r from-status-suspicious to-amber-400'
                        : 'bg-gradient-to-r from-status-fake to-rose-500'
                  }`}
                />
              </div>
              <span className={`text-right font-mono text-xs font-semibold ${scoreColor(item.score)}`}>
                {item.score}
              </span>
            </div>
          ))}

          {certificate.aiReasoning && (
            <div className="mt-5 rounded-xl border border-surface-border bg-surface-elevated/40 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                AI Reasoning
              </p>
              <p className="text-sm leading-relaxed text-ink-primary">{certificate.aiReasoning}</p>
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Flags */}
      {flags.length > 0 && (
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <PanelTitle>Risk Flags</PanelTitle>
              <Badge tone="danger" size="sm">
                {flags.length}
              </Badge>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              Auto-detected
            </span>
          </PanelHeader>
          <PanelBody className="space-y-2">
            {(showAllFlags ? flags : flags.slice(0, 3)).map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`rounded-xl border p-3.5 ${severityColor(flag.severity)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={severityBadgeTone(flag.severity)} size="sm">
                    {flag.severity}
                  </Badge>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                    {flag.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-primary">{flag.description}</p>
              </motion.div>
            ))}
            {flags.length > 3 && (
              <button
                onClick={() => setShowAllFlags(!showAllFlags)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showAllFlags ? 'Show less' : `Show ${flags.length - 3} more flags`}
              </button>
            )}
          </PanelBody>
        </Panel>
      )}

      {/* Recommendation + actions */}
      <Panel>
        <PanelHeader>
          <PanelTitle>Admin Recommendation</PanelTitle>
          <Badge tone={meta.tone} dot>
            {meta.recommend}
          </Badge>
        </PanelHeader>
        <PanelBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-secondary">
            Based on the trust score and detected flags, Verity suggests:{' '}
            <span className="font-semibold text-ink-primary">{meta.recommend}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadReport} leftIcon={<Download size={14} />}>
              Export Verification Report
            </Button>
            <Button variant="secondary" onClick={() => void shareReport()} leftIcon={<Share2 size={14} />}>
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast('Dispute request noted for manual review')}
              leftIcon={<Flag size={14} />}
            >
              Dispute
            </Button>
          </div>
        </PanelBody>
      </Panel>
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: 'verified' | 'suspicious' | 'fake'
}) {
  const tone =
    highlight === 'verified'
      ? 'text-status-verified'
      : highlight === 'suspicious'
        ? 'text-status-suspicious'
        : highlight === 'fake'
          ? 'text-status-fake'
          : 'text-ink-primary'
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className={`mt-1 font-mono text-base font-bold ${tone}`}>{value}</p>
    </div>
  )
}

