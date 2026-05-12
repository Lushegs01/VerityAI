import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Database,
  FileSearch,
  Layers,
  Lock,
  Menu,
  ShieldCheck,
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import { Counter } from '@/components/ui-system/Counter'
import TrustScoreRing from '@/components/trust/TrustScoreRing'
import { BrandMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

/* ---------- Navbar ---------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#api', label: 'API Docs' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-all duration-300',
          scrolled
            ? 'border-b border-surface-border bg-surface-base/80 backdrop-blur-xl py-4'
            : 'border-b border-transparent bg-transparent py-6',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size={36} />
            <span className="font-display text-xl font-black lowercase tracking-tighter text-ink-primary">
              verity
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 sm:inline-flex">
              <span className="relative flex size-1.5 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Demo
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group relative font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-secondary hover:text-ink-primary transition-colors"
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 origin-left bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(5,150,105,0.6)] transition-all hover:bg-primary-dark hover:shadow-[0_0_20px_rgba(5,150,105,0.4)]"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-card text-ink-primary lg:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-surface-base lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                <BrandMark size={30} />
                <span className="font-display text-xl font-black lowercase tracking-tighter text-ink-primary">
                  verity
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex size-10 items-center justify-center rounded-xl border border-surface-border text-ink-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-10 flex flex-col items-start gap-6 px-6">
              {links.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="font-display text-4xl font-black uppercase tracking-tighter text-ink-primary hover:text-primary transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-white"
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="pointer-events-none absolute -top-20 left-1/3 -z-10 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-accent-cyan/10 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Forensic Credential Engine
            </span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 font-display font-black uppercase leading-[0.95] tracking-[-0.02em] text-[10.5vw] sm:text-[8vw] lg:text-[5.5vw]"
          >
            <span className="block text-ink-primary">Verify Every</span>
            <span className="block bg-gradient-to-r from-primary via-primary-light to-accent-cyan bg-clip-text text-transparent">
              Credential.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-ink-secondary md:text-xl"
          >
            VerityAI is the forensic intelligence layer for hiring teams. Detect
            tampering, validate institutions, and score authenticity in under fifteen
            seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/login"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-10 py-5 text-lg font-bold text-white shadow-[0_15px_40px_-15px_rgba(5,150,105,0.7)] transition-all hover:shadow-[0_20px_50px_-15px_rgba(5,150,105,0.85)] sm:w-auto"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative">Run a Free Scan</span>
              <ArrowRight size={20} className="relative transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-surface-border bg-surface-elevated/30 px-10 py-5 text-lg font-bold text-ink-primary backdrop-blur transition-colors hover:bg-surface-elevated sm:w-auto"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6"
          >
            {[
              { value: 12400, suffix: '+', label: 'Verifications' },
              { value: 98.2, decimals: 1, suffix: '%', label: 'Accuracy' },
              { value: 15, prefix: '<', suffix: 's', label: 'Avg Time' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono text-2xl font-bold text-ink-primary">
                  <Counter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals ?? 0}
                  />
                </p>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column — visual */}
        <HeroVisual />
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25, duration: 0.6 }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[3rem] bg-primary/10 blur-[100px] animate-pulse" />
      <div className="relative overflow-hidden rounded-[3rem] border border-surface-border bg-surface-card/60 p-10 shadow-2xl backdrop-blur-xl">
        {/* Scanner line */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ boxShadow: '0 0 20px rgba(5,150,105,0.5)' }}
        />

        <div className="flex flex-col items-center">
          <TrustScoreRing score={91} size={280} />
          <div className="mt-10 w-full">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Visual Integrity
              </span>
              <span className="font-mono text-[11px] font-black tabular-nums text-status-verified">94%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                className="h-full rounded-full bg-status-verified"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-6 -top-6 rounded-2xl border border-surface-border bg-surface-elevated p-4 shadow-xl backdrop-blur-md"
      >
        <Lock size={20} className="text-accent-cyan" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-6 -left-6 rounded-2xl border border-surface-border bg-surface-elevated p-4 shadow-xl backdrop-blur-md"
      >
        <Database size={20} className="text-primary" />
      </motion.div>
    </motion.div>
  )
}

