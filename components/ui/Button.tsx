import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Button({ 
  children, 
  className, 
  loading, 
  variant = 'primary', 
  size = 'md', 
  disabled, 
  type = 'button',
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20",
    secondary: "bg-accent-cyan text-white hover:bg-accent-cyan-dark shadow-lg shadow-accent-cyan/20",
    outline: "bg-transparent border border-surface-border text-ink-primary hover:border-primary/50",
    ghost: "bg-transparent text-ink-muted hover:text-ink-primary hover:bg-surface-elevated/50",
    danger: "bg-status-fake text-white hover:bg-status-fake/90 shadow-lg shadow-status-fake/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    icon: "p-2"
  };

  return (
    <button
      type={type}
      className={cn(
        "rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
