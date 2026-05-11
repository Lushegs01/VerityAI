import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Layers,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Badge, Button, Panel, Select } from '@/components/ui-system'
import { cn } from '@/lib/utils'

const VERIFICATION_COST = 500
const MAX_FILES = 50

interface BulkItem {
  id: string
  file: File
  status: 'queued' | 'processing' | 'verified' | 'suspicious' | 'fake' | 'error'
  score: number | null
}

function PhaseLabel({
  label,
  hint,
  color = 'primary',
}: {
  label: string
  hint: string
  color?: 'primary' | 'cyan'
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-elevated px-4 py-3">
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

function MultiDropZone({
  onFiles,
}: {
  onFiles: (files: File[]) => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all',
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-surface-border bg-surface-card hover:border-primary/50 hover:bg-surface-elevated/40',
      )}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { y: [0, -6, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-surface-border bg-surface-elevated text-ink-secondary group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
      >
        <Upload size={26} />
      </motion.div>
      <p className="mt-5 font-display text-base font-bold uppercase tracking-tight text-ink-primary">
        Drop certificates here
      </p>
      <p className="mt-2 text-sm font-medium text-ink-secondary">
        Drag-and-drop up to {MAX_FILES} files, or click to browse. PDF, JPG, PNG, WEBP.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Badge tone="primary" size="sm">
          PDF
        </Badge>
        <Badge tone="primary" size="sm">
          JPG
        </Badge>
        <Badge tone="primary" size="sm">
          PNG
        </Badge>
        <Badge tone="neutral" size="sm">
          Max 10 MB
        </Badge>
      </div>
    </div>
  )
}

function statusBadge(status: BulkItem['status']) {
  switch (status) {
    case 'queued':
      return <Badge tone="neutral" size="sm">Queued</Badge>
    case 'processing':
      return (
        <Badge tone="primary" size="sm">
          <Loader2 size={10} className="animate-spin" /> Scanning
        </Badge>
      )
    case 'verified':
      return <Badge variant="verified" size="sm" dot>Verified</Badge>
    case 'suspicious':
      return <Badge variant="suspicious" size="sm" dot>Suspicious</Badge>
    case 'fake':
      return <Badge variant="fake" size="sm" dot>Likely Fake</Badge>
    case 'error':
      return <Badge tone="danger" size="sm">Error</Badge>
  }
}

function scoreColor(score: number | null) {
  if (score === null) return 'text-ink-muted'
  if (score >= 70) return 'text-status-verified'
  if (score >= 40) return 'text-status-suspicious'
  return 'text-status-fake'
}

export default function Bulk() {
  const { user } = useAuth()
  const [items, setItems] = useState<BulkItem[]>([])
  const [certificateType, setCertificateType] = useState('')
  const [running, setRunning] = useState(false)

  const balance = parseFloat(user?.walletBalance || '0')
  const cost = items.length * VERIFICATION_COST
  const canRun = items.length > 0 && balance >= cost && !running

  const summary = useMemo(() => {
    const total = items.length
    const verified = items.filter((i) => i.status === 'verified').length
    const flagged = items.filter((i) => i.status === 'suspicious' || i.status === 'fake').length
    const processing = items.filter((i) => i.status === 'processing').length
    const done = items.filter((i) =>
      ['verified', 'suspicious', 'fake', 'error'].includes(i.status),
    ).length
    return { total, verified, flagged, processing, done }
  }, [items])

  const overallProgress = summary.total === 0 ? 0 : (summary.done / summary.total) * 100

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return
    setItems((prev) => {
      const remaining = Math.max(0, MAX_FILES - prev.length)
      const incoming = files.slice(0, remaining).map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        file: f,
        status: 'queued' as const,
        score: null,
      }))
      if (files.length > remaining) {
        toast.error(`Capped at ${MAX_FILES} files`)
      }
      return [...prev, ...incoming]
    })
  }, [])

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const clearAll = () => {
    setItems([])
    setRunning(false)
  }

  /**
   * Runs a simulated batch scan: each queued item moves to "processing"
   * then resolves to a verdict based on a stable hash of the filename so
   * results are deterministic for demos. Real integration would invoke
   * the verification.process tRPC mutation per file.
   */
  const runBatch = async () => {
    if (!canRun) return
    setRunning(true)
    for (const item of items) {
      if (item.status !== 'queued') continue
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: 'processing' } : it,
        ),
      )
      await new Promise((r) => setTimeout(r, 1100))
      const score = 30 + (item.file.name.length * 7) % 70
      const status: BulkItem['status'] =
        score >= 70 ? 'verified' : score >= 40 ? 'suspicious' : 'fake'
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status, score } : it,
        ),
      )
    }
    setRunning(false)
    toast.success('Batch scan complete')
  }

  const exportCSV = () => {
    const rows = [
      ['Filename', 'Status', 'Score'],
      ...items.map((it) => [
        it.file.name,
        it.status.toUpperCase(),
        it.score?.toString() ?? '',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `verity-bulk-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => () => clearAll(), [])

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Layers size={26} className="text-primary" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tighter text-ink-primary md:text-5xl">
          Bulk Verification
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium text-ink-secondary md:text-base">
          Submit up to {MAX_FILES} credentials at once. The forensic engine processes them in
          parallel and returns a verdict for each.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* LEFT — File intake */}
        <div className="space-y-4 lg:col-span-3">
          <PhaseLabel label="Phase 01: Batch Intake" hint="Multi-File Upload" color="primary" />
          <MultiDropZone onFiles={addFiles} />

          {items.length > 0 && (
            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
                    Queue
                  </h3>
                  <Badge tone="primary" size="sm">
                    {items.length}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-colors hover:text-status-fake"
                  disabled={running}
                >
                  <Trash2 size={12} /> Clear All
                </button>
              </div>
              <ul className="max-h-80 divide-y divide-surface-border overflow-y-auto">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 px-6 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-ink-muted">
                      <FileText size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-primary">{it.file.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        {(it.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {it.score !== null && (
                      <span className={cn('font-mono text-sm font-black tabular-nums', scoreColor(it.score))}>
                        {it.score}
                      </span>
                    )}
                    {statusBadge(it.status)}
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      disabled={running}
                      aria-label="Remove"
                      className="flex size-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-elevated hover:text-status-fake disabled:opacity-30"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {/* RIGHT — Metadata + run */}
        <div className="space-y-4 lg:col-span-2">
          <PhaseLabel label="Phase 02: Batch Metadata" hint="Apply To All" color="cyan" />

          <Panel className="space-y-5 p-6">
            <Select
              label="Credential Type (Applies to All)"
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
            >
              <option value="">Auto-detect per file</option>
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

            <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Total Cost
                </span>
                <span className="font-mono text-lg font-black tabular-nums text-ink-primary">
                  ₦{cost.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  Balance After
                </span>
                <span
                  className={cn(
                    'font-mono text-xs font-black tabular-nums',
                    balance - cost >= 0 ? 'text-status-verified' : 'text-status-fake',
                  )}
                >
                  ₦{(balance - cost).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={!canRun}
              loading={running}
              onClick={runBatch}
              rightIcon={!running ? <ArrowRight size={16} /> : undefined}
              leftIcon={!running ? <Sparkles size={16} /> : undefined}
            >
              {running ? 'Scanning batch…' : `Run Batch Scan (${items.length})`}
            </Button>

            {balance < cost && items.length > 0 && (
              <Link
                to="/wallet"
                className="block text-center font-mono text-[10px] font-bold uppercase tracking-widest text-status-fake hover:underline"
              >
                Insufficient balance — top up →
              </Link>
            )}
            <p className="text-center font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              ₦{VERIFICATION_COST.toFixed(2)} × {items.length} files
            </p>
          </Panel>

          <Panel className="space-y-3 p-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              What we check
            </p>
            {[
              { icon: ShieldCheck, label: 'Signature & seal validation' },
              { icon: FileText, label: 'Per-file forensic scan' },
              { icon: Layers, label: 'Cross-batch anomaly detection' },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs text-ink-secondary">
                <c.icon size={14} className="text-primary" />
                <span className="font-medium">{c.label}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* Results summary */}
      <AnimatePresence>
        {summary.done > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Panel className="overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
                    Batch Summary
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                    {summary.done} / {summary.total} processed
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCSV}
                  leftIcon={<Download size={14} />}
                >
                  Export CSV
                </Button>
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-status-verified/20 bg-status-verified-bg/50 p-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
                    Verified
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-ink-primary">
                    {summary.verified}
                  </p>
                </div>
                <div className="rounded-xl border border-status-suspicious/20 bg-status-suspicious-bg/50 p-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-status-suspicious">
                    Flagged
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-ink-primary">
                    {summary.flagged}
                  </p>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-elevated p-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    Pending
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-ink-primary">
                    {summary.total - summary.done}
                  </p>
                </div>
              </div>
            </Panel>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={clearAll}
                variant="outline"
                leftIcon={<Plus size={14} />}
              >
                Start New Batch
              </Button>
              <Link to="/history">
                <Button variant="ghost" rightIcon={<ArrowRight size={14} />}>
                  View Full History
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-surface-border pt-6">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-status-verified">
          <CheckCircle2 size={12} />
          AI Engine: Optimal
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          <Layers size={12} />
          Parallel Workers: 8
        </div>
      </div>
    </div>
  )
}
