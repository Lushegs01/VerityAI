import { Link } from 'react-router'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center">
          <ShieldCheck size={32} className="text-ink-muted" />
        </div>
        <h1 className="font-display text-4xl text-ink-primary mb-2">404</h1>
        <p className="text-ink-secondary mb-6">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