/* ---------- How It Works ---------- */
function HowItWorks() {
  const steps = [
    {
      n: '01',
      icon: Upload,
      title: 'Upload Credential',
      body: 'Drop a PDF or image and we extract every visible field, then compute a forensic fingerprint of the document.',
    },
    {
      n: '02',
      icon: Brain,
      title: 'AI Forensics',
      body: 'Multi-modal models check signatures, seals, fonts, and metadata for tampering patterns trained on 2M+ documents.',
    },
    {
      n: '03',
      icon: Award,
      title: 'Trust Score',
      body: 'Get a signed verdict, granular sub-scores, and a shareable badge — all in under fifteen seconds.',
    },
  ]
  return (
    <section id="how-it-works" className="bg-surface-card/40 py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary"
          >
            <span className="h-px w-8 bg-primary" /> Process
          </motion.span>
          <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Three steps to <span className="text-primary">certainty</span>.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-surface-border bg-surface-elevated/50 p-10 transition-all hover:border-primary/40"
            >
              <span className="absolute right-6 top-6 font-display text-5xl font-black text-ink-muted/10 transition-colors group-hover:text-primary/10">
                {s.n}
              </span>
              <div className="flex size-16 items-center justify-center rounded-2xl border border-surface-border bg-surface-base transition-colors group-hover:border-primary/30 group-hover:bg-primary/20">
                <s.icon size={26} className="text-primary" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold uppercase text-ink-primary">
                {s.title}
              </h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-ink-secondary">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Features ---------- */
function Features() {
  const features = [
    { icon: FileSearch, title: 'Anomaly Detection', body: 'Catch font swaps, layered edits, and pixel-level inconsistencies.' },
    { icon: Database, title: 'Institution Registry', body: 'Cross-reference against 1,200+ verified institutions worldwide.' },
    { icon: Lock, title: 'Tamper-Proof Badges', body: 'Every verdict gets a cryptographic badge with a public proof URL.' },
    { icon: Zap, title: '< 15s Turnaround', body: 'Bulk verifications complete in parallel for hiring-velocity teams.' },
  ]
  const checklist = [
    'SIGNATURE COMPARISON',
    'METADATA FORENSICS',
    'INSTITUTION MATCH',
    'GRADUATE ROLL LOOKUP',
    'TAMPER VISUALIZATION',
  ]

  return (
    <section id="features" className="relative overflow-hidden py-24 lg:py-40">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute -right-32 top-1/3 -z-10 size-[40rem] opacity-5"
      >
        <svg viewBox="0 0 400 400" className="size-full">
          <circle cx="200" cy="200" r="180" fill="none" stroke="#059669" strokeWidth="1" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="#0E7490" strokeWidth="1" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="#059669" strokeWidth="1" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="#0E7490" strokeWidth="1" />
        </svg>
      </motion.div>

      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Forensic features built for <span className="text-primary">trust teams</span>.
          </h2>
          <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-ink-secondary">
            Every layer of the credential — from pixels to provenance — is interrogated by a
            dedicated model. No black box, just clear evidence.
          </p>
          <ul className="mt-10 space-y-3">
            {checklist.map((c) => (
              <li key={c} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-status-verified" />
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-ink-primary">
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-3xl border border-surface-border bg-surface-card p-8 transition-all hover:border-primary/50 hover:bg-surface-elevated hover:shadow-[0_15px_40px_rgba(5,150,105,0.08)]"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-surface-elevated text-primary">
                <f.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold uppercase text-ink-primary">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Pricing ---------- */
function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '₦500',
      unit: 'scan',
      features: ['Per-scan billing', 'Basic forensic engine', 'Email support', 'Shareable badge'],
      popular: false,
      cta: 'Start scanning',
    },
    {
      name: 'Professional',
      price: '₦12,000',
      unit: 'month',
      features: ['100 scans/mo included', 'Bulk verification', 'Institution registry', 'Priority support', 'API access'],
      popular: true,
      cta: 'Go Pro',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      unit: 'scale',
      features: ['Unlimited scans', 'Dedicated AI workers', 'SLA + compliance', 'SSO + audit logs', 'Solutions engineer'],
      popular: false,
      cta: 'Talk to sales',
    },
  ]

  return (
    <section id="pricing" className="border-y border-surface-border bg-surface-card/20 py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Pricing
          </span>
          <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Pay-as-you-verify.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
          {tiers.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                'relative flex flex-col rounded-3xl border bg-surface-card p-8',
                t.popular
                  ? 'border-primary/30 scale-[1.05] z-10 ring-1 ring-primary/20 shadow-[0_20px_50px_rgba(5,150,105,0.12)]'
                  : 'border-surface-border',
              )}
            >
              {t.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold uppercase text-ink-primary">{t.name}</h3>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-black tabular-nums text-ink-primary">
                  {t.price}
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
                  / {t.unit}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-status-verified" />
                    <span className="text-sm font-medium text-ink-secondary">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={cn(
                  'mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all',
                  t.popular
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-[0_8px_20px_-8px_rgba(5,150,105,0.6)]'
                    : 'border border-surface-border text-ink-primary hover:border-primary/40 hover:bg-surface-elevated',
                )}
              >
                {t.cta} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section className="px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl rounded-[3rem] bg-gradient-to-br from-primary via-primary-dark to-surface-card p-px">
        <div className="rounded-[2.9rem] bg-surface-base/80 px-8 py-24 backdrop-blur md:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-4xl font-black uppercase tracking-tight md:text-6xl">
              Run your first <span className="italic text-primary">forensic scan</span> on us.
            </h2>
            <p className="mt-6 text-lg font-medium text-ink-secondary">
              Sign up today and we'll credit your wallet with a free verification.
            </p>
            <Link
              to="/login"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-lg font-bold text-white shadow-[0_15px_40px_-15px_rgba(5,150,105,0.7)] transition-all hover:bg-primary-dark"
            >
              Start free trial <ArrowRight size={18} />
            </Link>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { icon: Lock, label: 'SOC 2 in progress' },
                { icon: ShieldCheck, label: 'GDPR compliant' },
                { icon: Layers, label: '1,200+ institutions' },
              ].map((b) => (
                <div key={b.label} className="flex items-center justify-center gap-2">
                  <b.icon size={18} className="text-primary" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-base py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <BrandMark size={32} />
              <span className="font-display text-xl font-black lowercase tracking-tighter text-ink-primary">
                verity
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-secondary">
              Forensic credential verification for trust-first teams.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="flex size-10 items-center justify-center rounded-full border border-surface-border text-ink-muted transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterLinks
            title="Solution"
            links={['Single verify', 'Bulk verify', 'API access', 'Badge gallery']}
          />
          <FooterLinks
            title="Resources"
            links={['Documentation', 'Status', 'Changelog', 'Security']}
          />

          <div className="col-span-2">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                Engine Room
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="relative flex size-2 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-verified opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-status-verified" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-status-verified">
                  Operational
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-primary to-accent-cyan" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                    Latency
                  </p>
                  <p className="font-mono text-sm font-black tabular-nums text-ink-primary">142ms</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                    Uptime
                  </p>
                  <p className="font-mono text-sm font-black tabular-nums text-ink-primary">99.98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-surface-border pt-8 md:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            © {new Date().getFullYear()} VerityAI · All rights reserved
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink-primary">
              Privacy
            </a>
            <a href="#" className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-ink-primary">
              Terms
            </a>
            <span className="rounded-full border border-surface-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              Powered by Squad
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm font-medium text-ink-secondary hover:text-ink-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Page ---------- */
export default function Landing() {
  return (
    <main className="min-h-screen bg-surface-base">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
