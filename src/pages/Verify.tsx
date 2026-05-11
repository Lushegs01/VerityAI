import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import DropZone from '@/components/upload/DropZone'
import VerdictCard from '@/components/trust/VerdictCard'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '../../api/router'
import { Badge, Button, Field, Select } from '@/components/ui-system'
import { cn } from '@/lib/utils'

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
  { label: 'Extracting document text', icon: FileText },
  { label: 'Checking identity consistency', icon: ShieldCheck },
  { label: 'Detecting anomalies', icon: Activity },
  { label: 'Generating trust score', icon: Sparkles },
  { label: 'Finalizing verification', icon: Check },
] as const

type Stage = 'idle' | 'uploaded' | 'processing' | 'result'

function PhaseLabel({ label, hint, color = 'primary' }: { label: string; hint: string; color?: 'primary' | 'cyan' }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface-elevated px-4 py-3 border border-surface-border">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
          color === 'primary' ? 'text-primary' : 'text-accent-cyan',
        )}
      >
        {hint}
      </span>
    </div>
  )
}

function ProcessingModal({
  file,
  currentStep,
}: {
  file: File | null
  currentStep: number
}) {
  const progress = Math.min(100, ((currentStep + 1) / aiStages.length) * 100)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-surface-base/90 px-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-8 shadow-2xl"
      >
        {/* Progress bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-surface-elevated">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-primary to-primary-light"
          />
        </div>

        {/* Scanner line */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ boxShadow: '0 0 20px rgba(5,150,105,0.5)' }}
        />

        <div className="flex flex-col items-center text-center">
          <div className="relative flex size-24 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
          <h2 className="mt-6 font-display text-xl font-black uppercase tracking-tight text-ink-primary">
            Analyzing Credential
          </h2>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Verity Forensic Engine Node #842 Active
          </p>
          {file && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-muted truncate max-w-full">
              {file.name}
            </p>
          )}
        </div>

        <ul className="mt-8 space-y-2">
          {aiStages.map((s, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <li
                key={s.label}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-4 transition-colors',
                  active && 'border-primary/30 bg-primary/5',
                  done && 'border-surface-border bg-surface-elevated text-ink-muted',
                  !active && !done && 'border-transparent text-ink-muted/60',
                )}
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    done && 'bg-status-verified-bg text-status-verified',
                    active && 'bg-primary/15 text-primary',
                    !active && !done && 'bg-surface-elevated text-ink-muted/60',
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={14} strokeWidth={3} />
                  ) : active ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    >
                      <s.icon size={14} />
                    </motion.span>
                  ) : (
                    <s.icon size={14} />
                  )}
                </div>
                <span
                  className={cn(
                    'flex-1 text-sm font-bold',
                    active && 'text-ink-primary',
                    done && 'text-ink-muted line-through decoration-status-verified/40',
                  )}
                >
                  {s.label}
                </span>
                {done && <CheckCircle2 size={16} className="text-status-verified" />}
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-surface-border bg-surface-elevated px-3 py-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            GPU: <span className="text-primary">84%</span>
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            EST: {Math.max(0, aiStages.length - currentStep - 1) * 3}s
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Verify() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [certificateType, setCertificateType] = useState<CertificateType | ''>('')
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [processingStageIdx, setProcessingStageIdx] = useState(0)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const utils = trpc.useUtils()

  const balance = parseFloat(user?.walletBalance || '0')
  const canVerify = balance >= VERIFICATION_COST

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
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setStage('uploaded')
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const validateEmail = (v: string) => {
    if (!v) {
      setEmailError(null)
      return true
    }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    setEmailError(ok ? null : 'Enter a valid email')
    return ok
  }

  const handleVerify = useCallback(() => {
    if (!file || !canVerify) return
    if (applicantEmail && !validateEmail(applicantEmail)) return

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
  }, [file, canVerify, applicantEmail, certificateType, applicantName, processMutation])

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setStage('idle')
    setResult(null)
    setCertificateType('')
    setApplicantName('')
    setApplicantEmail('')
    setEmailError(null)
    setProcessingStageIdx(0)
  }

  const showProcessing = stage === 'processing'
  const isResult = stage === 'result' && result

  const phaseOne = useMemo(
    () => (
      <div className="space-y-4">
        <PhaseLabel label="Phase 01: File Intake" hint="Required System Input" color="primary" />

        {!file ? (
          <DropZone
            onFileSelect={onFileSelect}
            label="Drop certificate here"
            sublabel="Drag-and-drop, or click to browse a PDF / image."
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-card">
                {previewUrl && file.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="preview" className="size-full object-cover" />
                ) : (
                  <FileText size={28} className="text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-primary">{file.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                  {file.type.startsWith('image/') ? 'Image' : 'PDF'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="verified" size="sm" dot>
                    Encrypted
                  </Badge>
                  <Badge tone="primary" size="sm">
                    Ready
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setFile(null)
                  setPreviewUrl(null)
                  setStage('idle')
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-surface-card text-ink-muted transition-colors hover:border-status-fake hover:text-status-fake"
                aria-label="Remove file"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    [file, previewUrl, onFileSelect],
  )

  const phaseTwo = (
    <div className="space-y-4">
      <PhaseLabel label="Phase 02: Metadata" hint="Contextual Shield" color="cyan" />

      <Select
        label="Credential Type"
        value={certificateType}
        onChange={(e) => setCertificateType(e.target.value as CertificateType | '')}
      >
        <option value="">Select type…</option>
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

      <Field
        label="Applicant Name (Optional)"
        placeholder="e.g. Adebayo Adeniran"
        value={applicantName}
        onChange={(e) => setApplicantName(e.target.value)}
      />

      <Field
        label="Applicant Email (Optional)"
        type="email"
        placeholder="applicant@company.com"
        value={applicantEmail}
        error={emailError || undefined}
        onChange={(e) => {
          setApplicantEmail(e.target.value)
          validateEmail(e.target.value)
        }}
      />

      <Button
        fullWidth
        size="lg"
        onClick={handleVerify}
        disabled={!file || !canVerify}
        rightIcon={<ArrowRight size={16} />}
      >
        Run Forensic Scan
      </Button>

      <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        ₦{VERIFICATION_COST.toFixed(2)} / verification
      </p>
      {!canVerify && (
        <Link
          to="/wallet"
          className="block text-center font-mono text-[10px] font-bold uppercase tracking-widest text-status-fake hover:underline"
        >
          Insufficient balance — top up →
        </Link>
      )}
    </div>
  )

  if (isResult) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-primary"
        >
          <motion.span className="inline-block transition-transform group-hover:-translate-x-1">
            ←
          </motion.span>{' '}
          System Dashboard
        </Link>
        <VerdictCard certificate={result!} />
        <div className="flex flex-wrap justify-center gap-3 border-t border-surface-border pt-8">
          <Button onClick={reset} leftIcon={<Sparkles size={14} />}>
            Verify Another
          </Button>
          <Link to="/history">
            <Button variant="outline" rightIcon={<ArrowRight size={14} />}>
              View History
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"
          >
            <Brain size={26} className="text-primary" />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tighter text-ink-primary md:text-5xl">
            Single Verification
          </h1>
          <p className="mt-3 max-w-xl text-sm font-medium text-ink-secondary md:text-base">
            Submit one credential and get a forensic trust score back in{' '}
            <span className="font-bold text-primary">12 seconds</span>.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">{phaseOne}</div>
          <div className="lg:col-span-2">{phaseTwo}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-surface-border pt-6">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
            <span className="relative flex size-2 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-verified opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-status-verified" />
            </span>
            Squad API: Connected
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
            <Upload size={12} />
            AI Engine: Optimal
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showProcessing && <ProcessingModal file={file} currentStep={processingStageIdx} />}
      </AnimatePresence>
    </>
  )
}
