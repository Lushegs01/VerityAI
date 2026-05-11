import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Flag,
  RotateCcw,
  Share2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TrustScoreRing from './TrustScoreRing'
import ForensicBar from './ForensicBar'
import { Badge, Button, Panel } from '@/components/ui-system'
import { cn } from '@/lib/utils'

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

function verdictWord(score: number): string {
  if (score >= 70) return 'Authentic.'
  if (score >= 40) return 'Suspicious.'
  return 'Likely Fake.'
}

function verdictTone(score: number): 'verified' | 'suspicious' | 'fake' {
  if (score >= 70) return 'verified'
  if (score >= 40) return 'suspicious'
  return 'fake'
}

const TEXT_COLOR: Record<'verified' | 'suspicious' | 'fake', string> = {
  verified: 'text-status-verified',
  suspicious: 'text-status-suspicious',
  fake: 'text-status-fake',
}

export default function VerdictCard({ certificate }: VerdictCardProps) {
  const [copied, setCopied] = useState(false)

  const score = certificate.trustScore || 0
  const tone = verdictTone(score)
  const word = verdictWord(score)
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

  const extracted = [
    { label: 'Applicant', value: certificate.applicantName || '—' },
    { label: 'Certificate', value: certificate.certificateType || '—' },
    {
      label: 'Institution',
      value: certificate.institutionName || '—',
      verified: !!certificate.institutionName,
    },
    { label: 'Graduation Year', value: certificate.graduationYear?.toString() || '—' },
    { label: 'Reg Number', value: certificate.regNumber || '—', mono: true },
    {
      label: 'Image Quality',
      value: certificate.imageQuality ? certificate.imageQuality.toUpperCase() : '—',
    },
  ]

  return (
    <div className="space-y-10">
      {/* Hero Result Header */}
      <div className="grid gap-10 lg:grid-cols-3">
        <Panel
          className={cn(
            'p-10 lg:col-span-2 bg-gradient-to-br from-surface-card to-status-verified/5',
            tone === 'suspicious' && 'bg-gradient-to-br from-surface-card to-status-suspicious/5',
            tone === 'fake' && 'bg-gradient-to-br from-surface-card to-status-fake/5',
          )}
        >
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
            <TrustScoreRing score={score} size={240} />
            <div className="flex-1 text-center md:text-left">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-muted">
                Forensic Outcome
              </p>
              <h2
                className={cn(
                  'mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl',
                  TEXT_COLOR[tone],
                )}
              >
                {word}
              </h2>
              <div className="mt-3 inline-flex">
                <Badge variant={tone} size="md" dot className="text-xs">
                  {certificate.verdict?.replace('_', ' ') || word.replace('.', '')}
                </Badge>
              </div>

              <button
                onClick={copyId}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-elevated px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-secondary transition-colors hover:text-ink-primary"
              >
                Node ID: {certificate.publicId}
                {copied ? (
                  <CheckCircle2 size={12} className="text-status-verified" />
                ) : (
                  <Copy size={12} className="text-ink-muted" />
                )}
              </button>

              {certificate.aiReasoning && (
                <p className="mt-5 max-w-prose text-sm font-medium leading-relaxed text-ink-secondary">
                  {certificate.aiReasoning}
                </p>
              )}
            </div>
          </div>
        </Panel>

        <Panel className="border-primary/20 bg-primary/5 p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            Actions
          </p>
          <div className="mt-6 space-y-3">
            <Button fullWidth onClick={downloadReport} leftIcon={<Download size={16} />}>
              Download PDF
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => void shareReport()}
              leftIcon={<Share2 size={16} />}
            >
              Share Badge
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => toast('Dispute request submitted for manual review')}
              leftIcon={<Flag size={16} />}
            >
              Dispute Verdict
            </Button>
          </div>
          <a
            href="/verify"
            className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dark"
          >
            <RotateCcw size={12} /> Start New Analysis
          </a>
        </Panel>
      </div>

      {/* Detail Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Extracted info */}
        <Panel className="overflow-hidden">
          <div className="border-b border-surface-border px-6 py-5">
            <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              Extracted Information
            </h3>
          </div>
          <div className="divide-y divide-surface-border">
            {extracted.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 p-6"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  {row.label}
                </span>
                <div className="flex items-center gap-2 text-right">
                  <span
                    className={cn(
                      'text-sm font-bold text-ink-primary',
                      row.mono && 'font-mono uppercase tracking-widest',
                    )}
                  >
                    {row.value}
                  </span>
                  {row.verified && (
                    <Badge variant="verified" size="sm" className="text-[9px]">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Forensic Analysis */}
        <div className="space-y-8">
          <Panel className="p-6">
            <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              Forensic Analysis
            </h3>
            <div className="mt-6 space-y-5">
              <ForensicBar label="Visual Integrity" score={certificate.aiVisualIntegrity || 0} delay={0.1} />
              <ForensicBar label="Data Plausibility" score={certificate.aiDataPlausibility || 0} delay={0.2} />
              <ForensicBar label="Institution Recognition" score={certificate.aiInstitution || 0} delay={0.3} />
              <ForensicBar label="Anomaly Detection" score={certificate.aiAnomaly || 0} delay={0.4} />
              <ForensicBar label="Security Features" score={certificate.aiSecurityFeatures || 0} delay={0.5} />
            </div>

            {certificate.aiReasoning && (
              <div className="mt-6 border-l-2 border-primary/30 pl-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  AI Reasoning
                </p>
                <p className="mt-2 italic text-sm leading-relaxed text-ink-secondary">
                  &ldquo;{certificate.aiReasoning}&rdquo;
                </p>
              </div>
            )}
          </Panel>

          {flags.length > 0 && (
            <Panel className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
                  Forensic Flags
                </h3>
                <Badge tone="warning" size="sm">
                  {flags.length}
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-2xl border border-status-suspicious/20 bg-status-suspicious-bg/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-status-suspicious-bg text-status-suspicious">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-status-suspicious">
                            {flag.type}
                          </p>
                          <Badge variant="suspicious" size="sm" className="text-[9px]">
                            {flag.severity}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-bold text-ink-primary">{flag.field}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                          {flag.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Footer receipt */}
      <div className="flex flex-col items-center gap-4 border-t border-surface-border pt-8 text-center">
        <p className="font-display text-2xl font-black tabular-nums text-ink-primary">
          ₦500.00 <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Deducted</span>
        </p>
        <span className="inline-flex rounded-full border border-surface-border bg-surface-elevated px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Ref · {certificate.publicId}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-verified opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-status-verified" />
            </span>
            Squad API: Connected
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
            <CheckCircle2 size={12} />
            AI Engine: Optimal
          </div>
        </div>
      </div>
    </div>
  )
}
