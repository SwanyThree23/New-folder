import { create } from 'zustand'

export interface WatchPartyState {
  // Sync State
  serverTime: number
  localTime: number
  drift: number
  isSynced: boolean
  lastSyncAt: Date | null
  
  // Playback State
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  
  // Master Clock
  masterTimestamp: number
  syncInterval: number
  maxDrift: number // milliseconds
  
  // Actions
  syncWithServer: (serverTimestamp: number) => void
  updateLocalTime: () => void
  setPlaying: (isPlaying: boolean) => void
  seekTo: (time: number) => void
  setPlaybackRate: (rate: number) => void
  forceSync: () => void
  checkDrift: () => boolean
}

export const useWatchPartyStore = create<WatchPartyState>()((set, get) => ({
  serverTime: 0,
  localTime: Date.now(),
  drift: 0,
  isSynced: false,
  lastSyncAt: null,
  
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  
  masterTimestamp: 0,
  syncInterval: 5000, // Sync every 5 seconds
  maxDrift: 1500, // 1.5 seconds max drift before forced sync
  
  syncWithServer: (serverTimestamp) => {
    const localNow = Date.now()
    const calculatedDrift = localNow - serverTimestamp
    
    set({
      serverTime: serverTimestamp,
      localTime: localNow,
      drift: calculatedDrift,
      masterTimestamp: serverTimestamp,
      lastSyncAt: new Date(),
      isSynced: Math.abs(calculatedDrift) < get().maxDrift,
    })
  },
  
  updateLocalTime: () => {
    const { masterTimestamp, playbackRate, isPlaying } = get()
    if (isPlaying) {
      const elapsed = Date.now() - get().localTime
      set({
        localTime: Date.now(),
        currentTime: masterTimestamp + (elapsed * playbackRate),
      })
    }
  },
  
  setPlaying: (isPlaying) => set({ isPlaying }),
  
  seekTo: (time) => {
    set({
      currentTime: time,
      masterTimestamp: time,
      lastSyncAt: new Date(),
    })
  },
  
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  
  forceSync: () => {
    // Trigger N8n webhook to get master timestamp
    fetch('/api/n8n/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        get().syncWithServer(data.timestamp)
      })
  },
  
  checkDrift: () => {
    const { drift, maxDrift } = get()
    const needsSync = Math.abs(drift) > maxDrift
    if (needsSync) {
      get().forceSync()
    }
    return needsSync
  },
}))

// Auto-sync interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    useWatchPartyStore.getState().checkDrift()
  }, 5000)
}
