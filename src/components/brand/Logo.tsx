import { cn } from '@/lib/utils'

interface VerityLogoProps {
  size?: number
  className?: string
  /**
   * The fill color used for the gaps between the shield fragments and the
   * lens of the magnifier. Should match the background the logo sits on so
   * the cracked-shield illusion reads cleanly.
   */
  gapColor?: string
  title?: string
}

/**
 * Standalone Verity shield mark — a cracked shield with a magnifier overlay.
 * Shield body uses `currentColor` so it inherits text color from the parent.
 * Pink accents are baked in at the brand color.
 */
export function VerityLogo({
  size = 40,
  className,
  gapColor = 'hsl(var(--surface-base))',
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
        fill="currentColor"
      />

      {/* Highlighted top-left fragment (brand pink) */}
      <path d="M12 9 L22 7 L21 22 L13 22 Z" fill="#E51E56" />

      {/* Crack lines — drawn in the gap color so they appear as breaks */}
      <g
        stroke={gapColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Left vertical crack */}
        <path d="M22 7 L21 22 L18 38 L25 52" />
        {/* Right vertical crack */}
        <path d="M40 8 L40 22 L36 36 L42 50" />
        {/* Upper horizontal crack */}
        <path d="M13 22 L52 22" />
        {/* Lower horizontal crack */}
        <path d="M14 36 L52 36" />
        {/* Bottom diagonal crack */}
        <path d="M25 52 L30 55 L34 53" />
      </g>

      {/* Magnifier — lens */}
      <circle
        cx="38"
        cy="30"
        r="8.5"
        fill={gapColor}
        stroke="#E51E56"
        strokeWidth="2.4"
      />
      {/* Magnifier — inner reflection arc */}
      <path
        d="M33 27 A 5 5 0 0 1 38 25"
        fill="none"
        stroke="#E51E56"
        strokeWidth="1.2"
        opacity="0.55"
        strokeLinecap="round"
      />
      {/* Magnifier — handle */}
      <line
        x1="44.5"
        y1="36.5"
        x2="50"
        y2="42"
        stroke="#E51E56"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface BrandMarkProps {
  size?: number
  gapColor?: string
  className?: string
  /**
   * When true, wraps the logo in a soft glow halo. Useful in hero and
   * loading contexts.
   */
  glow?: boolean
  title?: string
}

/**
 * Pre-styled brand mark — applies the right text color and optional halo.
 * Use this anywhere you'd previously render the shield icon.
 */
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
        'relative inline-flex shrink-0 items-center justify-center text-ink-primary',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-[-30%] -z-10 rounded-full bg-primary/25 blur-2xl"
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
 * Logo + wordmark lockup. Renders as an inline-flex span so parents can
 * wrap it in a Link/NavLink without nesting interactive elements.
 */
export function BrandLockup({
  size = 36,
  showSubtitle = true,
  subtitle = 'Trust Engine',
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
        title="Verity"
      />
      <span className="min-w-0">
        <span className="block font-display text-base font-bold leading-none tracking-tight text-ink-primary">
          Verity
        </span>
        {showSubtitle && (
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  )
}
