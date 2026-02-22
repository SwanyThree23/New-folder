'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, Crown, Maximize2, Minimize2 } from 'lucide-react'
import { executeMCPTool, MCPTools } from '@/lib/mcp-client'

interface Guest {
  id: string
  name: string
  avatar?: string
  isActive: boolean
  isSpeaking: boolean
  isMuted: boolean
  isVideoOff: boolean
  isSpotlight: boolean
  position: number
}

interface GuestPanel20Props {
  roomId: string
  authToken: string
  isHost: boolean
}

/**
 * 20-Guest WebRTC Panel Component
 * Thin UI - All logic handled by N8n MCP
 */
export function GuestPanel20({ roomId, authToken, isHost }: GuestPanel20Props) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [spotlightGuest, setSpotlightGuest] = useState<string | null>(null)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  
  // Fetch panel state from N8n via MCP
  useEffect(() => {
    const fetchPanelState = async () => {
      try {
        const result = await executeMCPTool<{ guests: Guest[] }>(
          MCPTools.PANEL_JOIN,
          { roomId, action: 'getState' },
          authToken
        )
        if (result.success && result.data) {
          setGuests(result.data.guests)
        }
      } catch (error) {
        console.error('Failed to fetch panel state:', error)
      }
    }
    
    fetchPanelState()
    // Poll every 5 seconds for state updates
    const interval = setInterval(fetchPanelState, 5000)
    return () => clearInterval(interval)
  }, [roomId, authToken])
  
  const handleSetSpotlight = async (guestId: string) => {
    if (!isHost) return
    
    try {
      await executeMCPTool(
        MCPTools.PANEL_SET_SPOTLIGHT,
        { roomId, guestId },
        authToken
      )
      setSpotlightGuest(spotlightGuest === guestId ? null : guestId)
    } catch (error) {
      console.error('Failed to set spotlight:', error)
    }
  }
  
  const handleToggleMute = async (guestId: string) => {
    try {
      await executeMCPTool(
        MCPTools.PANEL_UPDATE_GUEST,
        { roomId, guestId, updates: { isMuted: true } },
        authToken
      )
    } catch (error) {
      console.error('Failed to toggle mute:', error)
    }
  }
  
  const spotlightGuestData = guests.find(g => g.id === spotlightGuest)
  
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Spotlight View */}
      <AnimatePresence>
        {spotlightGuest && spotlightGuestData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-20 bg-black/95 p-4"
          >
            <div className="relative w-full h-full">
              <video
                ref={el => {
                  if (el) videoRefs.current.set(spotlightGuestData.id, el)
                }}
                autoPlay
                muted={spotlightGuestData.isMuted}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleSetSpotlight(spotlightGuestData.id)}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <Minimize2 size={20} />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold">{spotlightGuestData.name}</p>
                {spotlightGuestData.isSpeaking && (
                  <span className="text-xs text-gold-500 animate-pulse">Speaking</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Grid View */}
      <div className="grid grid-cols-5 gap-2 p-2 h-full">
        {guests.map((guest) => (
          <motion.div
            key={guest.id}
            layout
            className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              guest.isSpeaking ? 'border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-transparent'
            } ${guest.isSpotlight ? 'ring-2 ring-gold-500' : ''}`}
          >
            {guest.isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                {guest.avatar ? (
                  <img src={guest.avatar} alt={guest.name} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-burgundy-500 flex items-center justify-center text-2xl font-bold text-white">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <video
                ref={el => {
                  if (el) videoRefs.current.set(guest.id, el)
                }}
                autoPlay
                muted={guest.isMuted}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Guest Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-medium truncate">{guest.name}</span>
                <div className="flex gap-1">
                  {guest.isMuted && <MicOff size={12} className="text-red-500" />}
                  {guest.isSpeaking && <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />}
                </div>
              </div>
            </div>
            
            {/* Host Controls */}
            {isHost && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleMute(guest.id)}
                  className="p-1 bg-black/50 hover:bg-black/70 rounded text-white"
                >
                  {guest.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  onClick={() => handleSetSpotlight(guest.id)}
                  className="p-1 bg-black/50 hover:bg-gold-500/50 rounded text-white"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            )}
            
            {/* Position Badge */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-xs text-white">
              {guest.position}
            </div>
          </motion.div>
        ))}
        
        {/* Empty Slots */}
        {Array.from({ length: Math.max(0, 20 - guests.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-video bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center"
          >
            <span className="text-gray-600 text-xs">Slot {guests.length + i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
