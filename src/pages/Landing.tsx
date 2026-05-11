import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Upload,
  Brain,
  Award,
  CheckCircle,
  Building2,
  Lock,
  Zap,
  Menu,
  X,
  ArrowRight,
  CreditCard,
  FileSearch,
  AlertTriangle,
  Activity,
  FileText,
  Eye,
  Sparkles,
  Database,
  Workflow,
  Layers,
  TrendingUp,
  Clock,
} from 'lucide-react'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { Button } from '@/components/ui-system'
import { BrandLockup } from '@/components/brand/Logo'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1800
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      setCount(Math.round(target * progress))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref} className="font-mono font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function HeroDashboard() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const i = setInterval(() => {
      setStage((s) => (s + 1) % 5)
    }, 1800)
    return () => clearInterval(i)
  }, [])

  const stages = [
    { icon: Upload, label: 'Document uploaded', tone: 'info' },
    { icon: FileSearch, label: 'AI scan running', tone: 'info' },
    { icon: CreditCard, label: 'Payment confirmed', tone: 'success' },
    { icon: Sparkles, label: 'Trust score generated', tone: 'success' },
    { icon: ShieldCheck, label: 'Verified', tone: 'success' },
  ] as const

  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 via-accent-cyan/10 to-accent-emerald/10 blur-3xl rounded-[2.5rem]" aria-hidden />
      <div className="relative rounded-3xl border border-surface-border bg-surface-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border bg-surface-elevated/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-status-fake/70" />
            <span className="size-2.5 rounded-full bg-status-suspicious/70" />
            <span className="size-2.5 rounded-full bg-status-verified/70" />
          </div>
          <p className="font-mono text-[10px] text-ink-muted">verity.app/verify</p>
          <Lock size={11} className="text-ink-muted" />
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Live verification</p>
              <p className="mt-1 font-display text-base font-bold text-ink-primary">VRT-A7K2P</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-status-verified/30 bg-status-verified/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-status-verified">
              <span className="size-1.5 rounded-full bg-status-verified animate-pulse" />
              Verified
            </span>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface-elevated/40 p-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent-cyan/10 border border-primary/15">
              <FileText size={22} className="text-primary" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-status-verified text-white shadow-md">
                <CheckCircle size={12} strokeWidth={3} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-primary">BSc_Transcript_UNILAG.pdf</p>
              <p className="text-[11px] text-ink-muted">Adebayo Adeniran &middot; University of Lagos</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-muted">Trust</p>
              <p className="mt-1 font-mono text-xl font-bold text-status-verified">92</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-muted">Risk</p>
              <p className="mt-1 text-sm font-bold text-status-verified">Low</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-elevated/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-muted">AI Conf</p>
              <p className="mt-1 font-mono text-sm font-bold text-ink-primary">96%</p>
            </div>
          </div>

          <div className="space-y-2">
            {stages.map((s, i) => {
              const done = i <= stage
              const active = i === stage
              return (
                <motion.div
                  key={s.label}
                  initial={false}
                  animate={{ opacity: done ? 1 : 0.35 }}
                  className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated/30 px-3 py-2.5"
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-all ${
                      done
                        ? 'bg-status-verified/15 text-status-verified ring-1 ring-status-verified/30'
                        : 'bg-surface-elevated text-ink-muted'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      >
                        <s.icon size={13} />
                      </motion.span>
                    ) : done ? (
                      <CheckCircle size={13} strokeWidth={3} />
                    ) : (
                      <s.icon size={13} />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${done ? 'text-ink-primary' : 'text-ink-muted'}`}>
                    {s.label}
                  </span>
                  {active && (
                    <span className="ml-auto text-[10px] text-primary">Processing...</span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-surface-border bg-surface-elevated/40 px-5 py-3">
          <CreditCard size={12} className="text-ink-muted" />
          <span className="text-[10px] font-medium text-ink-muted">
            Payment verified via <span className="text-ink-primary">Squad</span>
          </span>
          <span className="ml-auto font-mono text-[10px] text-ink-muted">N500.00</span>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: Brain,
    title: 'AI Document Analysis',
    description: 'GPT-4o Vision forensics scan every certificate for typography, seals, data anomalies and security features.',
  },
  {
    icon: Award,
    title: 'Trust Score Generation',
    description: '0-100 trust score with explainable breakdown across visual, data, institutional and security signals.',
  },
  {
    icon: CreditCard,
    title: 'Payment-Backed Workflow',
    description: 'Every verification is unlocked by a Squad-secured payment, creating an auditable financial trail.',
  },
  {
    icon: Workflow,
    title: 'Admin Review Dashboard',
    description: 'Institutional queue with filters, search, status badges, and one-click decision workflow.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Flags & Audit Trail',
    description: 'Granular flag taxonomy by severity, with a full timeline for compliance and review.',
  },
  {
    icon: Database,
    title: 'CSV / Report Export',
    description: 'Export verification results, scores, and payment records for board-level reporting.',
  },
]

const problemPoints = [
  { value: 'N18B+', label: 'Annual fraud cost', sub: 'from forged Nigerian academic documents' },
  { value: '14 days', label: 'Manual review time', sub: 'per single institutional verification' },
  { value: '23%', label: 'Of CVs contain falsehoods', sub: 'around credentials, dates or results' },
]

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-surface-base text-ink-primary">
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-surface-base/85 backdrop-blur-xl border-b border-surface-border'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="block">
            <BrandLockup size={36} showSubtitle={false} />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <a href="#how" className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">How it works</a>
            <a href="#features" className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">Features</a>
            <a href="#squad" className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">Payments</a>
            <a href="#impact" className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">Impact</a>
            <Link to="/login" className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">Sign in</Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-600 hover:shadow-glow"
            >
              Start verification
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:text-ink-primary"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-surface-border bg-surface-card md:hidden"
            >
              <div className="space-y-1 p-3">
                <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary">How it works</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary">Features</a>
                <a href="#squad" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary">Payments</a>
                <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary">Impact</a>
                <Link to="/login" className="block rounded-lg border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-ink-primary">Sign in</Link>
                <Link to="/login" className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Start verification</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.4]" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-surface-base/40 to-surface-base" aria-hidden />
        <div className="absolute left-1/2 top-0 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden />
        <div className="absolute right-1/4 top-1/3 -z-10 size-[400px] rounded-full bg-accent-cyan/10 blur-[120px]" aria-hidden />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Squad Hackathon 3.0 - AI Trust Engine
                </span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                AI-Powered Verification for a{' '}
                <span className="text-gradient">Trust-First Economy</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
                Verity helps institutions verify documents, identities, payments and risk
                signals using intelligent automation and secure financial workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login">
                  <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                    Start Verification
                  </Button>
                </Link>
                <a href="#how">
                  <Button size="lg" variant="outline" leftIcon={<Eye size={16} />}>
                    View Demo
                  </Button>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={12} className="text-status-verified" />
                  256-bit encrypted
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-status-verified" />
                  NDPR compliant
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard size={12} className="text-status-verified" />
                  Powered by Squad
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <HeroDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="relative py-10 border-y border-surface-border bg-surface-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: 124847, suffix: '', label: 'Documents verified' },
              { value: 80, suffix: '%', label: 'Faster than manual' },
              { value: 15, suffix: 's', label: 'Avg. trust score time' },
              { value: 200, suffix: '+', label: 'Institutions covered' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl tracking-tight text-ink-primary sm:text-3xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-status-fake/20 bg-status-fake/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-status-fake">
              The trust crisis
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              Fake credentials are quietly bleeding institutions.
            </h2>
            <p className="mt-4 text-base text-ink-secondary">
              Universities, employers, banks and regulators still rely on slow, manual processes
              to detect fraudulent documents — at enormous human and financial cost.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {problemPoints.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-surface-border bg-surface-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-status-fake/10 text-status-fake border border-status-fake/20">
                  <AlertTriangle size={18} />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-status-fake tracking-tight">
                  {p.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink-primary">{p.label}</p>
                <p className="mt-1 text-sm text-ink-muted">{p.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION / HOW IT WORKS */}
      <section id="how" className="relative py-20 px-4 sm:px-6 border-y border-surface-border bg-surface-card/30">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              The solution
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              Three steps. Verified in seconds.
            </h2>
            <p className="mt-4 text-base text-ink-secondary">
              From upload to trust score, Verity compresses weeks of manual review into a single,
              auditable, payment-backed workflow.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Document',
                desc: 'Drop in a PDF or image of a certificate, transcript, or identity document. We accept WAEC, NECO, BSc, HND, NYSC and more.',
              },
              {
                step: '02',
                icon: CreditCard,
                title: 'Confirm Payment',
                desc: 'Squad secures the verification fee. Every check is financially anchored, creating an auditable institutional record.',
              },
              {
                step: '03',
                icon: Brain,
                title: 'AI Verify',
                desc: 'Our forensic engine runs visual, data, anomaly and institutional checks — and returns a 0-100 trust score with explainable flags.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-6 transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <div className="absolute -right-6 -top-6 font-display text-[7rem] font-black leading-none text-surface-elevated transition-colors group-hover:text-primary/5">
                  {item.step}
                </div>
                <div className="relative flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 to-accent-cyan/5">
                  <item.icon size={20} className="text-primary" />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-bold text-ink-primary tracking-tight">
                  {item.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-block rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-cyan">
                Built for institutions
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
                A complete verification platform.
              </h2>
            </div>
            <p className="max-w-md text-base text-ink-secondary">
              Everything an admissions officer, HR lead, regulator or financial institution needs
              to verify documents at scale — with confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-surface-border bg-surface-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                  <f.icon size={18} className="text-primary" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-ink-primary tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SQUAD PAYMENTS */}
      <section id="squad" className="relative py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-br from-surface-card via-surface-card to-primary/5">
            <div className="grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  Payments at the core
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
                  Every verification is a financial event.
                </h2>
                <p className="mt-4 text-base text-ink-secondary">
                  Squad payments aren't a checkout step — they're the trust anchor. Each AI scan
                  is unlocked by a confirmed transaction, creating a tamper-evident, auditable
                  trail across applicants, institutions, and regulators.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    { icon: Lock, text: 'Verifications only run after payment is confirmed' },
                    { icon: Activity, text: 'Wallet ledger doubles as the audit trail' },
                    { icon: TrendingUp, text: 'Refund logic for failed or disputed scans' },
                    { icon: Layers, text: 'Per-verification, bulk or enterprise billing' },
                  ].map((p) => (
                    <li key={p.text} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <p.icon size={12} />
                      </span>
                      <span className="text-sm text-ink-secondary">{p.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-3xl" aria-hidden />
                <div className="relative rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-surface-border pb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Payment receipt</p>
                      <p className="mt-1 font-mono text-xs text-ink-primary">SQUAD-1718654321</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-status-verified/30 bg-status-verified/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-status-verified">
                      <CheckCircle size={11} strokeWidth={3} />
                      Confirmed
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Purpose</span>
                      <span className="font-medium text-ink-primary">Verification fee</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Reference</span>
                      <span className="font-mono text-ink-primary">VRT-A7K2P</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Time</span>
                      <span className="text-ink-primary">11 May 2026, 14:32</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Method</span>
                      <span className="text-ink-primary">Card &middot; Squad</span>
                    </div>
                    <div className="flex justify-between border-t border-surface-border pt-3">
                      <span className="text-sm font-semibold text-ink-primary">Total</span>
                      <span className="font-mono text-lg font-bold text-ink-primary">N500.00</span>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2">
                    <CreditCard size={12} className="text-ink-muted" />
                    <span className="text-[11px] text-ink-muted">
                      Secured by <span className="text-ink-primary">Squad Payments</span>
                    </span>
                    <Lock size={11} className="ml-auto text-ink-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT METRICS */}
      <section id="impact" className="py-20 px-4 sm:px-6 border-t border-surface-border bg-surface-card/40">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-status-verified/20 bg-status-verified/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-status-verified">
              Measurable impact
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              Built to scale trust, not headcount.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, value: '80%', label: 'Faster verification', sub: 'vs. manual workflows' },
              { icon: TrendingUp, value: '12x', label: 'Throughput uplift', sub: 'per reviewer per day' },
              { icon: AlertTriangle, value: '4.2%', label: 'Forgery catch rate', sub: 'across pilot cohorts' },
              { icon: Building2, value: 'Inst.', label: 'Institution-ready', sub: 'SOC-grade audit trail' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-surface-border bg-surface-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.icon size={18} />
                </div>
                <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-primary">{m.value}</p>
                <p className="mt-1 text-sm font-semibold text-ink-primary">{m.label}</p>
                <p className="mt-1 text-xs text-ink-muted">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.4]" aria-hidden />
        <div className="absolute left-1/2 top-1/2 -z-10 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px]" aria-hidden />
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Get started
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-primary sm:text-5xl">
            Build trust into every verification workflow.
          </h2>
          <p className="mt-5 text-lg text-ink-secondary">
            Sign in to start your first AI verification in under 60 seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                Start Verifying Now
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline">
                Read the workflow
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-surface-border bg-surface-card/40 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <BrandLockup size={32} showSubtitle={false} />
              <p className="mt-3 text-sm text-ink-muted">
                AI-powered verification for institutions, employers, and a trust-first economy.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: [
                  { label: 'Verification flow', href: '#how' },
                  { label: 'Features', href: '#features' },
                  { label: 'Payments', href: '#squad' },
                  { label: 'Impact', href: '#impact' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '#' },
                  { label: 'Privacy', href: '#' },
                  { label: 'Terms', href: '#' },
                  { label: 'Contact', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{col.title}</p>
                <div className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <a key={l.label} href={l.href} className="block text-sm text-ink-secondary hover:text-ink-primary">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Trust</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] text-ink-secondary">
                  <Lock size={10} /> 256-bit
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] text-ink-secondary">
                  <ShieldCheck size={10} /> NDPR
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] text-ink-secondary">
                  <Zap size={10} /> Squad
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-muted">
              &copy; {new Date().getFullYear()} Verity &middot; Built for Squad Hackathon 3.0
            </p>
            <p className="text-xs text-ink-muted">Trust, Verified.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
