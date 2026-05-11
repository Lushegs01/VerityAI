import { cn } from '@/lib/utils'

interface VerityLogoProps {
  size?: number
  className?: string
  /**
   * Color used for the crack lines between shield fragments. Should match
   * the background the logo sits on so the fragmentation reads cleanly.
   */
  gapColor?: string
  title?: string
}

/**
 * VerityAI shield mark — a fragmented shield with a crimson accent fragment
 * and a magnifying glass overlay. Inline SVG so it scales crisply and the
 * crack-line color can be retargeted per-surface.
 */
export function VerityLogo({
  size = 40,
  className,
  gapColor = '#F5F1E8',
  title,
}: VerityLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('block', className)}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      {/* Shield body */}
      <path
        d="M32 4 L52 9 L52 28 C52 42 42 54 32 60 C22 54 12 42 12 28 L12 9 Z"
        fill="#1F2937"
      />

      {/* Crimson accent fragment — upper left */}
      <path d="M12 9 L22 7 L21 22 L13 22 Z" fill="#C73E5A" />

      {/* Crack lines — drawn in the gap color so they read as fractures */}
      <g
        stroke={gapColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Verticals */}
        <path d="M22 7 L21 22 L18 38 L25 52" />
        <path d="M40 8 L40 22 L36 36 L42 50" />
        {/* Horizontals */}
        <path d="M13 22 L52 22" />
        <path d="M14 36 L52 36" />
        {/* Lower converging cracks */}
        <path d="M18 38 L25 52 L30 55 L34 53 L42 50 L36 36" />
      </g>

      {/* Magnifier — outer lens ring */}
      <circle
        cx="38"
        cy="32"
        r="9"
        fill={gapColor}
        stroke="#C73E5A"
        strokeWidth="2.6"
      />
      {/* Magnifier — inner highlight arc */}
      <path
        d="M33 29 A 5 5 0 0 1 38 26"
        fill="none"
        stroke="#C73E5A"
        strokeWidth="1.4"
        opacity="0.6"
        strokeLinecap="round"
      />
      {/* Magnifier — handle */}
      <line
        x1="44.6"
        y1="38.6"
        x2="51"
        y2="45"
        stroke="#C73E5A"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface BrandMarkProps {
  size?: number
  gapColor?: string
  className?: string
  /** When true, wraps the logo in a soft halo. Useful in hero / loading. */
  glow?: boolean
  title?: string
}

export function BrandMark({
  size = 40,
  gapColor,
  className,
  glow,
  title,
}: BrandMarkProps) {
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
      <VerityLogo size={size} gapColor={gapColor} title={title} />
    </span>
  )
}

interface BrandLockupProps {
  size?: number
  showSubtitle?: boolean
  subtitle?: string
  gapColor?: string
  className?: string
  glow?: boolean
}

/**
 * Logo + wordmark. Renders as an inline-flex span so parents can wrap it in
 * a Link/NavLink without nesting interactive elements.
 */
export function BrandLockup({
  size = 32,
  showSubtitle = true,
  subtitle = 'Forensic Engine',
  gapColor,
  className,
  glow,
}: BrandLockupProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 group', className)}>
      <BrandMark
        size={size}
        gapColor={gapColor}
        glow={glow}
        className="transition-transform group-hover:scale-105"
        title="VerityAI"
      />
      <span className="min-w-0">
        <span className="block font-display text-lg font-black lowercase leading-none tracking-tighter text-ink-primary">
          verity
        </span>
        {showSubtitle && (
          <span className="mt-1 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  )
}
