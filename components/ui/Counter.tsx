import { useState, useEffect } from 'react';
import { animate } from 'motion/react';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function Counter({ value, duration = 1.5, prefix = '', suffix = '', decimals = 0 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const node = { val: 0 };
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => setDisplayValue(latest),
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
