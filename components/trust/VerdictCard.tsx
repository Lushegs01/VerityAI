import { motion } from 'framer-motion'
import { Copy, Download, Share2, Flag, FileSearch } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import TrustScoreRing from './TrustScoreRing'

interface Flag {
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
    aiFlags: Flag[] | string | null
    ruleScore: number | null
    imageQuality: string | null
    processingTimeMs: number | null
    createdAt: Date | string | null
  }
}

function normalizeFlags(value: Flag[] | string | null): Flag[] {
  if (Array.isArray(value)) return value
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as Flag[]) : []
  } catch {
    return []
  }
}

export default function VerdictCard({ certificate }: VerdictCardProps) {
  const [copied, setCopied] = useState(false)
  const [showAllFlags, setShowAllFlags] = useState(false)

  const flags = normalizeFlags(certificate.aiFlags)

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
      case 'CRITICAL': return 'text-status-fake bg-status-fake-bg border-status-fake/20'
      case 'HIGH': return 'text-orange-400 bg-orange-400/8 border-orange-400/20'
      case 'MEDIUM': return 'text-status-suspicious bg-status-suspicious-bg border-status-suspicious/20'
      default: return 'text-ink-muted bg-surface-hover border-surface-border'
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-status-verified'
    if (score >= 50) return 'text-status-suspicious'
    return 'text-status-fake'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-lg border border-surface-border bg-surface-card"
    >
      {/* Header: Trust Score + Basic Info */}
      <div className="p-6 border-b border-surface-border">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Trust Score Ring */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <TrustScoreRing
              score={certificate.trustScore || 0}
              verdict={certificate.verdict || 'SUSPICIOUS'}
              size={180}
            />
          </div>

          {/* Certificate Info */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-ink-muted font-mono">ID: {certificate.publicId}</span>
              <button
                onClick={copyId}
                className="p-1 rounded hover:bg-surface-hover transition-colors"
              >
                <Copy size={12} className={copied ? 'text-status-verified' : 'text-ink-muted'} />
              </button>
            </div>

            <h2 className="font-display text-xl text-ink-primary mb-3">
              {certificate.applicantName || 'Unknown Candidate'}
            </h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {certificate.institutionName && (
                <div>
                  <span className="text-ink-muted">Institution:</span>{' '}
                  <span className="text-ink-primary">{certificate.institutionName}</span>
                </div>
              )}
              {certificate.certificateType && (
                <div>
                  <span className="text-ink-muted">Type:</span>{' '}
                  <span className="text-ink-primary">{certificate.certificateType}</span>
                </div>
              )}
              {certificate.graduationYear && (
                <div>
                  <span className="text-ink-muted">Year:</span>{' '}
                  <span className="text-ink-primary">{certificate.graduationYear}</span>
                </div>
              )}
              {certificate.regNumber && (
                <div>
                  <span className="text-ink-muted">Reg No:</span>{' '}
                  <span className="font-mono text-ink-primary">{certificate.regNumber}</span>
                </div>
              )}
            </div>

            {/* AI Confidence */}
            <div className="mt-4 flex items-center gap-2">
              <FileSearch size={14} className="text-ink-muted" />
              <span className="text-xs text-ink-muted">
                AI Confidence: <span className="font-mono text-ink-primary">{certificate.aiConfidence}%</span>
              </span>
              {certificate.imageQuality && (
                <span className="text-xs text-ink-muted">
                  Quality: <span className="font-mono text-ink-primary">{certificate.imageQuality}</span>
                </span>
              )}
              {certificate.processingTimeMs && (
                <span className="text-xs text-ink-muted">
                  Time: <span className="font-mono text-ink-primary">{(certificate.processingTimeMs / 1000).toFixed(1)}s</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Scores */}
      <div className="p-6 border-b border-surface-border">
        <h3 className="text-sm font-semibold text-ink-primary mb-4 uppercase tracking-wider">
          AI Analysis Breakdown
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Visual Integrity', score: certificate.aiVisualIntegrity || 0 },
            { label: 'Data Plausibility', score: certificate.aiDataPlausibility || 0 },
            { label: 'Institution Match', score: certificate.aiInstitution || 0 },
            { label: 'Security Features', score: certificate.aiSecurityFeatures || 0 },
            { label: 'Anomaly Score', score: certificate.aiAnomaly || 0 },
            { label: 'Rule Engine', score: certificate.ruleScore || 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-ink-muted w-32 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    item.score >= 80
                      ? 'bg-gradient-to-r from-status-verified to-accent-cyan'
                      : item.score >= 50
                        ? 'bg-gradient-to-r from-status-suspicious to-orange-400'
                        : 'bg-gradient-to-r from-status-fake to-primary'
                  }`}
                />
              </div>
              <span className={`text-xs font-mono w-10 text-right ${scoreColor(item.score)}`}>
                {item.score}
              </span>
            </div>
          ))}
        </div>

        {/* AI Reasoning */}
        {certificate.aiReasoning && (
          <div className="mt-4 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">AI Reasoning</p>
            <p className="text-sm text-ink-primary italic leading-relaxed">
              {certificate.aiReasoning}
            </p>
          </div>
        )}
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider">
              Flags
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-fake/10 text-status-fake">
              {flags.length}
            </span>
          </div>
          <div className="space-y-2">
            {(showAllFlags ? flags : flags.slice(0, 3)).map((flag, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className={`rounded-lg border p-3 ${severityColor(flag.severity)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    flag.severity === 'CRITICAL'
                      ? 'bg-status-fake/20 text-status-fake'
                      : flag.severity === 'HIGH'
                        ? 'bg-orange-400/20 text-orange-400'
                        : flag.severity === 'MEDIUM'
                          ? 'bg-status-suspicious/20 text-status-suspicious'
                          : 'bg-surface-hover text-ink-muted'
                  }`}>
                    {flag.severity}
                  </span>
                  <span className="text-xs font-medium opacity-80">{flag.type}</span>
                </div>
                <p className="text-sm opacity-90">{flag.description}</p>
              </motion.div>
            ))}
            {flags.length > 3 && (
              <button
                onClick={() => setShowAllFlags(!showAllFlags)}
                className="text-xs text-primary hover:underline"
              >
                {showAllFlags ? 'Show less' : `Show ${flags.length - 3} more flags`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-2">
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Download size={15} />
          Download Report
        </button>
        <button
          onClick={() => {
            void shareReport()
          }}
          className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-hover"
        >
          <Share2 size={15} />
          Share
        </button>
        <button
          onClick={() => toast('Dispute request noted for manual review')}
          className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover"
        >
          <Flag size={15} />
          Dispute
        </button>
      </div>
    </motion.div>
  )
}
