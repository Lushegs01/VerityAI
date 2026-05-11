import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CreditCard,
  Building2,
  Zap,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { trpc } from '@/providers/trpc'
import { Button, Field } from '@/components/ui-system'

interface TopUpModalProps {
  onClose: () => void
}

const amounts = [1000, 2000, 5000, 10000, 20000, 50000]

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const [method, setMethod] = useState<'card' | 'transfer'>('card')
  const [amount, setAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState('')
  const utils = trpc.useUtils()

  const finalAmount = customAmount.trim() ? Number(customAmount) : amount

  const topUpMutation = trpc.wallet.topup.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.wallet.balance.invalidate(),
        utils.wallet.transactions.invalidate(),
        utils.auth.me.invalidate(),
      ])
      toast.success(`N${data.amount.toLocaleString()} added to wallet`)
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = () => {
    if (!Number.isFinite(finalAmount) || finalAmount < 500) {
      toast.error('Minimum top-up is N500')
      return
    }

    topUpMutation.mutate({ amount: finalAmount, method })
  }

  const fee = Number.isFinite(finalAmount) ? Math.round(finalAmount * 0.015) : 0
  const total = Number.isFinite(finalAmount) ? Math.round(finalAmount * 1.015) : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="topup-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent-cyan/10 ring-1 ring-primary/20">
                <CreditCard size={16} className="text-primary" />
              </div>
              <div>
                <h2 id="topup-title" className="font-display text-base font-bold tracking-tight text-ink-primary">
                  Top Up Wallet
                </h2>
                <p className="text-[11px] text-ink-muted">Secured by Squad Payments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg border border-surface-border text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink-primary"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Method selector */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-surface-border bg-surface-elevated p-1">
              <button
                onClick={() => setMethod('card')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  method === 'card'
                    ? 'bg-surface-card text-ink-primary shadow-sm ring-1 ring-surface-border'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <CreditCard size={14} />
                Card payment
              </button>
              <button
                onClick={() => setMethod('transfer')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  method === 'transfer'
                    ? 'bg-surface-card text-ink-primary shadow-sm ring-1 ring-surface-border'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Building2 size={14} />
                Bank transfer
              </button>
            </div>

            {method === 'card' ? (
              <>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Select amount
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {amounts.map((a) => {
                      const active = amount === a && !customAmount
                      return (
                        <button
                          key={a}
                          onClick={() => {
                            setAmount(a)
                            setCustomAmount('')
                          }}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-surface-border bg-surface-elevated text-ink-secondary hover:border-primary/30 hover:bg-surface-hover'
                          }`}
                        >
                          N{a.toLocaleString()}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-3">
                    <Field
                      label="Or enter custom amount"
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Minimum N500"
                      min={500}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">Amount</dt>
                      <dd className="font-mono text-ink-primary">
                        N{Number.isFinite(finalAmount) ? finalAmount.toLocaleString() : '0'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">Processing fee (1.5%)</dt>
                      <dd className="font-mono text-ink-primary">N{fee.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between border-t border-surface-border pt-2">
                      <dt className="text-sm font-semibold text-ink-primary">Total</dt>
                      <dd className="font-mono text-lg font-bold text-ink-primary">
                        N{total.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSubmit}
                  loading={topUpMutation.isPending}
                  leftIcon={<Zap size={14} />}
                >
                  Confirm Payment
                </Button>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Building2 size={26} className="text-primary" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-ink-primary">
                  GTBank Virtual Account
                </h3>
                <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-ink-primary">
                  0012345678
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Transfer from any Nigerian bank to credit your wallet
                </p>

                <div className="mt-4 rounded-xl border border-surface-border bg-surface-elevated p-3">
                  <p className="text-[11px] text-ink-muted">
                    Demo transfers credit through the same Squad-backed wallet ledger used by card
                    payments.
                  </p>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  className="mt-4"
                  onClick={handleSubmit}
                  loading={topUpMutation.isPending}
                  leftIcon={<CheckCircle2 size={14} />}
                >
                  Credit Demo Transfer
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-elevated/50 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Lock size={11} /> 256-bit encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                <ShieldCheck size={11} /> NDPR compliant
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
