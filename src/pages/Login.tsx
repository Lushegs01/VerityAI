import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
  CreditCard,
  Sparkles,
  CheckCircle,
  FileSearch,
  Brain,
} from 'lucide-react'
import { Paths } from '@contracts/constants'
import { BrandLockup } from '@/components/brand/Logo'

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Secure verification',
    description: 'Every workflow is encrypted, NDPR-compliant, and audit-ready.',
  },
  {
    icon: Brain,
    title: 'AI-assisted review',
    description: 'GPT-4o Vision forensics flag anomalies in seconds, not weeks.',
  },
  {
    icon: CreditCard,
    title: 'Payment-backed workflow',
    description: 'Squad payments anchor every verification with a financial audit trail.',
  },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.6 12.227c0-.681-.062-1.336-.176-1.964H12v3.71h5.385a4.604 4.604 0 0 1-2 3.023v2.51h3.232c1.89-1.74 2.983-4.305 2.983-7.279z" fill="#4285F4"/>
      <path d="M12 22c2.7 0 4.964-.895 6.617-2.422l-3.232-2.509c-.895.6-2.041.957-3.385.957-2.604 0-4.808-1.758-5.595-4.121H3.07v2.59A9.996 9.996 0 0 0 12 22z" fill="#34A853"/>
      <path d="M6.405 13.905A6.012 6.012 0 0 1 6.09 12c0-.66.114-1.302.314-1.905V7.505H3.07a9.996 9.996 0 0 0 0 8.99l3.335-2.59z" fill="#FBBC05"/>
      <path d="M12 5.974c1.469 0 2.787.505 3.823 1.495l2.867-2.867C16.96 2.99 14.696 2 12 2 8.107 2 4.745 4.234 3.07 7.505l3.335 2.59C7.192 7.732 9.396 5.974 12 5.974z" fill="#EA4335"/>
    </svg>
  )
}

export default function Login() {
  return (
    <div className="min-h-screen overflow-hidden bg-surface-base">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — value proposition */}
        <div className="relative hidden overflow-hidden border-r border-surface-border bg-surface-card lg:flex lg:flex-col lg:p-12">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.5]" aria-hidden />
          <div className="absolute -top-32 -left-32 -z-10 size-[480px] rounded-full bg-primary/15 blur-[120px]" aria-hidden />
          <div className="absolute bottom-0 right-0 -z-10 size-[400px] rounded-full bg-accent-cyan/10 blur-[120px]" aria-hidden />

          <Link to="/" className="block">
            <BrandLockup size={42} gapColor="hsl(var(--surface-card))" />
          </Link>

          <div className="mt-auto max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles size={12} />
              Trust Engine for institutions
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-ink-primary">
              AI-Powered Verification for a Trust-First Economy
            </h1>
            <p className="mt-5 text-base text-ink-secondary">
              Sign in to verify documents, generate trust scores, and unlock payment-backed
              verification workflows in seconds.
            </p>

            <div className="mt-10 space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <b.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{b.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-surface-border bg-surface-elevated/50 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-status-verified/15 text-status-verified ring-1 ring-status-verified/30">
                <FileSearch size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-primary">Live: 124,847 documents verified</p>
                <p className="text-xs text-ink-muted">80% faster than manual review &middot; NDPR compliant</p>
              </div>
              <CheckCircle size={16} className="text-status-verified" />
            </div>
          </div>
        </div>

        {/* RIGHT — auth panel */}
        <div className="relative flex flex-col px-5 py-10 sm:px-12 lg:p-12">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-30 lg:hidden" aria-hidden />

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink-primary self-start"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="my-auto mx-auto w-full max-w-md py-10">
            <div className="lg:hidden mb-8">
              <BrandLockup size={40} showSubtitle={false} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-surface-border bg-surface-card p-7 sm:p-9 shadow-soft"
            >
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-primary">
                Sign in to Verity
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Continue with your work account to access the verification dashboard.
              </p>

              <button
                type="button"
                onClick={() => {
                  window.location.href = Paths.oauthStart
                }}
                className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-surface-elevated text-sm font-semibold text-ink-primary transition-all hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-surface-border" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Secure SSO</span>
                <span className="h-px flex-1 bg-surface-border" />
              </div>

              <ul className="space-y-2.5">
                {[
                  'SSO through Google Workspace',
                  'No passwords stored on our servers',
                  'NDPR-compliant data handling',
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2 text-xs text-ink-secondary">
                    <CheckCircle size={13} className="text-status-verified" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center justify-between rounded-xl border border-surface-border bg-surface-elevated/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-ink-muted" />
                  <span className="text-[11px] text-ink-muted">256-bit encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={13} className="text-ink-muted" />
                  <span className="text-[11px] text-ink-muted">Powered by Squad</span>
                </div>
              </div>
            </motion.div>

            <p className="mt-6 text-center text-xs text-ink-muted">
              By signing in you agree to our{' '}
              <a href="#" className="text-ink-secondary underline-offset-2 hover:underline">Terms</a> and{' '}
              <a href="#" className="text-ink-secondary underline-offset-2 hover:underline">Privacy Policy</a>.
            </p>

            <div className="mt-10 hidden lg:flex items-center justify-center gap-2 text-xs text-ink-muted">
              <span>New to Verity?</span>
              <Link to="/" className="inline-flex items-center gap-1 font-semibold text-ink-secondary hover:text-ink-primary">
                See how it works
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
