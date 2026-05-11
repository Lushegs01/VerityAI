import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Building2,
  CreditCard,
  Copy,
  CheckCircle2,
  Shield,
  Receipt,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import TopUpModal from '@/components/wallet/TopUpModal'
import {
  Button,
  Badge,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
  Skeleton,
} from '@/components/ui-system'

export default function Wallet() {
  const { user } = useAuth()
  const [showTopUp, setShowTopUp] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: transactions, isLoading } = trpc.wallet.transactions.useQuery({ limit: 20 })
  const { data: balanceData } = trpc.wallet.balance.useQuery()

  const balance = balanceData?.balance ?? parseFloat(user?.walletBalance || '0')

  const totalTopUps =
    transactions?.filter((t) => t.type === 'topup').reduce((s, t) => s + Number(t.amount), 0) || 0
  const totalSpent =
    transactions?.filter((t) => t.type === 'deduction').reduce((s, t) => s + Number(t.amount), 0) || 0

  const copyAccount = (acct: string) => {
    navigator.clipboard.writeText(acct)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft size={15} className="text-status-verified" />
      case 'deduction':
        return <ArrowUpRight size={15} className="text-status-fake" />
      case 'refund':
        return <ArrowDownLeft size={15} className="text-status-suspicious" />
      default:
        return <Receipt size={15} className="text-ink-muted" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Wallet top-up'
      case 'deduction':
        return 'Verification fee'
      case 'refund':
        return 'Refund'
      default:
        return type
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'topup':
        return 'text-status-verified'
      case 'deduction':
        return 'text-ink-primary'
      case 'refund':
        return 'text-status-suspicious'
      default:
        return 'text-ink-primary'
    }
  }

  const getSign = (type: string) => {
    switch (type) {
      case 'topup':
      case 'refund':
        return '+'
      case 'deduction':
        return '-'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          <CreditCard size={11} /> Squad-secured
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
          Wallet & Payments
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Funds powering your AI verifications. Every payment is logged for audit.
        </p>
      </motion.div>

      {/* Balance + Funding */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {/* Balance hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-surface-card via-surface-card to-primary/10 p-6 sm:p-8"
        >
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/15 blur-3xl" aria-hidden />
          <div className="absolute -bottom-12 left-1/2 size-72 -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-3xl" aria-hidden />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent-cyan/10 ring-1 ring-primary/20">
                  <WalletIcon className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Available balance
                  </p>
                  <p className="text-xs text-ink-secondary">Live wallet ledger</p>
                </div>
              </div>
              <h2 className="mt-5 break-words font-display font-mono text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
                N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="mt-2 text-xs text-ink-muted">
                Funds <span className="font-mono text-ink-primary">{Math.floor(balance / 500)}</span>{' '}
                verifications at N500 each
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="success" dot>Active</Badge>
                <Badge tone="info">
                  <Shield size={11} className="mr-1" /> Audit-logged
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <Button size="lg" onClick={() => setShowTopUp(true)} leftIcon={<Plus size={15} />}>
                Top Up Wallet
              </Button>
              <p className="text-[11px] text-ink-muted text-right">Card &middot; Bank transfer</p>
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat
              icon={ArrowDownLeft}
              label="Total funded"
              value={`N${totalTopUps.toLocaleString('en-NG')}`}
              tone="success"
            />
            <MiniStat
              icon={ArrowUpRight}
              label="Total spent"
              value={`N${totalSpent.toLocaleString('en-NG')}`}
              tone="neutral"
            />
            <MiniStat
              icon={TrendingUp}
              label="Verifications"
              value={`${user?.verificationCount || 0}`}
              tone="primary"
            />
          </div>
        </motion.div>

        {/* Virtual account */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Panel className="overflow-hidden">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-primary" />
                <PanelTitle>Virtual Account</PanelTitle>
              </div>
              <Badge tone="info" size="sm">
                Demo
              </Badge>
            </PanelHeader>
            <PanelBody className="space-y-4">
              <p className="text-xs text-ink-secondary">
                Fund your wallet via bank transfer. Demo transfers credit through the same ledger.
              </p>

              <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Bank
                </p>
                <p className="text-sm font-semibold text-ink-primary">GTBank</p>

                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Account number
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-2xl font-bold tracking-tight text-ink-primary">
                    0012345678
                  </p>
                  <button
                    onClick={() => copyAccount('0012345678')}
                    className="flex size-9 items-center justify-center rounded-lg border border-surface-border text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
                    aria-label="Copy account"
                  >
                    {copied ? (
                      <CheckCircle2 size={14} className="text-status-verified" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Beneficiary
                </p>
                <p className="text-sm text-ink-primary">VerityAI Wallet</p>
              </div>
            </PanelBody>
          </Panel>
        </motion.div>
      </div>

      {/* Squad explainer banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-primary">Payments are central to verification.</p>
              <p className="mt-1 max-w-2xl text-xs text-ink-muted">
                Squad payments unlock each verification and create a tamper-evident financial audit
                trail. Failed verifications are eligible for refund through the same ledger.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Badge tone="success">Live ledger</Badge>
            <Badge tone="info">Audit-ready</Badge>
          </div>
        </div>
      </motion.div>

      {/* Transactions */}
      <Panel className="overflow-hidden">
        <PanelHeader>
          <div>
            <PanelTitle>Transaction History</PanelTitle>
            <p className="mt-0.5 text-xs text-ink-muted">All wallet movements, newest first</p>
          </div>
          <Receipt size={15} className="text-ink-muted" />
        </PanelHeader>
        <div className="divide-y divide-surface-border">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-hover/40 sm:px-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated">
                  {getTypeIcon(tx.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-primary">{getTypeLabel(tx.type)}</p>
                  <p className="truncate text-xs text-ink-muted">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${getAmountColor(tx.type)}`}>
                    {getSign(tx.type)}N
                    {parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-ink-muted">
                    <Clock size={9} />
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-NG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Receipt}
              title="No payment records yet"
              description="Top up your wallet to unlock AI verifications. Every transaction is logged here."
              action={
                <Button onClick={() => setShowTopUp(true)} leftIcon={<Plus size={14} />}>
                  Top Up Wallet
                </Button>
              }
            />
          )}
        </div>
      </Panel>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
  tone: 'success' | 'neutral' | 'primary'
}) {
  const styles = {
    success: 'bg-status-verified/10 text-status-verified ring-status-verified/20',
    neutral: 'bg-surface-elevated text-ink-secondary ring-surface-border',
    primary: 'bg-primary/10 text-primary ring-primary/20',
  }[tone]
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3">
      <div className="flex items-center gap-2">
        <span className={`flex size-7 items-center justify-center rounded-lg ring-1 ${styles}`}>
          <Icon size={13} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      </div>
      <p className="mt-2 font-mono text-base font-bold text-ink-primary">{value}</p>
    </div>
  )
}

