import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  Check,
  Lock,
  CreditCard,
  Brain,
  Activity,
  ScanLine,
} from 'lucide-react'
import toast from 'react-hot-toast'
import DropZone from '@/components/upload/DropZone'
import VerdictCard from '@/components/trust/VerdictCard'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../api/router'
import {
  Button,
  Field,
  Select,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Stepper,
  Badge,
} from '@/components/ui-system'

type VerificationResult = inferRouterOutputs<AppRouter>['verification']['process']
type CertificateType =
  | 'WAEC'
  | 'NECO'
  | 'NABTEB'
  | 'BSc'
  | 'BA'
  | 'HND'
  | 'OND'
  | 'NYSC'
  | 'ICAN'
  | 'other'

const VERIFICATION_COST = 500

const aiStages = [
  { label: 'Extracting document text…', icon: FileText },
  { label: 'Checking identity consistency…', icon: ShieldCheck },
  { label: 'Detecting anomalies…', icon: Activity },
  { label: 'Generating trust score…', icon: Sparkles },
  { label: 'Finalizing verification…', icon: Check },
] as const

const steps = [
  { id: 'profile', label: 'Profile', description: 'Optional details' },
  { id: 'upload', label: 'Document', description: 'Drag & drop' },
  { id: 'payment', label: 'Payment', description: 'Squad-secured' },
  { id: 'scan', label: 'AI Scan', description: 'Forensic analysis' },
  { id: 'result', label: 'Result', description: 'Trust score' },
]

type Stage = 'idle' | 'uploaded' | 'processing' | 'result'

