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
} from 'lucide-react'
import ThemeToggle from '@/components/layout/ThemeToggle'
import TrustScoreRing from '@/components/trust/TrustScoreRing'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
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

const certTypes = [
  { name: 'WAEC', icon: Award },
  { name: 'NECO', icon: Award },
  { name: 'NABTEB', icon: Award },
  { name: 'BSc / BA', icon: GraduationCap },
  { name: 'HND', icon: GraduationCap },
  { name: 'OND', icon: GraduationCap },
  { name: 'NYSC', icon: ShieldCheck },
  { name: 'ICAN', icon: Building2 },
  { name: 'COREN', icon: Building2 },
]

function GraduationCap({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.66 4 3 6 3s6-1.34 6-3v-5" />
    </svg>
  )
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoMode, setDemoMode] = useState<'genuine' | 'fake'>('genuine')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const genuineResult = {
    trustScore: 91,
    verdict: 'VERIFIED',
    name: 'Adebayo Adeniran',
    institution: 'University of Lagos',
    type: 'BSc',
    flags: [],
  }

  const fakeResult = {
    trustScore: 19,
    verdict: 'LIKELY_FAKE',
    name: 'Ifeanyi Chukwu',
    institution: 'WAEC',
    type: 'WAEC',
    flags: [
      { type: 'FONT_INCONSISTENCY', severity: 'HIGH' as const, description: 'Font weight inconsistent' },
      { type: 'REG_FORMAT_INVALID', severity: 'CRITICAL' as const, description: 'Invalid registration number' },
      { type: 'IMPLAUSIBLE_GRADES', severity: 'MEDIUM' as const, description: '8 A1 grades statistically rare' },
    ],
  }

  const currentDemo = demoMode === 'genuine' ? genuineResult : fakeResult

  return (
    <div className="min-h-screen bg-surface-base">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-card/80 backdrop-blur-md border-b border-surface-border'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-ink-primary">Verity</span>
              <span className="text-[10px] text-ink-muted ml-2 tracking-wider uppercase">Trust, Verified.</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors">How It Works</a>
            <a href="#types" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors">Certificates</a>
            <a href="#pricing" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors">Pricing</a>
            <Link to="/login" className="text-sm text-ink-secondary hover:text-ink-primary transition-colors">Log In</Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-10 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:text-ink-primary"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
              <div className="space-y-2 p-4">
                <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-transparent px-3 py-2.5 text-sm text-ink-secondary transition-colors hover:border-surface-border hover:bg-surface-elevated hover:text-ink-primary">How It Works</a>
                <a href="#types" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-transparent px-3 py-2.5 text-sm text-ink-secondary transition-colors hover:border-surface-border hover:bg-surface-elevated hover:text-ink-primary">Certificates</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-transparent px-3 py-2.5 text-sm text-ink-secondary transition-colors hover:border-surface-border hover:bg-surface-elevated hover:text-ink-primary">Pricing</a>
                <Link to="/login" className="block rounded-lg border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-primary">Log In</Link>
                <Link to="/login" className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-surface-border px-4 pb-20 pt-32 sm:px-6">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap size={12} className="text-primary" />
                <span className="text-xs font-medium text-primary">Squad Hackathon 3.0 Entry</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink-primary leading-tight mb-6">
                Certificate Fraud{' '}
                <span className="text-gradient">Ends Here.</span>
              </h1>
              <p className="text-lg text-ink-secondary leading-relaxed mb-8 max-w-lg">
                Verity's AI forensics engine verifies any Nigerian academic certificate in under 15 seconds. 
                Trust, Verified.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Verify a Certificate
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-6 py-3 font-medium text-ink-primary transition-colors hover:bg-surface-hover"
                >
                  See It In Action
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative w-full max-w-sm rounded-lg border border-surface-border bg-surface-card">
                <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Verification report</p>
                    <p className="mt-1 text-sm font-medium text-ink-primary">Live certificate scan</p>
                  </div>
                  <span className="rounded-md border border-status-verified/20 bg-status-verified/10 px-2 py-1 text-[10px] font-bold uppercase text-status-verified">
                    Clean
                  </span>
                </div>
                <div className="p-8">
                  <TrustScoreRing score={87} verdict="VERIFIED" size={210} />
                  <div className="mt-5 text-center">
                    <p className="text-sm font-medium text-ink-primary">Adebayo Adeniran</p>
                    <p className="text-xs text-ink-muted">BSc - University of Lagos</p>
                    <span className="mt-3 inline-block rounded-full border border-status-verified/20 bg-status-verified/10 px-3 py-1 text-[10px] font-bold uppercase text-status-verified">
                      VERIFIED
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-surface-border text-center">
                  {[
                    { label: 'AI match', value: '96%' },
                    { label: 'Checks', value: '18' },
                    { label: 'Time', value: '12s' },
                  ].map((metric) => (
                    <div key={metric.label} className="border-r border-surface-border px-3 py-4 last:border-r-0">
                      <p className="font-mono text-sm font-bold text-ink-primary">{metric.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-muted">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="py-10 border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 124847, suffix: '', label: 'Certificates Verified' },
              { value: 12.4, suffix: '%', label: 'Fakes Caught' },
              { value: 15, suffix: 's', label: 'Average Speed' },
              { value: 200, suffix: '+', label: 'Institutions Known' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl text-ink-primary">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-ink-muted mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-ink-primary mb-3">How It Works</h2>
            <p className="text-ink-secondary">Three simple steps to verify any certificate</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload, step: '01', title: 'Upload', desc: 'Drag and drop any certificate image or PDF. Supports WAEC, NECO, BSc, HND, NYSC, and more.' },
              { icon: Brain, step: '02', title: 'AI Analyzes', desc: 'GPT-4o Vision performs forensic analysis checking typography, seals, data consistency, and security features.' },
              { icon: Award, step: '03', title: 'Get Trust Score', desc: 'Receive a 0-100 trust score with detailed verdict, AI reasoning, and actionable flags in under 15 seconds.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                className="group relative rounded-lg border border-surface-border bg-surface-card p-6 transition-colors hover:border-primary/20"
              >
                <div className="absolute top-4 right-4 text-5xl font-display font-bold text-surface-elevated group-hover:text-primary/5 transition-colors">
                  {item.step}
                </div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <item.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display text-lg text-ink-primary mb-2">{item.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SCORE DEMO */}
      <section id="demo" className="py-20 px-4 sm:px-6 bg-surface-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-ink-primary mb-3">See It In Action</h2>
            <p className="text-ink-secondary mb-6">Toggle between genuine and fake certificate analysis</p>
            <div className="inline-flex gap-2 rounded-lg border border-surface-border bg-surface-elevated p-1">
              <button
                onClick={() => setDemoMode('genuine')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  demoMode === 'genuine'
                    ? 'bg-status-verified/10 text-status-verified border border-status-verified/20'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                Genuine Certificate
              </button>
              <button
                onClick={() => setDemoMode('fake')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  demoMode === 'fake'
                    ? 'bg-status-fake/10 text-status-fake border border-status-fake/20'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                Fake Certificate
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={demoMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg border border-surface-border bg-surface-card p-6 sm:p-8"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <TrustScoreRing
                    score={currentDemo.trustScore}
                    verdict={currentDemo.verdict}
                    size={200}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-ink-primary mb-2">
                    {currentDemo.name}
                  </h3>
                  <p className="text-sm text-ink-muted mb-4">
                    {currentDemo.type} - {currentDemo.institution}
                  </p>

                  {currentDemo.flags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-2">
                        AI Flags Detected
                      </p>
                      {currentDemo.flags.map((flag, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.15 }}
                          className={`p-3 rounded-lg border ${
                            flag.severity === 'CRITICAL'
                              ? 'bg-status-fake/5 border-status-fake/20 text-status-fake'
                              : flag.severity === 'HIGH'
                                ? 'bg-orange-400/5 border-orange-400/20 text-orange-400'
                                : 'bg-status-suspicious/5 border-status-suspicious/20 text-status-suspicious'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase">{flag.severity}</span>
                          <p className="text-sm">{flag.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {currentDemo.flags.length === 0 && (
                    <div className="p-4 rounded-lg bg-status-verified/5 border border-status-verified/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-status-verified" />
                        <span className="text-sm text-status-verified font-medium">
                          All security checks passed. No flags detected.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CERTIFICATE TYPES */}
      <section id="types" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-ink-primary mb-3">Supported Certificates</h2>
            <p className="text-ink-secondary">We verify all major Nigerian academic credentials</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
            {certTypes.map((ct) => (
              <motion.div
                key={ct.name}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 rounded-lg border border-surface-border bg-surface-card p-4 transition-colors hover:border-primary/20"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-surface-elevated">
                  <ct.icon size={18} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-ink-primary text-center">{ct.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-surface-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl text-ink-primary mb-3">Pricing</h2>
            <p className="text-ink-secondary">Choose the plan that works for your organization</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: 'N0', desc: 'For individuals', features: ['5 verifications/month', 'Single verify only', 'Basic reports', 'Email support'], cta: 'Get Started', highlighted: false },
              { name: 'Pro', price: 'N50,000', desc: 'Per month', features: ['200 verifications', 'Bulk upload (50 files)', 'Team of 5 members', 'Detailed PDF reports', 'Priority support'], cta: 'Start Pro Trial', highlighted: true },
              { name: 'Enterprise', price: 'Custom', desc: 'Contact us', features: ['Unlimited verifications', 'API access', 'Unlimited team', 'White-label option', 'Dedicated account manager'], cta: 'Contact Sales', highlighted: false },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -4 }}
                className={`relative rounded-lg border p-6 ${
                  plan.highlighted
                    ? 'border-primary bg-primary/5'
                    : 'border-surface-border bg-surface-card'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-lg text-ink-primary mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-mono text-3xl font-bold text-ink-primary">{plan.price}</span>
                  {plan.desc !== 'Per month' && plan.desc !== 'Contact us' && (
                    <span className="text-xs text-ink-muted">/month</span>
                  )}
                </div>
                <p className="text-xs text-ink-muted mb-4">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-secondary">
                      <CheckCircle size={14} className="text-status-verified flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-surface-elevated border border-surface-border text-ink-primary hover:bg-surface-hover'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 border-t border-surface-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <ShieldCheck className="text-white" size={16} />
                </div>
                <span className="font-display font-bold text-ink-primary">Verity</span>
              </div>
              <p className="text-sm text-ink-muted">
                Nigeria's AI Truth Engine for Academic Credentials.
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">Product</p>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">Single Verify</a>
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">Bulk Verify</a>
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">Self-Verify</a>
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">API</a>
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">Company</p>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">About</a>
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">Privacy</a>
                <a href="#" className="block text-sm text-ink-secondary hover:text-ink-primary">Terms</a>
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold mb-3">Trust</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-elevated text-[10px] text-ink-muted">
                  <Lock size={10} /> 256-bit Encryption
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-elevated text-[10px] text-ink-muted">
                  <ShieldCheck size={10} /> NDPR Compliant
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-elevated text-[10px] text-ink-muted">
                  <Zap size={10} /> Squad Powered
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-surface-border pt-6 text-center">
            <p className="text-xs text-ink-muted">
              &copy; 2024 Verity. Built for Squad Hackathon 3.0. Trust, Verified.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
