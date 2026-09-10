import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gold-500 text-white hover:bg-gold-600 shadow-md hover:shadow-lg active:scale-[0.98]',
      secondary: 'bg-transparent border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white',
      danger: 'bg-danger text-white hover:bg-red-700',
      ghost: 'bg-transparent hover:bg-theme-surface text-theme-muted hover:text-theme-text',
    }
    const sizes = {
      sm: 'h-10 px-4 text-sm xl:text-base xl:px-5',
      md: 'h-[54px] px-6 text-base xl:text-lg',
      lg: 'h-[60px] px-8 text-lg xl:text-xl xl:px-10',
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-[14px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
export default Button
