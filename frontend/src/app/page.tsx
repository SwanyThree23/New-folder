'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Play, Users, Shield, Zap, Radio } from 'lucide-react'

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-burgundy-950 to-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/20 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-burgundy-500 bg-clip-text text-transparent">
              cyLive
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Production-grade streaming ecosystem with AI moderation,
            <br />
            20-guest panels, and atomic ledger transparency
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold rounded-lg text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start Streaming
            </button>
            <button className="px-8 py-4 border-2 border-gold-500 text-gold-500 font-bold rounded-lg text-lg hover:bg-gold-500 hover:text-black transition-all duration-300">
              Join Watch Party
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-gold-400 to-burgundy-400 bg-clip-text text-transparent"
        >
          Enterprise Features
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Users size={40} />}
            title="20-Guest Panels"
            description="WebRTC-based collaborative streaming with spotlight mode and expandable video boxes"
            delay={0}
          />
          <FeatureCard
            icon={<Shield size={40} />}
            title="AI Guardian"
            description="Real-time content moderation with toxicity scoring. Auto-ban >0.9, flag 0.7-0.9"
            delay={0.1}
          />
          <FeatureCard
            icon={<Zap size={40} />}
            title="Atomic Ledger"
            description="Transparent 90/10 revenue split. PostgreSQL-backed with Stripe Connect integration"
            delay={0.2}
          />
          <FeatureCard
            icon={<Radio size={40} />}
            title="Watch Party Sync"
            description="Server-authoritative sync with Redis master clock. Auto-correct drift >1.5s"
            delay={0.3}
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gold-500">
            Thin Frontend / Thick Backend Architecture
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Frontend (UI Layer)</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full" />
                  Next.js 14 App Router
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full" />
                  Tailwind CSS + Framer Motion
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full" />
                  Zero Business Logic - Pure UI
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-gold-500 rounded-full" />
                  MCP Client for N8n Integration
                </li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">Backend (Brain)</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-burgundy-500 rounded-full" />
                  N8n MCP Server (Dockerized)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-burgundy-500 rounded-full" />
                  PostgreSQL + Redis Persistence
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-burgundy-500 rounded-full" />
                  MediaMTX (WebRTC/SRT/RTMP)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-burgundy-500 rounded-full" />
                  FFmpeg Fan-out Orchestration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 group"
    >
      <div className="text-gold-500 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  )
}
