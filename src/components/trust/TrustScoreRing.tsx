import { useEffect, useId, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TrustScoreRingProps {
  score: number
  verdict?: string
  size?: number
  animate?: boolean
  processingStage?: string
  className?: string
}

type Tone = 'verified' | 'suspicious' | 'fake'

function toneFor(score: number): Tone {
  if (score >= 70) return 'verified'
  if (score >= 40) return 'suspicious'
  return 'fake'
}

function verdictFor(score: number, override?: string): string {
  if (override) {
    if (override === 'VERIFIED' || override === 'AUTHENTIC') return 'VERIFIED'
    if (override === 'SUSPICIOUS') return 'SUSPICIOUS'
    return 'LIKELY FAKE'
  }
  const tone = toneFor(score)
  if (tone === 'verified') return 'VERIFIED'
  if (tone === 'suspicious') return 'SUSPICIOUS'
  return 'LIKELY FAKE'
}

const TONE_COLORS: Record<Tone, { stroke: string; glow: string; pill: string }> = {
  verified: {
    stroke: '#059669',
    glow: 'rgba(5, 150, 105, 0.35)',
    pill: 'bg-status-verified-bg text-status-verified border-status-verified/25',
  },
  suspicious: {
    stroke: '#B45309',
    glow: 'rgba(180, 83, 9, 0.35)',
    pill: 'bg-status-suspicious-bg text-status-suspicious border-status-suspicious/25',
  },
  fake: {
    stroke: '#B91C1C',
    glow: 'rgba(185, 28, 28, 0.35)',
    pill: 'bg-status-fake-bg text-status-fake border-status-fake/25',
  },
}

export default function TrustScoreRing({
  score,
  verdict,
  size = 240,
  animate = true,
  processingStage,
  className,
}: TrustScoreRingProps) {
  const tone = toneFor(score)
  const palette = TONE_COLORS[tone]
  const gradientId = useId()
  const glowId = useId()

  const strokeWidth = Math.max(8, Math.round(size * 0.045))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius

  const spring = useSpring(animate ? 0 : score, {
    stiffness: 60,
    damping: 18,
    mass: 1,
  })
  const offset = useTransform(spring, (v) => circumference - (v / 100) * circumference)
  const [shown, setShown] = useState(animate ? 0 : score)

  useEffect(() => {
    spring.set(score)
    if (!animate) {
      return
    }
    const unsub = spring.on('change', (v) => setShown(Math.round(v)))
    return () => unsub()
  }, [score, animate, spring])

  const label = verdictFor(score, verdict)

  return (
    <div className={cn('relative flex flex-col items-center gap-4', className)} style={{ width: size }}>
      {/* Glow */}
      <motion.div
        aria-hidden
        className="absolute -z-10 rounded-full blur-3xl"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          top: size * 0.075,
          left: size * 0.075,
          background: palette.glow,
        }}
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.stroke} />
              <stop offset="100%" stopColor={palette.stroke} stopOpacity="0.75" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--chart-track)"
            strokeWidth={strokeWidth}
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            filter={`url(#${glowId})`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {processingStage ? (
            <div className="px-4 text-center">
              <div className="mx-auto mb-2 size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
                {processingStage}
              </p>
            </div>
          ) : (
            <>
              <span
                className="font-display font-black tabular-nums text-ink-primary"
                style={{ fontSize: Math.max(36, size * 0.26), lineHeight: 1 }}
              >
                {shown}
              </span>
              <span className="mt-1 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-ink-muted">
                / 100
              </span>
            </>
          )}
        </div>
      </div>

      {!processingStage && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.25em]',
            palette.pill,
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              tone === 'verified'
                ? 'bg-status-verified'
                : tone === 'suspicious'
                  ? 'bg-status-suspicious'
                  : 'bg-status-fake',
            )}
          />
          {label}
        </motion.span>
      )}
    </div>
  )
}

export { TrustScoreRing }
