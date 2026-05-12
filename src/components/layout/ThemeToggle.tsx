import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/theme'
import { cn } from '@/lib/utils'

type Variant = 'segmented' | 'icon'

interface ThemeToggleProps {
  variant?: Variant
  className?: string
}

/**
 * `segmented` — full Light / Dark pill (used in the sidebar footer).
 * `icon`     — square icon button that flips the theme (compact spots).
 */
export default function ThemeToggle({ variant = 'segmented', className }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        onClick={toggleTheme}
        className={cn(
          'flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary',
          className,
        )}
      >
        {isLight ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'relative grid grid-cols-2 rounded-xl border border-surface-border bg-surface-elevated p-1',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-surface-card shadow-sm transition-transform duration-200',
          isLight ? 'translate-x-1' : 'translate-x-[calc(100%+0.25rem)]',
        )}
      />
      <button
        type="button"
        role="radio"
        aria-checked={isLight}
        onClick={() => setTheme('light')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors',
          isLight ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-secondary',
        )}
      >
        <Sun size={13} />
        Light
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isLight}
        onClick={() => setTheme('dark')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-colors',
          !isLight ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-secondary',
        )}
      >
        <Moon size={13} />
        Dark
      </button>
    </div>
  )
}
