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
  FileSearch,
  Filter,
  Download,
  Eye,
  Sparkles,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import {
  Button,
  EmptyState,
  Panel,
  PanelHeader,
  PanelTitle,
  VerdictBadge,
  Skeleton,
} from '@/components/ui-system'

type VerdictFilter = '' | 'VERIFIED' | 'SUSPICIOUS' | 'LIKELY_FAKE'
type CertificateTypeFilter = '' | 'WAEC' | 'NECO' | 'BSc' | 'HND' | 'NYSC'

export default function History() {
  const [page, setPage] = useState(1)
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CertificateTypeFilter>('')

  const { data, isLoading } = trpc.verification.history.useQuery({
    page,
    limit: 15,
    verdict: verdictFilter || undefined,
    certificateType: typeFilter || undefined,
    search: searchQuery || undefined,
  })

  const verdictTabs: { value: VerdictFilter; label: string; icon: typeof ShieldCheck; tone: string }[] = [
    { value: '', label: 'All', icon: FileSearch, tone: 'text-ink-secondary' },
    { value: 'VERIFIED', label: 'Verified', icon: ShieldCheck, tone: 'text-status-verified' },
    { value: 'SUSPICIOUS', label: 'Flagged', icon: AlertTriangle, tone: 'text-status-suspicious' },
    { value: 'LIKELY_FAKE', label: 'Rejected', icon: XCircle, tone: 'text-status-fake' },
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'WAEC', label: 'WAEC' },
    { value: 'NECO', label: 'NECO' },
    { value: 'BSc', label: 'BSc' },
    { value: 'HND', label: 'HND' },
    { value: 'NYSC', label: 'NYSC' },
  ]

  const exportCsv = () => {
    if (!data?.items?.length) return
    const headers = [
      'public_id',
      'applicant',
      'type',
      'institution',
      'trust_score',
      'verdict',
      'created_at',
    ]
    const rows = data.items.map((c) =>
      [
        c.publicId,
        c.applicantName || '',
        c.certificateType || '',
        c.institutionName || '',
        c.trustScore ?? '',
        c.verdict || '',
        c.createdAt ? new Date(c.createdAt).toISOString() : '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verityai-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-cyan">
            <Sparkles size={11} /> Audit trail
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Verification History
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Complete audit log of every verification, with filters, search and exports.
          </p>
        </div>
        <Button variant="secondary" onClick={exportCsv} leftIcon={<Download size={14} />}>
          Export CSV
        </Button>
      </motion.div>

      {/* Tabs / filter pills */}
      <Panel padded>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-surface-border bg-surface-elevated p-1">
            {verdictTabs.map((tab) => {
              const active = verdictFilter === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setVerdictFilter(tab.value)
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-surface-card text-ink-primary shadow-sm ring-1 ring-surface-border'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <tab.icon size={13} className={tab.tone} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by applicant, ID, institution..."
                className="h-10 w-full rounded-xl border border-surface-border bg-surface-elevated pl-9 pr-3 text-sm text-ink-primary placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as CertificateTypeFilter)
                  setPage(1)
                }}
                className="h-10 appearance-none rounded-xl border border-surface-border bg-surface-elevated pl-9 pr-9 text-sm text-ink-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronRight
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-ink-muted"
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Submissions</PanelTitle>
            <p className="mt-0.5 text-xs text-ink-muted">
              {data ? `${data.total.toLocaleString()} total verifications` : 'Loading…'}
            </p>
          </div>
          {data && data.totalPages > 1 && (
            <span className="text-xs text-ink-muted">
              Page {page} of {data.totalPages}
            </span>
          )}
        </PanelHeader>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface-elevated/40 text-left">
                  <Th>ID</Th>
                  <Th>Applicant</Th>
                  <Th>Type</Th>
                  <Th>Score</Th>
                  <Th>Verdict</Th>
                  <Th>Submitted</Th>
                  <Th className="w-12 text-right">Open</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-3">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : data?.items.length ? (
                  data.items.map((cert, i) => {
                    const score = cert.trustScore || 0
                    return (
                      <motion.tr
                        key={cert.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group transition-colors hover:bg-surface-hover/40"
                      >
                        <Td>
                          <Link
                            to={`/verification/${cert.publicId}`}
                            className="font-mono text-xs font-semibold text-primary hover:underline"
                          >
                            {cert.publicId}
                          </Link>
                        </Td>
                        <Td>
                          <p className="text-sm font-semibold text-ink-primary">
                            {cert.applicantName || 'Unnamed'}
                          </p>
                          <p className="text-[11px] text-ink-muted truncate max-w-[200px]">
                            {cert.institutionName || '—'}
                          </p>
                        </Td>
                        <Td className="text-sm text-ink-secondary">{cert.certificateType}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex size-8 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                                score >= 80
                                  ? 'bg-status-verified/10 text-status-verified ring-1 ring-status-verified/20'
                                  : score >= 50
                                    ? 'bg-status-suspicious/10 text-status-suspicious ring-1 ring-status-suspicious/20'
                                    : 'bg-status-fake/10 text-status-fake ring-1 ring-status-fake/20'
                              }`}
                            >
                              {score}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <VerdictBadge verdict={cert.verdict} size="sm" />
                        </Td>
                        <Td className="text-xs text-ink-muted">
                          {cert.createdAt
                            ? new Date(cert.createdAt).toLocaleDateString('en-NG', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </Td>
                        <Td className="text-right">
                          <Link
                            to={`/verification/${cert.publicId}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-ink-muted opacity-0 transition-all hover:bg-primary/10 hover:text-primary group-hover:opacity-100"
                            aria-label={`View ${cert.publicId}`}
                          >
                            <Eye size={13} />
                          </Link>
                        </Td>
                      </motion.tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-2">
                      <EmptyState
                        icon={FileSearch}
                        title="No verifications match"
                        description="Try a different search query, verdict tab, or certificate type."
                        action={
                          <Link to="/verify">
                            <Button leftIcon={<Sparkles size={14} />}>Start AI Verification</Button>
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-surface-border md:hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : data?.items.length ? (
            data.items.map((cert) => {
              const score = cert.trustScore || 0
              return (
                <Link
                  key={cert.id}
                  to={`/verification/${cert.publicId}`}
                  className="block p-4 transition-colors hover:bg-surface-hover/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                        score >= 80
                          ? 'bg-status-verified/10 text-status-verified ring-1 ring-status-verified/20'
                          : score >= 50
                            ? 'bg-status-suspicious/10 text-status-suspicious ring-1 ring-status-suspicious/20'
                            : 'bg-status-fake/10 text-status-fake ring-1 ring-status-fake/20'
                      }`}
                    >
                      {score}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-primary">
                        {cert.applicantName || 'Unnamed'}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        <span className="font-mono text-primary">{cert.publicId}</span>
                        <span className="mx-1">&middot;</span>
                        {cert.certificateType}
                      </p>
                    </div>
                    <VerdictBadge verdict={cert.verdict} size="sm" />
                  </div>
                </Link>
              )
            })
          ) : (
            <EmptyState
              icon={FileSearch}
              title="No verifications match"
              description="Try a different filter or start your first verification."
              action={
                <Link to="/verify">
                  <Button leftIcon={<Sparkles size={14} />}>Start AI Verification</Button>
                </Link>
              }
            />
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-border px-5 py-3 sm:px-6">
            <p className="text-xs text-ink-muted">
              Showing page <span className="font-mono text-ink-primary">{page}</span> of{' '}
              <span className="font-mono text-ink-primary">{data.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex size-9 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="flex size-9 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Panel>

    </div>
  )
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <th
      className={`text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted px-5 py-3 ${className || ''}`}
    >
      {children}
    </th>
  )
}

function Td({ className, children }: { className?: string; children: React.ReactNode }) {
  return <td className={`px-5 py-4 ${className || ''}`}>{children}</td>
}
