import { useState } from 'react'

interface PhoneInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

export default function PhoneInput({ label, value, onChange, required, placeholder, disabled }: PhoneInputProps) {
  const [touched, setTouched] = useState(false)

  const digits = value.replace(/\D/g, '')
  const error = touched && required && digits.length !== 9 ? 'Enter 9 digits' : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw.length <= 9) onChange(raw)
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-theme-text opacity-80">{label}{required && <span className="text-danger ml-0.5">*</span>}</label>}
      <div className={`flex items-center rounded-[14px] border ${error ? 'border-danger' : 'border-theme'} bg-theme-surface overflow-hidden`}>
        <span className="pl-4 pr-1 text-theme-text font-mono text-sm opacity-60 select-none">+254</span>
        <input
          type="tel"
          inputMode="numeric"
          value={digits}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder={placeholder || '712 345 678'}
          className="flex-1 bg-transparent py-2.5 pr-4 text-theme-text placeholder:text-theme-text/30 outline-none font-mono"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
