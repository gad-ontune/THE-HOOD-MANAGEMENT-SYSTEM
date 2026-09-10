import { create } from 'zustand'

export type ThemeType = 'forest' | 'light'

interface UIState {
  sidebarOpen: boolean
  theme: ThemeType
  showIntro: boolean
  toggleSidebar: () => void
  setTheme: (theme: ThemeType) => void
  startIntro: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'forest',
  showIntro: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  startIntro: () => {
    localStorage.removeItem('introSeen')
    set({ showIntro: true })
  },
}))
