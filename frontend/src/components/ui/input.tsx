import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-theme-text opacity-80">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'h-14 w-full rounded-[14px] bg-theme-bg-card border border-theme px-4 text-theme-text placeholder:text-theme-muted outline-none transition-all duration-300 focus:border-gold-500 focus:shadow-[0_0_12px_rgba(212,175,55,0.35)]',
            error && 'border-danger',
            className,
          )}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
export default Input
