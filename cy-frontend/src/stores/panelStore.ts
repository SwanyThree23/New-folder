import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Guest {
  id: string
  name: string
  avatar?: string
  streamKey: string
  isActive: boolean
  isSpeaking: boolean
  volume: number
  isMuted: boolean
  isVideoOff: boolean
  isSpotlight: boolean
  joinedAt: Date
}

interface PanelState {
  guests: Guest[]
  maxGuests: number
  spotlightGuest: string | null
  isHost: boolean
  currentUserId: string | null
  
  // Actions
  addGuest: (guest: Guest) => boolean
  removeGuest: (guestId: string) => void
  updateGuest: (guestId: string, updates: Partial<Guest>) => void
  setSpotlight: (guestId: string | null) => void
  toggleGuestMute: (guestId: string) => void
  toggleGuestVideo: (guestId: string) => void
  setSpeaking: (guestId: string, isSpeaking: boolean) => void
  setHost: (isHost: boolean) => void
  setCurrentUser: (userId: string) => void
  reorderGuests: (guestIds: string[]) => void
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set, get) => ({
      guests: [],
      maxGuests: 20,
      spotlightGuest: null,
      isHost: false,
      currentUserId: null,

      addGuest: (guest) => {
        const { guests, maxGuests } = get()
        if (guests.length >= maxGuests) {
          return false
        }
        set({ guests: [...guests, guest] })
        return true
      },

      removeGuest: (guestId) => {
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== guestId),
          spotlightGuest: state.spotlightGuest === guestId ? null : state.spotlightGuest,
        }))
      },

      updateGuest: (guestId, updates) => {
        set((state) => ({
          guests: state.guests.map((g) =>
            g.id === guestId ? { ...g, ...updates } : g
          ),
        }))
      },

      setSpotlight: (guestId) => {
        set({ spotlightGuest: guestId })
        // Update isSpotlight for all guests
        set((state) => ({
          guests: state.guests.map((g) => ({
            ...g,
            isSpotlight: g.id === guestId,
          })),
        }))
      },

      toggleGuestMute: (guestId) => {
        set((state) => ({
          guests: state.guests.map((g) =>
            g.id === guestId ? { ...g, isMuted: !g.isMuted } : g
          ),
        }))
      },

      toggleGuestVideo: (guestId) => {
        set((state) => ({
          guests: state.guests.map((g) =>
            g.id === guestId ? { ...g, isVideoOff: !g.isVideoOff } : g
          ),
        }))
      },

      setSpeaking: (guestId, isSpeaking) => {
        set((state) => ({
          guests: state.guests.map((g) =>
            g.id === guestId ? { ...g, isSpeaking } : g
          ),
        }))
      },

      setHost: (isHost) => set({ isHost }),
      setCurrentUser: (userId) => set({ currentUserId: userId }),
      
      reorderGuests: (guestIds) => {
        set((state) => {
          const guestMap = new Map(state.guests.map(g => [g.id, g]))
          const reordered = guestIds
            .map(id => guestMap.get(id))
            .filter((g): g is Guest => g !== undefined)
          return { guests: reordered }
        })
      },
    }),
    {
      name: 'panel-storage',
    }
  )
)
