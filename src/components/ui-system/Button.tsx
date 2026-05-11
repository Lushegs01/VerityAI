import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

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
    'bg-primary text-white hover:bg-primary-dark shadow-[0_8px_20px_-8px_rgba(5,150,105,0.6)] hover:shadow-[0_12px_30px_-8px_rgba(5,150,105,0.7)]',
  secondary:
    'bg-accent-cyan text-white hover:bg-accent-cyan/90 shadow-[0_8px_20px_-8px_rgba(14,116,144,0.6)]',
  ghost:
    'text-ink-muted hover:bg-surface-elevated hover:text-ink-primary',
  outline:
    'border border-surface-border bg-transparent text-ink-primary hover:bg-surface-elevated hover:border-primary/40',
  danger:
    'bg-status-fake text-white hover:bg-status-fake/90 shadow-[0_8px_20px_-8px_rgba(185,28,28,0.6)]',
  success:
    'bg-status-verified text-white hover:bg-primary-dark shadow-[0_8px_20px_-8px_rgba(5,150,105,0.6)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2',
  icon: 'h-10 w-10 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base whitespace-nowrap',
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
