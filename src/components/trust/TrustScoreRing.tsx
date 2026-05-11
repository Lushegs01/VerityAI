import { useEffect, useState, useId } from 'react'
import { motion } from 'framer-motion'

interface TrustScoreRingProps {
  score: number
  verdict: string
  size?: number
  animate?: boolean
  processingStage?: string
}

export default function TrustScoreRing({
  score,
  verdict,
  size = 200,
  animate = true,
  processingStage,
}: TrustScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const strokeWidth = 10
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const visibleScore = animate ? displayScore : score
  const gradientId = useId()

  const getColor = (): [string, string] => {
    if (score >= 85) return ['#10B981', '#22D3EE']
    if (score >= 50) return ['#F59E0B', '#FB923C']
    return ['#EF4444', '#F43F5E']
  }

  const [colorStart, colorEnd] = getColor()

  const offset = circumference - (visibleScore / 100) * circumference

  const getVerdictLabel = () => {
    if (verdict === 'VERIFIED') return 'VERIFIED'
    if (verdict === 'SUSPICIOUS') return 'SUSPICIOUS'
    return 'LIKELY FAKE'
  }

  useEffect(() => {
    if (!animate) return

    const duration = 1400
    const startTime = Date.now()
    const startValue = 0

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(startValue + (score - startValue) * eased))

      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [score, animate])

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--surface-border))"
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
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {processingStage ? (
            <div className="px-4 text-center">
              <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-ink-secondary">{processingStage}</p>
            </div>
          ) : (
            <>
              <motion.span
                className="font-mono text-4xl font-bold text-ink-primary"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {visibleScore}
              </motion.span>
              <span className="mt-0.5 font-mono text-xs text-ink-muted">/ 100</span>
            </>
          )}
        </div>
      </div>

      {!processingStage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
            verdict === 'VERIFIED'
              ? 'bg-status-verified/10 text-status-verified border border-status-verified/25'
              : verdict === 'SUSPICIOUS'
                ? 'bg-status-suspicious/10 text-status-suspicious border border-status-suspicious/25'
                : 'bg-status-fake/10 text-status-fake border border-status-fake/25'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              verdict === 'VERIFIED'
                ? 'bg-status-verified'
                : verdict === 'SUSPICIOUS'
                  ? 'bg-status-suspicious'
                  : 'bg-status-fake'
            }`}
          />
          {getVerdictLabel()}
        </motion.div>
      )}
    </div>
  )
}
