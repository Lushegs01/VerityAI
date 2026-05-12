import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CreditCard,
  Building2,
  Zap,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertCircle,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { Button, Field } from '@/components/ui-system'

interface TopUpModalProps {
  onClose: () => void
}

const amounts = [1000, 2000, 5000, 10000, 20000, 50000]
const SQUAD_WIDGET_URL = 'https://checkout.squadco.com/widget/squad.min.js'

interface SquadHandlerOptions {
  key: string
  email: string
  amount: number // kobo
  currency_code: string
  transaction_ref: string
  customer_name?: string
  onLoad?: () => void
  onClose?: () => void
  onSuccess?: (response: { transaction_ref?: string } & Record<string, unknown>) => void
}

interface SquadHandler {
  setup: () => void
  open: () => void
}

declare global {
  interface Window {
    squad?: (opts: SquadHandlerOptions) => SquadHandler
  }
}

function loadSquadWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('No window context'))
      return
    }
    if (window.squad) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SQUAD_WIDGET_URL}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Squad widget failed to load')),
        { once: true },
      )
      return
    }
    const script = document.createElement('script')
    script.src = SQUAD_WIDGET_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Squad widget failed to load'))
    document.head.appendChild(script)
  })
}

type Stage = 'idle' | 'launching' | 'awaiting' | 'verifying'

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { user } = useAuth()
  const isDemo = useAuthStore((s) => s.isDemo)
  const adjustDemoBalance = useAuthStore((s) => s.adjustDemoBalance)
  const [method, setMethod] = useState<'card' | 'transfer'>('card')
  const [amount, setAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [activeRef, setActiveRef] = useState<string | null>(null)

  // Stage in a ref so widget callbacks (captured at handler creation time) can
  // read the latest value without going stale.
  const stageRef = useRef<Stage>('idle')
  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  // Demo flow auto-progresses on a chain of timers. Track them so Cancel /
  // early-confirm can abort cleanly without racing the timed steps.
  const demoTimers = useRef<number[]>([])
  const clearDemoTimers = () => {
    demoTimers.current.forEach((id) => window.clearTimeout(id))
    demoTimers.current = []
  }
  useEffect(() => () => clearDemoTimers(), [])

  const utils = trpc.useUtils()
  // In demo mode the user has no real session, so the trpc lookup would 401.
  // Skip it and treat Squad as unconfigured locally — we'll simulate the flow.
  const { data: squadConfig } = trpc.wallet.publicConfig.useQuery(undefined, {
    enabled: !isDemo,
  })
  const finalAmount = customAmount.trim() ? Number(customAmount) : amount

  const refreshWallet = async () => {
    await Promise.all([
      utils.wallet.balance.invalidate(),
      utils.wallet.transactions.invalidate(),
      utils.auth.me.invalidate(),
    ])
  }

  const resetToIdle = () => {
    clearDemoTimers()
    setStage('idle')
    setActiveRef(null)
  }

  // Legacy / fallback simulator path (used by the bank-transfer tab and when
  // Squad isn't configured on the server).
  const fallbackTopup = trpc.wallet.topup.useMutation({
    onSuccess: async (data) => {
      await refreshWallet()
      toast.success(`₦${data.amount.toLocaleString()} added to wallet`)
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
      resetToIdle()
    },
  })

  const initiate = trpc.wallet.initiateSquadTopup.useMutation()
  const confirm = trpc.wallet.confirmSquadTopup.useMutation()

  const fee = Number.isFinite(finalAmount) ? Math.round(finalAmount * 0.015) : 0
  const total = Number.isFinite(finalAmount) ? Math.round(finalAmount * 1.015) : 0

  /** Used by both the auto-success callback and the manual "I already paid"
   *  button. In demo mode we never go to the server — the demo wallet lives
   *  entirely in the auth store. */
  const verifyAndCredit = async (reference: string) => {
    if (isDemo || reference.startsWith('DEMO-')) {
      clearDemoTimers()
      setStage('verifying')
      // Tiny beat so the verifying spinner is visible.
      await new Promise((r) => setTimeout(r, 500))
      adjustDemoBalance(finalAmount)
      toast.success(
        `₦${finalAmount.toLocaleString('en-NG')} credited (ref ${reference.slice(-6)})`,
      )
      onClose()
      return
    }
    setStage('verifying')
    try {
      const result = await confirm.mutateAsync({ reference })
      await refreshWallet()
      if (result.status === 'already_completed') {
        toast.success('Top-up already credited')
      } else {
        toast.success(
          `₦${result.amount.toLocaleString('en-NG')} credited (ref ${reference.slice(-6)})`,
        )
      }
      onClose()
    } catch (e) {
      // Surface the actual server error so the user can act on it (insufficient
      // funds, payment not yet posted, reference unknown, etc.) instead of
      // seeing a generic "verify failed".
      const raw = e instanceof Error ? e.message : 'Could not verify payment'
      const friendly = /not.*found|unknown.*ref/i.test(raw)
        ? "We can't find this payment yet. Wait a moment after paying, then try again."
        : /pending|not.*paid|incomplete/i.test(raw)
          ? "Squad says this payment hasn't completed yet. Finish it in the popup, then click verify."
          : raw
      toast.error(`Squad verify failed: ${friendly}`)
      setStage('awaiting')
    }
  }

  const launchSquad = async () => {
    if (!Number.isFinite(finalAmount) || finalAmount < 500) {
      toast.error('Minimum top-up is ₦500')
      return
    }

    setStage('launching')
    try {
      await loadSquadWidget()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not load Squad widget'
      toast.error(message)
      resetToIdle()
      return
    }

    let params: Awaited<ReturnType<typeof initiate.mutateAsync>>
    try {
      params = await initiate.mutateAsync({ amount: finalAmount })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not start payment'
      toast.error(message)
      resetToIdle()
      return
    }

    if (!window.squad) {
      toast.error('Squad widget unavailable')
      resetToIdle()
      return
    }

    if (!params.publicKey) {
      toast.error('Squad public key is not configured.')
      resetToIdle()
      return
    }

    setStage('awaiting')
    setActiveRef(params.reference)

    const handler = window.squad({
      key: params.publicKey,
      email: params.email,
      amount: Math.round(params.amount * 100),
      currency_code: 'NGN',
      transaction_ref: params.reference,
      customer_name: params.customerName,
      onLoad: () => {
        // widget displayed
      },
      onClose: () => {
        // Only react to "close" if we're still in awaiting — onSuccess will
        // have already transitioned us to "verifying", and we don't want to
        // clobber that.
        if (stageRef.current === 'awaiting') {
          // Keep the reference active so the user can hit "I already paid"
          // if Squad processed the charge but the widget closed without
          // firing onSuccess (which we've seen on slow connections).
          toast(
            'Widget closed. If you completed the payment, click "I already paid" to verify.',
            { duration: 6000 },
          )
        }
      },
      onSuccess: () => {
        void verifyAndCredit(params.reference)
      },
    })
    handler.setup()
    handler.open()
  }

  const submitTransfer = () => {
    if (!Number.isFinite(finalAmount) || finalAmount < 500) {
      toast.error('Minimum top-up is ₦500')
      return
    }
    if (isDemo) {
      adjustDemoBalance(finalAmount)
      toast.success(`₦${finalAmount.toLocaleString('en-NG')} credited via transfer`)
      onClose()
      return
    }
    fallbackTopup.mutate({ amount: finalAmount, method: 'transfer' })
  }

  /** Demo-mode top-up: walk through a simulated Squad "checkout" so the
   *  user gets visible Squad-branded feedback, then credit the local wallet.
   *  All steps are scheduled through clearable timers so Cancel or
   *  "I already paid" can interrupt cleanly. */
  const launchDemoSquad = () => {
    if (!Number.isFinite(finalAmount) || finalAmount < 500) {
      toast.error('Minimum top-up is ₦500')
      return
    }
    const reference = `DEMO-${Date.now().toString(36).toUpperCase()}`
    clearDemoTimers()
    setStage('launching')
    setActiveRef(reference)

    const schedule = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms)
      demoTimers.current.push(id)
    }
    // launching → awaiting (widget visible)
    schedule(600, () => {
      if (stageRef.current !== 'launching') return
      setStage('awaiting')
      // awaiting → verifying (Squad processing) → credit + close
      schedule(1800, () => {
        if (stageRef.current !== 'awaiting') return
        void verifyAndCredit(reference)
      })
    })
  }

  const handleCardSubmit = () => {
    if (isDemo) {
      launchDemoSquad()
      return
    }
    if (squadConfig?.squadConfigured) {
      void launchSquad()
    } else {
      if (!Number.isFinite(finalAmount) || finalAmount < 500) {
        toast.error('Minimum top-up is ₦500')
        return
      }
      fallbackTopup.mutate({ amount: finalAmount, method: 'card' })
    }
  }

  const cardButtonLoading =
    initiate.isPending ||
    stage === 'launching' ||
    fallbackTopup.isPending

  const cardButtonLabel =
    stage === 'launching'
      ? 'Loading checkout…'
      : isDemo || squadConfig?.squadConfigured
        ? 'Pay with Squad'
        : 'Simulate Card Payment'

  const isAwaiting = stage === 'awaiting' && activeRef !== null
  const isVerifying = stage === 'verifying'

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
                <p className="text-[11px] text-ink-muted">
                  {isDemo
                    ? 'Demo mode — payments are simulated'
                    : squadConfig?.squadConfigured
                      ? 'Secured by Squad Payments'
                      : 'Demo mode — Squad keys not configured'}
                </p>
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
            {/* Awaiting / verifying overlay — replaces the form to make state obvious */}
            {(isAwaiting || isVerifying) && activeRef ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                    {isVerifying ? (
                      <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <CreditCard size={20} />
                    )}
                  </div>
                  <p className="mt-3 font-display text-sm font-semibold text-ink-primary">
                    {isVerifying ? 'Verifying with Squad…' : 'Awaiting payment in widget'}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Reference{' '}
                    <span className="font-mono text-ink-primary">{activeRef.slice(-8)}</span>
                  </p>
                  {isAwaiting && (
                    <p className="mt-3 text-xs text-ink-muted">
                      Complete the payment in the Squad popup. If you've already paid but the popup
                      didn't redirect back, click "I already paid" to verify manually.
                    </p>
                  )}
                </div>

                {isAwaiting && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      onClick={resetToIdle}
                      disabled={confirm.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => void verifyAndCredit(activeRef)}
                      loading={confirm.isPending}
                      leftIcon={<Search size={14} />}
                    >
                      I already paid
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
                              ₦{a.toLocaleString()}
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
                          placeholder="Minimum ₦500"
                          min={500}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-surface-border bg-surface-elevated/60 p-4">
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-ink-muted">Amount</dt>
                          <dd className="font-mono text-ink-primary">
                            ₦{Number.isFinite(finalAmount) ? finalAmount.toLocaleString() : '0'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-ink-muted">Processing fee (1.5%)</dt>
                          <dd className="font-mono text-ink-primary">₦{fee.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between border-t border-surface-border pt-2">
                          <dt className="text-sm font-semibold text-ink-primary">Total</dt>
                          <dd className="font-mono text-lg font-bold text-ink-primary">
                            ₦{total.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {(isDemo || !squadConfig?.squadConfigured) && (
                      <div className="flex items-start gap-2 rounded-xl border border-status-suspicious/25 bg-status-suspicious-bg p-3 text-xs text-ink-primary">
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-status-suspicious" />
                        <span>
                          {isDemo
                            ? 'You\'re in demo mode — clicking Pay with Squad will walk through a simulated checkout and credit your local wallet.'
                            : "Real Squad payments are disabled because the server keys aren't set. This button will simulate the credit so you can keep demoing the flow."}
                        </span>
                      </div>
                    )}

                    <Button
                      fullWidth
                      size="lg"
                      onClick={handleCardSubmit}
                      loading={cardButtonLoading}
                      leftIcon={<Zap size={14} />}
                      disabled={!user?.email && squadConfig?.squadConfigured}
                    >
                      {cardButtonLabel}
                    </Button>

                    {squadConfig?.squadConfigured && !user?.email && (
                      <p className="text-center text-[11px] text-status-fake">
                        No email on your account — add one or use the simulated flow.
                      </p>
                    )}
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
                        Demo transfers credit through the same wallet ledger used by card payments.
                      </p>
                    </div>

                    <Button
                      fullWidth
                      size="lg"
                      className="mt-4"
                      onClick={submitTransfer}
                      loading={fallbackTopup.isPending}
                      leftIcon={<CheckCircle2 size={14} />}
                    >
                      Credit Demo Transfer
                    </Button>
                  </div>
                )}
              </>
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
