import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'default'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    info: 'bg-info/20 text-info border-info/30',
    gold: 'bg-gold-500/20 text-gold-500 border-gold-500/30',
    default: 'bg-theme-surface text-theme-text opacity-70 border-theme',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
