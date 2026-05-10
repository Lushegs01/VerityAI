import { useParams, Link } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import VerdictCard from '@/components/trust/VerdictCard'
import { trpc } from '@/providers/trpc'

export default function VerificationDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: cert, isLoading } = trpc.verification.getById.useQuery(
    { publicId: id! },
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-elevated rounded w-1/3" />
          <div className="h-64 bg-surface-elevated rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <ShieldCheck size={48} className="text-ink-muted mx-auto mb-4" />
        <h2 className="font-display text-xl text-ink-primary mb-2">
          Verification Not Found
        </h2>
        <p className="text-sm text-ink-muted mb-4">
          The verification you're looking for doesn't exist.
        </p>
        <Link
          to="/history"
          className="text-sm text-primary hover:underline"
        >
          Back to history
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to history
        </Link>
      </motion.div>

      <VerdictCard certificate={cert as any} />
    </div>
  )
}
