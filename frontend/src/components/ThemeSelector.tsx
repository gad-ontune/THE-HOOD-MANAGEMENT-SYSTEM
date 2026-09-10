import { useState, useRef, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { Palette, ChevronDown, Check } from 'lucide-react'

const themes = [
  { value: 'forest', label: 'Forest', desc: 'Forest green with gold' },
  { value: 'light', label: 'Light', desc: 'Green-tinted white' },
]

export default function ThemeSelector() {
  const { theme, setTheme } = useUIStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-[14px] bg-theme-surface border border-theme text-theme-text opacity-90 hover:bg-theme-primary/20 transition-all duration-300"
      >
        <Palette size={16} className="text-theme-accent" />
        <span className="text-sm font-medium">{current.label}</span>
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-theme-card border border-theme rounded-[14px] shadow-black-hover overflow-hidden">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTheme(t.value as any); setOpen(false) }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all ${
                theme === t.value
                  ? 'bg-theme-accent/10 text-theme-accent'
                  : 'text-theme-text hover:bg-theme-surface'
              }`}
            >
              <div className="w-8 h-8 rounded-full border border-theme flex-shrink-0" style={{
                background: t.value === 'forest' ? 'linear-gradient(135deg, #0B3B2E, #145A46)' :
                'linear-gradient(135deg, #F2F7F4, #DEEAE2)'
              }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.label}</p>
                <p className="text-xs text-theme-muted truncate">{t.desc}</p>
              </div>
              {theme === t.value && <Check size={16} className="text-theme-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}