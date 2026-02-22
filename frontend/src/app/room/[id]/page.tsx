'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  Radio, 
  Settings, 
  Share2, 
  Crown,
  MoreVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff
} from 'lucide-react'
import { GuestPanel20 } from '@/components/panel/GuestPanel20'
import { ModeratedChat } from '@/components/chat/ModeratedChat'

interface RoomInfo {
  id: string
  title: string
  hostName: string
  hostAvatar?: string
  isLive: boolean
  viewerCount: number
  guestCount: number
  startedAt?: Date
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [authToken, setAuthToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Control states
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  useEffect(() => {
    // Fetch room info and authenticate
    const initializeRoom = async () => {
      try {
        // Get auth token from localStorage or session
        const token = localStorage.getItem('authToken') || 'guest-token'
        setAuthToken(token)
        
        // Fetch room details
        const response = await fetch(`/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setRoomInfo(data)
          setIsHost(data.isHost)
          setIsModerator(data.isModerator || data.isHost)
        } else {
          // Fallback room info for demo
          setRoomInfo({
            id: roomId,
            title: 'Live Streaming Room',
            hostName: 'Host User',
            isLive: true,
            viewerCount: 1247,
            guestCount: 8
          })
        }
      } catch (error) {
        console.error('Failed to fetch room info:', error)
        // Fallback
        setRoomInfo({
          id: roomId,
          title: 'Live Streaming Room',
          hostName: 'Host User',
          isLive: true,
          viewerCount: 1247,
          guestCount: 8
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (roomId) {
      initializeRoom()
    }
  }, [roomId])
  
  const handleShareRoom = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      // Could show toast here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const handleToggleMute = () => setIsMuted(!isMuted)
  const handleToggleVideo = () => setIsVideoOff(!isVideoOff)
  const handleToggleScreenShare = () => setIsScreenSharing(!isScreenSharing)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="h-16 bg-gradient-to-r from-burgundy-950 via-black to-burgundy-950 border-b border-gold-500/20 flex items-center justify-between px-4 lg:px-6">
        {/* Left: Room Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-burgundy-500 flex items-center justify-center">
                <Radio size={20} className="text-white" />
              </div>
              {roomInfo?.isLive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-black" />
              )}
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">
                {roomInfo?.title || 'Live Room'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-gold-500">{roomInfo?.hostName}</span>
                {isHost && <Crown size={14} className="text-gold-500" />}
              </div>
            </div>
          </div>
          
          {/* Live Badge */}
          {roomInfo?.isLive && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        
        {/* Center: Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={18} className="text-gold-500" />
            <span className="text-white font-mono">{roomInfo?.viewerCount?.toLocaleString() || 0}</span>
            <span className="text-sm">viewers</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-white font-mono">{roomInfo?.guestCount || 0}</span>
            <span className="text-sm">/ 20 guests</span>
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareRoom}
            className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all duration-200"
            title="Share room"
          >
            <Share2 size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all duration-200"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all duration-200"
            title="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Area - Guest Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Guest Panel Container */}
          <div className="flex-1 p-4">
            <GuestPanel20
              roomId={roomId}
              authToken={authToken}
              isHost={isHost}
            />
          </div>
          
          {/* Control Bar */}
          <div className="h-20 bg-gradient-to-t from-black via-gray-950 to-transparent border-t border-gold-500/10 px-6 flex items-center justify-between">
            {/* Left: Room Controls */}
            <div className="flex items-center gap-4">
              {isHost && (
                <button className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-lg transition-colors flex items-center gap-2">
                  <Crown size={18} />
                  <span className="hidden sm:inline">Host Controls</span>
                </button>
              )}
            </div>
            
            {/* Center: Media Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isMuted 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              
              <button
                onClick={handleToggleVideo}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isVideoOff 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
              
              <button
                onClick={handleToggleScreenShare}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isScreenSharing 
                    ? 'bg-gold-500/20 text-gold-500 border border-gold-500/50' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <ScreenShare size={22} />
              </button>
              
              <button
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 ml-2"
                title="Leave room"
              >
                <PhoneOff size={22} />
              </button>
            </div>
            
            {/* Right: Empty for balance */}
            <div className="w-32" />
          </div>
        </main>
        
        {/* Sidebar - Chat */}
        <aside className="w-96 border-l border-gold-500/20 bg-gray-950/50 flex flex-col">
          <ModeratedChat
            roomId={roomId}
            authToken={authToken}
            isModerator={isModerator}
          />
        </aside>
      </div>
    </div>
  )
}
