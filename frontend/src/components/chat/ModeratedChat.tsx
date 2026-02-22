'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Shield, Ban, Flag, Trash2 } from 'lucide-react'
import { executeMCPTool, MCPTools } from '@/lib/mcp-client'

interface ChatMessage {
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
}

interface ModeratedChatProps {
  roomId: string
  authToken: string
  isModerator: boolean
}

/**
 * AI Guardian Moderated Chat
 * Every message passes through N8n moderation workflow
 * Auto-ban > 0.9, Flag 0.7-0.9
 */
export function ModeratedChat({ roomId, authToken, isModerator }: ModeratedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Poll for new messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // In production, use WebSocket or Server-Sent Events
        // This is a polling fallback
        const result = await executeMCPTool<{ messages: ChatMessage[] }>(
          MCPTools.CHAT_SEND,
          { roomId, action: 'getMessages' },
          authToken
        )
        if (result.success && result.data) {
          setMessages(result.data.messages)
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }
    
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [roomId, authToken])
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return
    
    setIsSending(true)
    try {
      const result = await executeMCPTool<{
        messageId: string
        toxicity_score: number
        confidence: number
        is_flagged: boolean
        is_auto_banned: boolean
      }>(
        MCPTools.CHAT_SEND,
        { roomId, content: inputValue },
        authToken
      )
      
      if (result.success && result.data) {
        const newMessage: ChatMessage = {
          id: result.data.messageId,
          userId: 'current-user',
          username: 'You',
          content: inputValue,
          timestamp: new Date(),
          toxicityScore: result.data.toxicity_score,
          confidence: result.data.confidence,
          isFlagged: result.data.is_flagged,
          isAutoBanned: result.data.is_auto_banned,
        }
        
        setMessages(prev => [...prev, newMessage])
        setInputValue('')
        
        // Show toast if message was flagged or banned
        if (result.data.is_auto_banned) {
          alert('Your message was auto-banned for violating community guidelines.')
        } else if (result.data.is_flagged) {
          console.warn('Message flagged for moderation review')
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }
  
  const handleDeleteMessage = async (messageId: string) => {
    if (!isModerator) return
    
    try {
      await executeMCPTool(
        MCPTools.CHAT_DELETE,
        { roomId, messageId },
        authToken
      )
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }
  
  const handleBanUser = async (userId: string, username: string) => {
    if (!isModerator) return
    
    if (confirm(`Ban user ${username}?`)) {
      try {
        await executeMCPTool(
          MCPTools.CHAT_BAN_USER,
          { roomId, userId },
          authToken
        )
        // Remove all messages from banned user
        setMessages(prev => prev.filter(m => m.userId !== userId))
      } catch (error) {
        console.error('Failed to ban user:', error)
      }
    }
  }
  
  const getToxicityColor = (score: number) => {
    if (score > 0.9) return 'bg-red-500 text-white'
    if (score > 0.7) return 'bg-yellow-500 text-black'
    return 'bg-gray-700 text-gray-300'
  }
  
  const filteredMessages = flaggedOnly
    ? messages.filter(m => m.isFlagged || m.isAutoBanned)
    : messages
  
  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Chat
          <span className="text-xs text-gray-500">({messages.length})</span>
        </h3>
        
        {isModerator && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                flaggedOnly ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Flag size={12} className="inline mr-1" />
              Flagged Only
            </button>
            <Shield size={16} className="text-gold-500" />
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-lg ${
                message.isAutoBanned
                  ? 'bg-red-500/20 border border-red-500/50'
                  : message.isFlagged
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.avatar ? (
                  <img src={message.avatar} alt={message.username} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-burgundy-500 flex items-center justify-center text-xs font-bold text-white">
                    {message.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white">{message.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    
                    {/* Toxicity Badge */}
                    {(message.isFlagged || message.isAutoBanned) && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getToxicityColor(message.toxicityScore)}`}>
                        {message.isAutoBanned ? 'BANNED' : 'FLAGGED'}
                        <span className="ml-1 opacity-75">
                          {(message.toxicityScore * 100).toFixed(0)}%
                        </span>
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm ${message.isAutoBanned ? 'text-red-300 line-through' : 'text-gray-300'}`}>
                    {message.content}
                  </p>
                </div>
                
                {/* Moderator Actions */}
                {isModerator && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => handleBanUser(message.userId, message.username)}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Ban user"
                    >
                      <Ban size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gold-500 focus:outline-none transition-colors"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim()}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Messages are moderated by AI Guardian. Toxicity score &gt; 0.9 = Auto-ban
        </p>
      </div>
    </div>
  )
}
