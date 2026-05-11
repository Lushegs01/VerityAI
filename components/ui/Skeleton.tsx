import React from 'react';
import { cn } from '@/src/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
  key?: React.Key;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div 
      className={cn("animate-pulse bg-surface-elevated rounded-md", className)} 
      {...props}
    />
  );
}
