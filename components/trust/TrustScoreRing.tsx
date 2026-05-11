import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/utils';

interface TrustScoreRingProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export function TrustScoreRing({ score, size = 280, animate = true }: TrustScoreRingProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const springConfig = { damping: 20, stiffness: 60 };
  const scoreValue = useSpring(0, springConfig);
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    return scoreValue.on('change', (latest) => {
      setDisplayScore(Math.round(latest));
    });
  }, [scoreValue]);

  useEffect(() => {
    if (animate && !hasAnimated) {
      scoreValue.set(score);
      setHasAnimated(true);
    }
  }, [score, animate, hasAnimated, scoreValue]);

  // Gradient logic: crimson to cyan
  // 0-49: Crimson/Red
  // 50-84: Amber
  // 85-100: Cyan/Green
  const strokeDashoffset = useTransform(scoreValue, (latest) => {
    const progress = latest / 100;
    return circumference * (1 - progress);
  });

  // Dynamic levels
  const getLevel = (s: number) => {
    if (s >= 70) return { label: 'VERIFIED', color: 'text-status-verified', bg: 'bg-status-verified-bg', border: 'border-status-verified/20', glow: 'shadow-[0_0_15px_rgba(5,150,105,0.15)]', stroke: '#059669' };
    if (s >= 40) return { label: 'SUSPICIOUS', color: 'text-status-suspicious', bg: 'bg-status-suspicious-bg', border: 'border-status-suspicious/20', glow: 'shadow-[0_0_15px_rgba(217,119,6,0.15)]', stroke: '#D97706' };
    return { label: 'LIKELY FAKE', color: 'text-status-fake', bg: 'bg-status-fake-bg', border: 'border-status-fake/20', glow: 'shadow-[0_0_15px_rgba(220,38,38,0.15)]', stroke: '#DC2626' };
  };

  const level = getLevel(score);

  return (
    <div className="relative flex flex-col items-center justify-center font-mono" style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div className={cn("absolute inset-0 rounded-full blur-2xl animate-pulse opacity-20", level.bg)} />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-surface-elevated"
        />
        
        {/* Animated Inner Glow Path */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 2}
          stroke={level.stroke}
          strokeWidth={1}
          fill="none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={level.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: animate ? strokeDashoffset : circumference * (1 - score / 100) }}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-6xl font-black tracking-[-0.04em] text-ink-primary">
          {displayScore}
        </motion.span>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-ink-muted mt-[-2px]">/ 100</span>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className={cn(
              "px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase mt-4 mb-[-12px]",
              level.color, level.bg, level.border, level.glow
            )}
          >
            {level.label}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
