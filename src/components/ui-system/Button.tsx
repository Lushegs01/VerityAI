import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-600 active:bg-primary-700 shadow-soft hover:shadow-glow',
  secondary:
    'bg-surface-elevated text-ink-primary border border-surface-border hover:bg-surface-hover hover:border-primary/30',
  ghost:
    'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
  outline:
    'border border-surface-border bg-transparent text-ink-primary hover:bg-surface-hover hover:border-primary/40',
  danger:
    'bg-status-fake text-white hover:bg-red-600 active:bg-red-700 shadow-soft',
  success:
    'bg-status-verified text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-soft',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base whitespace-nowrap',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'
