import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import TopUpModal from '@/components/wallet/TopUpModal'

export default function Wallet() {
  const { user } = useAuth()
  const [showTopUp, setShowTopUp] = useState(false)

  const { data: transactions, isLoading } = trpc.wallet.transactions.useQuery({
    limit: 20,
  })
  const { data: balanceData } = trpc.wallet.balance.useQuery()

  const balance = balanceData?.balance ?? parseFloat(user?.walletBalance || '0')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft size={16} className="text-status-verified" />
      case 'deduction':
        return <ArrowUpRight size={16} className="text-status-fake" />
      case 'refund':
        return <ArrowDownLeft size={16} className="text-status-suspicious" />
      default:
        return <ArrowDownLeft size={16} className="text-ink-muted" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'topup': return 'Wallet Top-up'
      case 'deduction': return 'Verification Fee'
      case 'refund': return 'Refund'
      default: return type
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'topup': return 'text-status-verified'
      case 'deduction': return 'text-status-fake'
      case 'refund': return 'text-status-suspicious'
      default: return 'text-ink-primary'
    }
  }

  const getSign = (type: string) => {
    switch (type) {
      case 'topup': return '+'
      case 'deduction': return '-'
      case 'refund': return '+'
      default: return ''
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink-primary sm:text-3xl">Wallet</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage your verification credits and payment methods.
        </p>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border border-surface-border bg-surface-card p-5 sm:p-6 lg:col-span-2"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <WalletIcon className="text-primary" size={21} />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Available Balance
              </p>
              <h2 className="break-words font-mono text-3xl font-bold text-ink-primary sm:text-4xl">
                N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="mt-2 text-xs text-ink-muted">
                Ready for {Math.floor(balance / 500).toLocaleString('en-NG')} certificate checks
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTopUp(true)}
                className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <Plus size={16} />
                Top Up
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Virtual Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-surface-border bg-surface-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-ink-muted w-4 h-4" />
            <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold">
              Virtual Account
            </p>
          </div>
          <p className="text-sm text-ink-secondary mb-4">
            Fund your wallet via bank transfer
          </p>
          <div className="rounded-lg border border-surface-border bg-surface-elevated p-4">
            <p className="text-xs text-ink-muted mb-1">Bank</p>
            <p className="text-sm font-medium text-ink-primary mb-3">GTBank</p>
            <p className="text-xs text-ink-muted mb-1">Account Number</p>
            <p className="break-all font-mono text-lg font-bold text-ink-primary">0012345678</p>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-lg border border-surface-border bg-surface-card"
      >
        <div className="p-6 border-b border-surface-border">
          <h2 className="font-display text-lg text-ink-primary">
            Transaction History
          </h2>
        </div>
        <div className="divide-y divide-surface-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-4 bg-surface-elevated rounded animate-pulse" />
              </div>
            ))
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {getTypeLabel(tx.type)}
                    </p>
                    <p className="text-xs text-ink-muted">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-semibold ${getAmountColor(tx.type)}`}>
                    {getSign(tx.type)}N{parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <WalletIcon size={32} className="text-ink-muted mx-auto mb-2" />
              <p className="text-sm text-ink-muted">No transactions yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Up Modal */}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    </div>
  )
}
