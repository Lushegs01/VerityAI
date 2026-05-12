import { useParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileSearch,
  Clock,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Activity,
} from 'lucide-react'
import VerdictCard from '@/components/trust/VerdictCard'
import { trpc } from '@/providers/trpc'
import {
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Skeleton,
} from '@/components/ui-system'

export default function VerificationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: cert, isLoading } = trpc.verification.getById.useQuery(
    { publicId: id! },
    { enabled: !!id },
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!cert) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Verification not found"
        description="The verification you're looking for doesn't exist or has been removed."
        action={
          <Link to="/history">
            <Button leftIcon={<ArrowLeft size={14} />} variant="secondary">
              Back to history
            </Button>
          </Link>
        }
      />
    )
  }

  const createdAt = cert.createdAt ? new Date(cert.createdAt) : null
  const completed = cert.processingTimeMs

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink-primary"
          >
            <ArrowLeft size={14} />
            Back to history
          </Link>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Verification Detail
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Complete forensic report &middot;{' '}
            <span className="font-mono text-ink-primary">{cert.publicId}</span>
          </p>
        </div>
      </motion.div>

      <VerdictCard certificate={cert} />

      {/* Timeline / Audit */}
      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Timeline & Audit Trail</PanelTitle>
            <p className="mt-0.5 text-xs text-ink-muted">Chronological events for this verification</p>
          </div>
          <Activity size={15} className="text-primary" />
        </PanelHeader>
        <PanelBody>
          <ol className="relative space-y-5 border-l border-surface-border pl-5">
            {[
              {
                icon: CreditCard,
                title: 'Payment confirmed',
                detail: '₦500 deducted from wallet via Squad ledger',
                tone: 'text-status-verified',
                bg: 'bg-status-verified/15 ring-status-verified/30',
              },
              {
                icon: Sparkles,
                title: 'AI verification triggered',
                detail: 'Forensic engine started multi-stage analysis',
                tone: 'text-primary',
                bg: 'bg-primary/15 ring-primary/30',
              },
              {
                icon: FileSearch,
                title: 'Document analyzed',
                detail: `Trust score generated in ${completed ? (completed / 1000).toFixed(1) : '—'}s`,
                tone: 'text-accent-cyan',
                bg: 'bg-accent-cyan/15 ring-accent-cyan/30',
              },
              {
                icon: CheckCircle2,
                title: 'Result published',
                detail: `Verdict: ${cert.verdict?.replace('_', ' ')}`,
                tone: 'text-status-verified',
                bg: 'bg-status-verified/15 ring-status-verified/30',
              },
            ].map((event, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[34px] top-0 flex size-7 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface-card ${event.bg} ${event.tone}`}
                >
                  <event.icon size={13} />
                </span>
                <p className="text-sm font-semibold text-ink-primary">{event.title}</p>
                <p className="mt-0.5 text-xs text-ink-secondary">{event.detail}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-ink-muted">
                  <Clock size={10} />
                  {createdAt ? createdAt.toLocaleString('en-NG') : '—'}
                </p>
              </li>
            ))}
          </ol>
        </PanelBody>
      </Panel>
    </div>
  )
}
