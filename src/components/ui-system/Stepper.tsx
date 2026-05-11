import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  label: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentIndex: number
  className?: string
}

export function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <ol className={cn('flex w-full items-center gap-2 sm:gap-3', className)}>
      {steps.map((step, i) => {
        const isComplete = i < currentIndex
        const isActive = i === currentIndex
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3 min-w-0">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold font-mono transition-all',
                  isComplete && 'border-status-verified/30 bg-status-verified/15 text-status-verified',
                  isActive && 'border-primary/40 bg-primary/15 text-primary shadow-glow',
                  !isComplete && !isActive && 'border-surface-border bg-surface-elevated text-ink-muted',
                )}
              >
                {isComplete ? <Check size={14} strokeWidth={3} /> : i + 1}
              </motion.div>
              <div className="min-w-0 hidden sm:block">
                <p
                  className={cn(
                    'text-xs font-semibold tracking-tight truncate',
                    isActive || isComplete ? 'text-ink-primary' : 'text-ink-muted',
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-ink-muted truncate">{step.description}</p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-surface-border relative overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: isComplete ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-0 left-0 bg-status-verified"
                />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
