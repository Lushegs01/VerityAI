import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { Paths } from '@contracts/constants'
import { Button } from '@/components/ui-system'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.6 12.227c0-.681-.062-1.336-.176-1.964H12v3.71h5.385a4.604 4.604 0 0 1-2 3.023v2.51h3.232c1.89-1.74 2.983-4.305 2.983-7.279z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.617-2.422l-3.232-2.509c-.895.6-2.041.957-3.385.957-2.604 0-4.808-1.758-5.595-4.121H3.07v2.59A9.996 9.996 0 0 0 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.405 13.905A6.012 6.012 0 0 1 6.09 12c0-.66.114-1.302.314-1.905V7.505H3.07a9.996 9.996 0 0 0 0 8.99l3.335-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.974c1.469 0 2.787.505 3.823 1.495l2.867-2.867C16.96 2.99 14.696 2 12 2 8.107 2 4.745 4.234 3.07 7.505l3.335 2.59C7.192 7.732 9.396 5.974 12 5.974z"
        fill="#EA4335"
      />
    </svg>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return Math.min(3, s)
  }, [password])

  const bars = [
    score >= 1 ? 'bg-status-fake' : 'bg-surface-elevated',
    score >= 2 ? 'bg-status-suspicious' : 'bg-surface-elevated',
    score >= 3 ? 'bg-status-verified' : 'bg-surface-elevated',
  ]

  return (
    <div className="mt-2 flex gap-1">
      {bars.map((c, i) => (
        <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', c)} />
      ))}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
  error?: string
  rightSlot?: React.ReactNode
}

function FormField({ label, icon, error, rightSlot, id, ...props }: InputProps) {
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted"
        >
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'h-12 w-full rounded-xl border bg-surface-elevated text-sm font-medium text-ink-primary placeholder:text-ink-muted/70 focus:outline-none focus:ring-1 focus:ring-primary',
            icon ? 'pl-11 pr-4' : 'px-4',
            error
              ? 'border-status-fake/60 focus:border-status-fake'
              : 'border-surface-border focus:border-primary',
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-status-fake">{error}</p>}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>('login')
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [password, setPassword] = useState('')
  const [oauthError, setOauthError] = useState<string | null>(null)

  const isRegister = mode === 'register'

  useEffect(() => {
    const err = searchParams.get('oauth_error')
    if (err) {
      setOauthError(err)
      const next = new URLSearchParams(searchParams)
      next.delete('oauth_error')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-base px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 size-[28rem] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 size-[28rem] rounded-full bg-accent-cyan/5 blur-[120px]" />

      <Link
        to="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-primary"
      >
        <ArrowLeft size={14} /> Back home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-3xl border border-surface-border bg-surface-card p-8 shadow-2xl md:p-10"
      >
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={22} />
          </span>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles size={10} className="mr-1 inline" /> VerityAI
            </span>
            <p className="font-display text-2xl font-black uppercase tracking-tight text-ink-primary md:text-3xl">
              {isRegister ? 'Create Account' : 'Sign In'}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-ink-secondary">
          {isRegister
            ? 'Join 1,200+ employers verifying smarter.'
            : 'Welcome back to the forensic engine.'}
        </p>

        {oauthError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-start gap-3 rounded-2xl border border-status-fake/30 bg-status-fake-bg p-4"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-fake" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-status-fake">
                Google Sign-In Failed
              </p>
              <p className="mt-1 break-words text-xs font-medium text-ink-secondary">
                {oauthError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOauthError(null)}
              aria-label="Dismiss"
              className="font-mono text-[10px] font-bold uppercase text-ink-muted hover:text-ink-primary"
            >
              ✕
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegister && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Full Name" icon={<User size={16} />} placeholder="Ada Lovelace" />
              <FormField label="Company" icon={<Building2 size={16} />} placeholder="VerityAI" />
            </div>
          )}

          <FormField
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            placeholder="you@company.com"
            required
          />

          <div className={isRegister ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : ''}>
            <div>
              <FormField
                label="Password"
                type={showPw ? 'text' : 'password'}
                icon={<Lock size={16} />}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                rightSlot={
                  !isRegister && (
                    <a
                      href="#"
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-dark"
                    >
                      Forgot password?
                    </a>
                  )
                }
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="-mt-12 ml-auto mr-3 flex size-8 items-center justify-center rounded-md text-ink-muted hover:text-ink-primary"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {isRegister && <PasswordStrength password={password} />}
            </div>

            {isRegister && (
              <div>
                <FormField
                  label="Confirm Password"
                  type={showPw2 ? 'text' : 'password'}
                  icon={<Lock size={16} />}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="-mt-12 ml-auto mr-3 flex size-8 items-center justify-center rounded-md text-ink-muted hover:text-ink-primary"
                  aria-label="Toggle password visibility"
                >
                  {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" className="text-base">
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-surface-border" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-surface-border" />
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = Paths.oauthStart
          }}
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-surface-elevated text-sm font-bold text-ink-primary transition-all hover:border-primary/40 hover:bg-surface-hover"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <p className="mt-8 text-center text-sm font-medium text-ink-secondary">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(isRegister ? 'login' : 'register')}
            className="font-bold text-primary hover:text-primary-dark"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
