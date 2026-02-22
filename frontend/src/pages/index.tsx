import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-hidden relative">

            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
                <div className="absolute inset-x-0 inset-y-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            </div>

            {/* Glass Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between border border-white/10 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-black tracking-tighter">SWANNIE3</Link>
                        <div className="hidden md:flex gap-6 text-sm font-medium opacity-60">
                            <Link href="/marketplace" className="hover:opacity-100">Marketplace</Link>
                            <Link href="/admin/mission-control" className="hover:opacity-100">Company</Link>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm font-bold px-4 py-2 hover:text-primary transition-colors">Sign In</Link>
                        <Link href="/login" className="text-sm font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-all">Start Free</Link>
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">

                    {/* Hero Section */}
                    <div className="text-center space-y-8 mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6 leading-tight">
                                Streaming for the <br />
                                <span className="text-primary italic">Next Decade.</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                                Swannie3 is the enterprise-grade engine for 20-person collaborative panels,
                                AI-driven orchestration, and transparent creator economies.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link href="/login" className="px-10 py-4 bg-primary text-primary-foreground font-black rounded-xl hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] transition-all transform hover:-translate-y-1">
                                LAUNCH LIVE
                            </Link>
                            <Link href="/marketplace" className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                BROWSE ASSETS
                            </Link>
                        </motion.div>
                    </div>

                    {/* Feature Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "20-Person Panels",
                                desc: "Proprietary low-latency mesh for mass collaboration.",
                                icon: "⚡"
                            },
                            {
                                title: "AI Moderation",
                                desc: "Linguia prompt compression and real-time safety interceptors.",
                                icon: "🛡️"
                            },
                            {
                                title: "90/10 Economics",
                                desc: "The most transparent revenue model in the creator economy.",
                                icon: "💎"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-primary/20 transition-all cursor-default"
                            >
                                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </main>

            {/* Floating Live Indicator */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="flex items-center gap-3 bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-full font-black text-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE NETWORK ACTIVE
                </div>
            </div>

            <footer className="py-20 border-t border-white/5 text-center text-[10px] uppercase font-bold tracking-[0.4em] opacity-30">
                © 2026 Swannie3 Infrastructure Labs. All rights reserved.
            </footer>
        </div>
    )
}
