import { create } from 'zustand'

export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  timestamp: Date
  toxicityScore: number
  confidence: number
  isFlagged: boolean
  isAutoBanned: boolean
  moderatedAt?: Date
}

interface ChatState {
  messages: ChatMessage[]
  isModerationEnabled: boolean
  flagThreshold: number
  banThreshold: number
  currentUser: {
    id: string
    username: string
    isModerator: boolean
  } | null
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'toxicityScore' | 'confidence' | 'isFlagged' | 'isAutoBanned'>) => Promise<void>
  moderateMessage: (messageId: string, result: { toxicity_score: number; confidence: number }) => void
  deleteMessage: (messageId: string) => void
  banUser: (userId: string) => void
  setModerationEnabled: (enabled: boolean) => void
  setCurrentUser: (user: ChatState['currentUser']) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isModerationEnabled: true,
  flagThreshold: 0.7,
  banThreshold: 0.9,
  currentUser: null,

  addMessage: async (messageData) => {
    const message: ChatMessage = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      toxicityScore: 0,
      confidence: 0,
      isFlagged: false,
      isAutoBanned: false,
    }

    // Optimistically add message
    set((state) => ({
      messages: [...state.messages, message],
    }))

    // Send to N8n moderation workflow
    if (get().isModerationEnabled) {
      try {
        const response = await fetch('/api/n8n/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: message.id,
            content: message.content,
            userId: message.userId,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          get().moderateMessage(message.id, result)
        }
      } catch (error) {
        console.error('Moderation error:', error)
      }
    }
  },

  moderateMessage: (messageId, result) => {
    const { flagThreshold, banThreshold } = get()
    const isFlagged = result.toxicity_score > flagThreshold
    const isAutoBanned = result.toxicity_score > banThreshold

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              toxicityScore: result.toxicity_score,
              confidence: result.confidence,
              isFlagged,
              isAutoBanned,
              moderatedAt: new Date(),
            }
          : msg
      ),
    }))

    // Auto-ban if threshold exceeded
    if (isAutoBanned) {
      const message = get().messages.find((m) => m.id === messageId)
      if (message) {
        get().banUser(message.userId)
      }
    }
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }))
  },

  banUser: (userId) => {
    // Trigger N8n ban workflow
    fetch('/api/n8n/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
  },

  setModerationEnabled: (enabled) => set({ isModerationEnabled: enabled }),
  setCurrentUser: (user) => set({ currentUser: user }),
  clearChat: () => set({ messages: [] }),
}))
