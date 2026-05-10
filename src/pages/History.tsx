import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'

export default function History() {
  const [page, setPage] = useState(1)
  const [verdictFilter, setVerdictFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = trpc.verification.history.useQuery({
    page,
    limit: 15,
    verdict: verdictFilter || undefined,
    certificateType: typeFilter || undefined,
    search: searchQuery || undefined,
  })

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED':
        return 'bg-status-verified/10 text-status-verified border-status-verified/20'
      case 'SUSPICIOUS':
        return 'bg-status-suspicious/10 text-status-suspicious border-status-suspicious/20'
      case 'LIKELY_FAKE':
        return 'bg-status-fake/10 text-status-fake border-status-fake/20'
      default:
        return 'bg-surface-elevated text-ink-muted'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED': return <ShieldCheck size={14} className="text-status-verified" />
      case 'SUSPICIOUS': return <AlertTriangle size={14} className="text-status-suspicious" />
      case 'LIKELY_FAKE': return <XCircle size={14} className="text-status-fake" />
      default: return null
    }
  }

  const verdictOptions = [
    { value: '', label: 'All Verdicts' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'SUSPICIOUS', label: 'Suspicious' },
    { value: 'LIKELY_FAKE', label: 'Likely Fake' },
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'WAEC', label: 'WAEC' },
    { value: 'NECO', label: 'NECO' },
    { value: 'BSc', label: 'BSc' },
    { value: 'HND', label: 'HND' },
    { value: 'NYSC', label: 'NYSC' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink-primary">Verification History</h1>
        <p className="text-sm text-ink-muted mt-1">
          View all your certificate verifications and their results.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search by name, ID, institution..."
            className="w-full bg-surface-card border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={verdictFilter}
            onChange={(e) => { setVerdictFilter(e.target.value); setPage(1); }}
            className="bg-surface-card border border-surface-border rounded-xl px-3 py-2.5 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {verdictOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-surface-card border border-surface-border rounded-xl px-3 py-2.5 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">Score</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">Verdict</th>
                <th className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length ? (
                data.items.map((cert) => (
                  <motion.tr
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/verification/${cert.publicId}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {cert.publicId}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-ink-primary">
                        {cert.applicantName || 'Unknown'}
                      </p>
                      <p className="text-xs text-ink-muted">{cert.institutionName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-secondary">{cert.certificateType}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-ink-primary">
                        {cert.trustScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold uppercase border ${getVerdictBadge(cert.verdict || '')}`}>
                        {getVerdictIcon(cert.verdict || '')}
                        {cert.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-muted">
                      {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink-muted">
                    No verifications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-surface-border">
          {data?.items.map((cert) => (
            <Link
              key={cert.id}
              to={`/verification/${cert.publicId}`}
              className="block p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-primary">{cert.publicId}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getVerdictBadge(cert.verdict || '')}`}>
                  {cert.verdict}
                </span>
              </div>
              <p className="text-sm font-medium text-ink-primary">{cert.applicantName || 'Unknown'}</p>
              <p className="text-xs text-ink-muted">{cert.certificateType} {cert.institutionName ? `- ${cert.institutionName}` : ''}</p>
              <p className="font-mono text-xs text-ink-muted mt-1">Score: {cert.trustScore}</p>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
            <p className="text-xs text-ink-muted">
              Page {page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-ink-secondary hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 rounded-lg bg-surface-elevated border border-surface-border text-ink-secondary hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
