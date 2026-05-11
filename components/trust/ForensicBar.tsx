import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface ForensicBarProps {
  label: string;
  score: number;
  className?: string;
}

export function ForensicBar({ label, score, className }: ForensicBarProps) {
  const getScoreColor = (s: number) => {
    if (s >= 85) return "bg-status-verified";
    if (s >= 50) return "bg-status-suspicious";
    return "bg-status-fake";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-widest">
        <span className="text-ink-muted">{label}</span>
        <span className={cn(getScoreColor(score).replace('bg-', 'text-'))}>{score}%</span>
      </div>
      <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden border border-surface-border/50 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]", getScoreColor(score))}
        />
      </div>
    </div>
  );
}
