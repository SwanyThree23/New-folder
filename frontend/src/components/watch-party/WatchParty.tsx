'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, Users, Clock } from 'lucide-react'
import { executeMCPTool, MCPTools } from '@/lib/mcp-client'

interface WatchPartyProps {
  sessionId: string
  authToken: string
  videoUrl: string
}

interface SyncState {
  serverTimestamp: number
  drift: number
  isSynced: boolean
  isPlaying: boolean
  currentTime: number
}

const MAX_DRIFT_MS = 1500 // 1.5 seconds threshold

/**
 * Server-Authoritative Watch Party Component
 * Redis Master Clock - N8n provides authoritative timestamp
 */
export function WatchParty({ sessionId, authToken, videoUrl }: WatchPartyProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [syncState, setSyncState] = useState<SyncState>({
    serverTimestamp: 0,
    drift: 0,
    isSynced: true,
    isPlaying: false,
    currentTime: 0,
  })
  const [participantCount, setParticipantCount] = useState(0)
  const syncIntervalRef = useRef<NodeJS.Timeout>()
  
  // Initial sync and periodic re-sync
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const clientTime = Date.now()
        const result = await executeMCPTool<SyncState>(
          MCPTools.WATCHPARTY_SYNC,
          { sessionId, clientTimestamp: clientTime },
          authToken
        )
        
        if (result.success && result.data) {
          const newState = result.data
          setSyncState(newState)
          
          // Check drift and force sync if exceeded threshold
          if (Math.abs(newState.drift) > MAX_DRIFT_MS) {
            forceSyncToServer(newState)
          }
        }
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
    
    // Initial sync
    syncWithServer()
    
    // Periodic sync every 5 seconds
    syncIntervalRef.current = setInterval(syncWithServer, 5000)
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [sessionId, authToken])
  
  const forceSyncToServer = (state: SyncState) => {
    if (!videoRef.current) return
    
    console.log(`[WatchParty] Drift detected: ${state.drift}ms - Forcing sync`)
    
    // Pause briefly to sync
    videoRef.current.pause()
    videoRef.current.currentTime = state.currentTime / 1000
    
    if (state.isPlaying) {
      videoRef.current.play()
    }
  }
  
  const handlePlay = async () => {
    if (!videoRef.current) return
    
    try {
      await executeMCPTool(
        MCPTools.WATCHPARTY_PLAY,
        { sessionId, currentTime: videoRef.current.currentTime * 1000 },
        authToken
      )
      videoRef.current.play()
      setSyncState(prev => ({ ...prev, isPlaying: true }))
    } catch (error) {
      console.error('Play command failed:', error)
    }
  }
  
  const handlePause = async () => {
    if (!videoRef.current) return
    
    try {
      await executeMCPTool(
        MCPTools.WATCHPARTY_PAUSE,
        { sessionId, currentTime: videoRef.current.currentTime * 1000 },
        authToken
      )
      videoRef.current.pause()
      setSyncState(prev => ({ ...prev, isPlaying: false }))
    } catch (error) {
      console.error('Pause command failed:', error)
    }
  }
  
  const handleSeek = async (time: number) => {
    if (!videoRef.current) return
    
    try {
      await executeMCPTool(
        MCPTools.WATCHPARTY_SEEK,
        { sessionId, currentTime: time * 1000 },
        authToken
      )
      videoRef.current.currentTime = time
    } catch (error) {
      console.error('Seek command failed:', error)
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onTimeUpdate={(e) => {
            setSyncState(prev => ({ ...prev, currentTime: e.currentTarget.currentTime * 1000 }))
          }}
        />
        
        {/* Sync Status Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: syncState.isSynced ? 0 : 1 }}
          className="absolute top-4 right-4 px-3 py-1 bg-red-500/90 text-white text-xs rounded-full flex items-center gap-2"
        >
          <Clock size={12} />
          Syncing...
        </motion.div>
        
        {/* Drift Indicator (Debug) */}
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
          Drift: {syncState.drift}ms
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-gray-900">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={videoRef.current?.duration || 100}
            value={(syncState.currentTime / 1000) || 0}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(syncState.currentTime / 1000)}</span>
            <span>{formatTime(videoRef.current?.duration || 0)}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSeek(Math.max(0, (syncState.currentTime / 1000) - 10))}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={syncState.isPlaying ? handlePause : handlePlay}
              className="p-3 bg-gold-500 hover:bg-gold-600 text-black rounded-full transition-colors"
            >
              {syncState.isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={() => handleSeek((syncState.currentTime / 1000) + 10)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>
          
          {/* Participants & Sync Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Users size={18} />
              <span className="text-sm">{participantCount}</span>
            </div>
            
            <div className={`flex items-center gap-2 text-xs ${syncState.isSynced ? 'text-green-500' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${syncState.isSynced ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              {syncState.isSynced ? 'Synced' : `Drift: ${Math.abs(syncState.drift)}ms`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
