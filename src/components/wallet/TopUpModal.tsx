import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Building2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface TopUpModalProps {
  onClose: () => void
}

const amounts = [1000, 2000, 5000, 10000, 20000, 50000]

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const [method, setMethod] = useState<'card' | 'transfer'>('card')
  const [amount, setAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const finalAmount = customAmount ? parseInt(customAmount) : amount

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount < 500) {
      toast.error('Minimum top-up is N500')
      return
    }
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast.success(`N${finalAmount.toLocaleString()} added to wallet!`)
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-surface-border">
            <h2 className="font-display text-lg text-ink-primary">Top Up Wallet</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <X size={18} className="text-ink-muted" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Method selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('card')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                  method === 'card'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-surface-border text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                <CreditCard size={16} />
                Card Payment
              </button>
              <button
                onClick={() => setMethod('transfer')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                  method === 'transfer'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-surface-border text-ink-secondary hover:bg-surface-hover'
                }`}
              >
                <Building2 size={16} />
                Bank Transfer
              </button>
            </div>

            {method === 'card' ? (
              <>
                {/* Amount selector */}
                <div>
                  <label className="block text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {amounts.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(a); setCustomAmount(''); }}
                        className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                          amount === a && !customAmount
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-surface-border text-ink-secondary hover:bg-surface-hover'
                        }`}
                      >
                        N{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-ink-muted mb-1.5">Or enter custom amount</label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-ink-muted">Amount</span>
                    <span className="text-ink-primary font-medium">N{finalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-ink-muted">Fee (1.5%)</span>
                    <span className="text-ink-primary font-medium">N{Math.round(finalAmount * 0.015).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-surface-border pt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-primary font-semibold">Total</span>
                    <span className="text-ink-primary font-mono font-bold">
                      N{Math.round(finalAmount * 1.015).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Pay button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  Pay with Squad
                </motion.button>
              </>
            ) : (
              /* Bank Transfer */
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <Building2 size={28} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-ink-primary mb-1">GTBank Virtual Account</h3>
                <p className="font-mono text-2xl font-bold text-ink-primary mb-1">0012345678</p>
                <p className="text-sm text-ink-muted mb-4">
                  Transfer to this account from any Nigerian bank
                </p>
                <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border">
                  <p className="text-xs text-ink-muted">
                    Account will be credited automatically. Squad webhook integration handles real-time updates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
