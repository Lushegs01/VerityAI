import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/theme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  )
}
