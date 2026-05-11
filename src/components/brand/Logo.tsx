import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerityLogoProps {
  size?: number
  className?: string
  title?: string
}

/**
 * VerityAI shield mark. Uses lucide ShieldCheck rendered in the brand green
 * so it matches the system palette without bespoke SVG maintenance.
 */
export function VerityLogo({ size = 40, className, title }: VerityLogoProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center text-primary', className)}
      style={{ width: size, height: size }}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
    >
      <ShieldCheck strokeWidth={2.25} size={size} />
    </span>
  )
}

interface BrandMarkProps {
  size?: number
  className?: string
  glow?: boolean
  title?: string
}

export function BrandMark({ size = 40, className, glow, title }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-[-30%] -z-10 rounded-full bg-primary/20 blur-2xl"
        />
      )}
      <VerityLogo size={size} title={title} />
    </span>
  )
}

interface BrandLockupProps {
  size?: number
  showSubtitle?: boolean
  subtitle?: string
  className?: string
  glow?: boolean
}

export function BrandLockup({
  size = 32,
  showSubtitle = true,
  subtitle = 'Forensic Engine',
  className,
  glow,
}: BrandLockupProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 group', className)}>
      <BrandMark
        size={size}
        glow={glow}
        className="transition-transform group-hover:scale-105"
        title="VerityAI"
      />
      <span className="min-w-0">
        <span className="block font-display text-lg font-black uppercase leading-none tracking-tighter text-ink-primary">
          VerityAI
        </span>
        {showSubtitle && (
          <span className="mt-1 block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-ink-muted">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  )
}
