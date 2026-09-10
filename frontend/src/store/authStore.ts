import { create } from 'zustand'

interface User {
  id: number
  name: string
  role: string
  mustChangePassword?: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
}))
