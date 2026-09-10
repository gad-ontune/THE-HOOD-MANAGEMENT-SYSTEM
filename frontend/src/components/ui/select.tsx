import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  label?: string
  disabled?: boolean
}

export default function Select({ value, onChange, options, placeholder = 'Select...', className, label, disabled }: SelectProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="block text-sm font-medium text-theme-text/80">{label}</label>}
      <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-14 w-full items-center justify-between rounded-[14px] border border-theme bg-theme-card px-4 py-3 text-sm text-theme-text outline-none transition-all duration-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-50',
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} className="text-theme-text/60" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-[200] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[14px] border border-theme bg-theme-card shadow-card-xl"
            position="popper"
            sideOffset={4}
          >
          <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-theme-text/60" />
          <SelectPrimitive.Viewport className="p-1 max-h-[200px] overflow-y-auto">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex h-12 cursor-pointer select-none items-center rounded-[10px] px-3 pl-8 text-sm text-theme-text outline-none transition-colors data-[highlighted]:bg-theme-surface data-[state=checked]:text-theme-accent',
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center">
                  <Check size={14} className="text-theme-accent" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-theme-text/60" />
        </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
