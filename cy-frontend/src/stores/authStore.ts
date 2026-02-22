import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  walletAddress?: string
  isCreator: boolean
  isModerator: boolean
  token: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
  updateWallet: (walletAddress: string) => void
  getAuthHeaders: () => Record<string, string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/n8n/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          }
          set({ isLoading: false })
          return false
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/n8n/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
          })

          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          }
          set({ isLoading: false })
          return false
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        fetch('/api/n8n/auth/logout', { method: 'POST' })
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      updateWallet: (walletAddress) => {
        set((state) => ({
          user: state.user ? { ...state.user, walletAddress } : null,
        }))
      },

      getAuthHeaders: () => {
        const { user } = get()
        return user?.token
          ? { Authorization: `Bearer ${user.token}` }
          : {}
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
