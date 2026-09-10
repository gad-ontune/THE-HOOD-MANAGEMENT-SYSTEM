import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-forest', 'theme-light')
    root.classList.add(`theme-${theme}`)
  }, [theme])

  return <>{children}</>
}
