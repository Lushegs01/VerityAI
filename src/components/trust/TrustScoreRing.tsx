import { useEffect, useState } from 'react'
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

  // Color by score
  const getColor = () => {
    if (score >= 85) return ['#00C896', '#00D4FF']
    if (score >= 50) return ['#F59E0B', '#FF8C00']
    return ['#FF4757', '#E51E56']
  }

  const [colorStart, colorEnd] = getColor()

  const offset = circumference - (displayScore / 100) * circumference

  // Glow color
  const getGlowColor = () => {
    if (score >= 85) return 'rgba(0, 200, 150, 0.15)'
    if (score >= 50) return 'rgba(245, 158, 11, 0.12)'
    return 'rgba(229, 30, 86, 0.15)'
  }

  // Verdict label
  const getVerdictLabel = () => {
    if (verdict === 'VERIFIED') return 'VERIFIED'
    if (verdict === 'SUSPICIOUS') return 'SUSPICIOUS'
    return 'LIKELY FAKE'
  }

  // Animate score
  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }
    const duration = 1500
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
          filter: `drop-shadow(0 0 20px ${getGlowColor()})`,
        }}
      >
        {/* Background pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* SVG Ring */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={`score-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E2535"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#score-gradient-${score})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {processingStage ? (
            <div className="text-center px-4">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                {displayScore}
              </motion.span>
              <span className="text-xs text-ink-muted font-mono mt-0.5">/ 100</span>
            </>
          )}
        </div>
      </div>

      {/* Verdict badge */}
      {!processingStage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            verdict === 'VERIFIED'
              ? 'bg-status-verified/10 text-status-verified border border-status-verified/20'
              : verdict === 'SUSPICIOUS'
                ? 'bg-status-suspicious/10 text-status-suspicious border border-status-suspicious/20'
                : 'bg-status-fake/10 text-status-fake border border-status-fake/20'
          }`}
        >
          {getVerdictLabel()}
        </motion.div>
      )}
    </div>
  )
}
