import React, { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, className, hover = false, ...props }: any) {
  return (
    <div 
      className={cn(
        "bg-surface-card border border-surface-border rounded-2xl overflow-hidden backdrop-blur-sm",
        hover && "hover:border-primary/50 hover:bg-surface-elevated transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
