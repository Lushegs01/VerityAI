import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

/**
 * Animated number that counts up from 0 to `value` on mount using
 * requestAnimationFrame. Locale-formats integers with thousands separators
 * and respects a fixed decimal count for fractional values.
 */
export function Counter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1400,
  className,
}: CounterProps) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString()

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