export default function Verify() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [certificateType, setCertificateType] = useState<CertificateType | ''>('')
  const [applicantName, setApplicantName] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [processingStageIdx, setProcessingStageIdx] = useState(0)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const utils = trpc.useUtils()

  const balance = parseFloat(user?.walletBalance || '0')
  const canVerify = balance >= VERIFICATION_COST

  const currentStep = useMemo(() => {
    if (stage === 'result') return 4
    if (stage === 'processing') return 3
    if (file && canVerify) return 2
    if (file) return 1
    return 0
  }, [stage, file, canVerify])

  const processMutation = trpc.verification.process.useMutation({
    onSuccess: async (data) => {
      setResult(data)
      setStage('result')
      await Promise.all([
        utils.auth.me.invalidate(),
        utils.dashboard.stats.invalidate(),
        utils.dashboard.recent.invalidate(),
        utils.dashboard.activity.invalidate(),
        utils.wallet.balance.invalidate(),
        utils.wallet.transactions.invalidate(),
        utils.verification.history.invalidate(),
      ])
    },
    onError: (err) => {
      toast.error(err.message)
      setStage(file ? 'uploaded' : 'idle')
    },
  })

  const onFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setStage('uploaded')
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleVerify = async () => {
    if (!file || !canVerify) return

    setStage('processing')
    setProcessingStageIdx(0)

    let idx = 0
    const stageInterval = setInterval(() => {
      idx = Math.min(idx + 1, aiStages.length - 1)
      setProcessingStageIdx(idx)
    }, 1700)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      processMutation.mutate({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
        certificateType: certificateType || undefined,
        applicantName: applicantName || undefined,
      })
    }
    reader.onerror = () => {
      clearInterval(stageInterval)
      toast.error('Could not read the selected file')
      setStage('uploaded')
    }
    reader.readAsDataURL(file)

    setTimeout(() => clearInterval(stageInterval), 12000)
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setStage('idle')
    setResult(null)
    setCertificateType('')
    setApplicantName('')
    setProcessingStageIdx(0)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          <Sparkles size={11} /> AI Verification
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
          Start AI Verification
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Upload any document for AI-powered forensic verification. Result returns in under 15 seconds.
        </p>
      </motion.div>

      {/* Stepper */}
      <Panel padded>
        <Stepper steps={steps} currentIndex={currentStep} />
      </Panel>

      {/* Wallet warning */}
      {!canVerify && stage !== 'processing' && stage !== 'result' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-status-fake/30 bg-status-fake/5 p-4"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-status-fake" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-primary">Insufficient wallet balance</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Verifications cost N{VERIFICATION_COST}. Top up your wallet to continue.
            </p>
          </div>
          <Link to="/wallet">
            <Button variant="danger" size="sm">
              Top up
            </Button>
          </Link>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {(stage === 'idle' || stage === 'uploaded') && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-6 lg:grid-cols-[1.05fr_1fr]"
          >
            {/* LEFT — upload / file */}
            <div className="space-y-4">
              {!file ? (
                <DropZone onFileSelect={onFileSelect} />
              ) : (
                <Panel className="overflow-hidden">
                  <PanelHeader>
                    <PanelTitle>Document attached</PanelTitle>
                    <button
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl)
                        setFile(null)
                        setPreviewUrl(null)
                        setStage('idle')
                      }}
                      className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </PanelHeader>
                  <PanelBody className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                    <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface-elevated">
                      {previewUrl && file.type.startsWith('image/') ? (
                        <img src={previewUrl} alt="Preview" className="size-full object-cover" />
                      ) : (
                        <FileText size={28} className="text-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-primary">{file.name}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {(file.size / 1024 / 1024).toFixed(2)} MB &middot;{' '}
                        {file.type.startsWith('image/') ? 'Image' : 'PDF'}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Badge tone="success" size="sm" dot>
                          Encrypted
                        </Badge>
                        <Badge tone="info" size="sm">
                          Ready for AI scan
                        </Badge>
                      </div>
                    </div>
                  </PanelBody>
                </Panel>
              )}

              {/* Profile details */}
              <Panel>
                <PanelHeader>
                  <div>
                    <PanelTitle>Applicant Details</PanelTitle>
                    <p className="mt-0.5 text-xs text-ink-muted">Optional — improves AI accuracy</p>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                    Step 1 / 5
                  </span>
                </PanelHeader>
                <PanelBody>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Applicant Name"
                      placeholder="e.g. Adebayo Adeniran"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                    />
                    <Select
                      label="Certificate Type"
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value as CertificateType | '')}
                    >
                      <option value="">Select type...</option>
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                      <option value="NABTEB">NABTEB</option>
                      <option value="BSc">BSc</option>
                      <option value="BA">BA</option>
                      <option value="HND">HND</option>
                      <option value="OND">OND</option>
                      <option value="NYSC">NYSC</option>
                      <option value="ICAN">ICAN</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                </PanelBody>
              </Panel>
            </div>

            {/* RIGHT — payment + start */}
            <div className="space-y-4">
              <Panel>
                <PanelHeader>
                  <div>
                    <PanelTitle>Payment Summary</PanelTitle>
                    <p className="mt-0.5 text-xs text-ink-muted">Verification fee, secured by Squad</p>
                  </div>
                  <CreditCard size={16} className="text-ink-muted" />
                </PanelHeader>
                <PanelBody>
                  <dl className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <dt className="text-ink-muted">Verification fee</dt>
                      <dd className="font-mono text-ink-primary">N{VERIFICATION_COST.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <dt className="text-ink-muted">Processing</dt>
                      <dd className="font-mono text-ink-primary">N0.00</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-surface-border pt-2.5 text-sm">
                      <dt className="font-semibold text-ink-primary">Total</dt>
                      <dd className="font-mono text-lg font-bold text-ink-primary">
                        N{VERIFICATION_COST.toFixed(2)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-xl border border-surface-border bg-surface-elevated/50 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <Lock size={11} /> Wallet
                      </span>
                      <span className="font-mono text-ink-primary">
                        N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-ink-muted">After verification</span>
                      <span
                        className={`font-mono ${
                          canVerify ? 'text-status-verified' : 'text-status-fake'
                        }`}
                      >
                        N
                        {Math.max(0, balance - VERIFICATION_COST).toLocaleString('en-NG', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-5"
                    onClick={handleVerify}
                    disabled={!file || !canVerify}
                    leftIcon={<Sparkles size={15} />}
                    rightIcon={<ArrowRight size={15} />}
                  >
                    {file ? 'Confirm Payment & Verify' : 'Upload a document to continue'}
                  </Button>

                  <p className="mt-3 text-center text-[11px] text-ink-muted">
                    Secured by <span className="text-ink-primary">Squad</span> &middot; refundable on failure
                  </p>
                </PanelBody>
              </Panel>

              <Panel padded className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  What we check
                </p>
                {[
                  { icon: ScanLine, label: 'Visual integrity & typography' },
                  { icon: Brain, label: 'Data plausibility & consistency' },
                  { icon: Activity, label: 'Anomaly & forgery detection' },
                  { icon: ShieldCheck, label: 'Institutional & seal verification' },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5 text-xs text-ink-secondary">
                    <c.icon size={14} className="text-primary" />
                    {c.label}
                  </div>
                ))}
              </Panel>
            </div>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Panel className="overflow-hidden">
              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.2fr] lg:p-8">
                {/* Scanning visual */}
                <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-surface-border bg-surface-elevated p-8 min-h-[280px]">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" aria-hidden />
                  <motion.div
                    className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/30 to-transparent"
                    animate={{ y: ['0%', '600%', '0%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    {previewUrl && file?.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Scanning"
                        className="size-32 rounded-xl object-cover ring-2 ring-primary/30 shadow-glow"
                      />
                    ) : (
                      <div className="flex size-32 items-center justify-center rounded-xl bg-surface-card ring-2 ring-primary/30 shadow-glow">
                        <FileText size={42} className="text-primary" />
                      </div>
                    )}
                    <p className="font-mono text-[11px] text-primary">SCANNING…</p>
                  </div>
                </div>

                {/* AI stages */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent-cyan/10 ring-1 ring-primary/30">
                      <Brain size={18} className="text-primary" />
                      <motion.span
                        className="absolute inset-0 rounded-xl ring-2 ring-primary/40"
                        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        VerityAI Forensics
                      </p>
                      <p className="font-display text-lg font-bold text-ink-primary">Analyzing document…</p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2">
                    {aiStages.map((s, i) => {
                      const done = i < processingStageIdx
                      const active = i === processingStageIdx
                      return (
                        <motion.li
                          key={s.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                            active
                              ? 'border-primary/30 bg-primary/10'
                              : done
                                ? 'border-status-verified/20 bg-status-verified/5'
                                : 'border-surface-border bg-surface-elevated/40'
                          }`}
                        >
                          <div
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                              done
                                ? 'bg-status-verified/15 text-status-verified ring-1 ring-status-verified/30'
                                : active
                                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                                  : 'bg-surface-elevated text-ink-muted'
                            }`}
                          >
                            {done ? (
                              <Check size={13} strokeWidth={3} />
                            ) : active ? (
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                              >
                                <s.icon size={13} />
                              </motion.span>
                            ) : (
                              <s.icon size={13} />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              active
                                ? 'text-ink-primary'
                                : done
                                  ? 'text-ink-primary'
                                  : 'text-ink-muted'
                            }`}
                          >
                            {s.label}
                          </span>
                          {active && (
                            <span className="ml-auto inline-flex h-1.5 items-center gap-0.5">
                              {[0, 1, 2].map((d) => (
                                <motion.span
                                  key={d}
                                  className="size-1 rounded-full bg-primary"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: d * 0.18,
                                  }}
                                />
                              ))}
                            </span>
                          )}
                        </motion.li>
                      )
                    })}
                  </ul>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-surface-border bg-surface-elevated/40 px-3 py-2.5 text-xs">
                    <span className="text-ink-muted">Typical processing time</span>
                    <span className="font-mono text-ink-primary">10 – 15s</span>
                  </div>
                </div>
              </div>
            </Panel>
          </motion.div>
        )}

        {stage === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <VerdictCard certificate={result} />
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={reset} leftIcon={<Sparkles size={14} />}>
                Verify Another
              </Button>
              <Link to="/history">
                <Button variant="ghost" rightIcon={<ArrowRight size={14} />}>
                  View History
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
