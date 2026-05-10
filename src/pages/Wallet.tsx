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

  const balance = parseFloat(user?.walletBalance || '0')

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink-primary">Wallet</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage your verification credits and payment methods.
        </p>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-surface-card to-surface-elevated border border-surface-border rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <WalletIcon className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">
              Available Balance
            </p>
            <h2 className="font-mono text-4xl font-bold text-ink-primary mb-6">
              N{balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTopUp(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
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
          className="bg-surface-card border border-surface-border rounded-2xl p-6"
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
          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
            <p className="text-xs text-ink-muted mb-1">Bank</p>
            <p className="text-sm font-medium text-ink-primary mb-3">GTBank</p>
            <p className="text-xs text-ink-muted mb-1">Account Number</p>
            <p className="font-mono text-lg font-bold text-ink-primary">0012345678</p>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden"
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
