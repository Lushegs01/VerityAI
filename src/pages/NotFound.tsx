import { Link } from 'react-router'
import { ArrowLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui-system'
import { BrandMark } from '@/components/brand/Logo'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.4]" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -z-10 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-7 inline-flex">
          <BrandMark size={72} glow />
          <span className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border border-status-fake/30 bg-status-fake/15 text-status-fake ring-2 ring-surface-base">
            <Search size={13} />
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
          Error 404
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
          We can't verify this page.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-ink-secondary">
          The page you're looking for doesn't exist, has been moved, or you don't have access.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button leftIcon={<ArrowLeft size={14} />}>Back to Home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
