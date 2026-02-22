"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconSettings, IconShield } from '../components/Icons';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
        } else {
            setUser(JSON.parse(userInfo));
        }
    }, [router]);

    if (!user) return <div className="text-center p-8">Loading...</div>;

    const stats = [
        { label: 'Followers', value: '1,240' },
        { label: 'Total Views', value: '45,200' },
        { label: 'Partner Level', value: 'Gold' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-sm text-primary hover:underline">← Dashboard</Link>
                    <div className="flex gap-4">
                        <Link href="/settings/restream" className="text-sm opacity-70 hover:opacity-100">Settings</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-border pb-12">
                    <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-4xl font-bold text-primary">
                        {user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold">{user.username}</h1>
                            <p className="text-muted-foreground">Joined {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            {stats.map((s, i) => (
                                <div key={i} className="px-4 py-2 bg-card border border-border rounded-lg text-center min-w-[100px]">
                                    <div className="text-xl font-bold">{s.value}</div>
                                    <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Referral Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IconShield size={120} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Partner Referral Program</h2>
                        <p className="text-sm text-muted-foreground mb-6">Invite your friends and earn a lifetime 5% commission on their marketplace sales.</p>
                        <div className="flex gap-2">
                            <input 
                                readOnly 
                                value={`SWANNIE-${user.username.toUpperCase().slice(0, 4)}`}
                                title="Referral Code"
                                className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm"
                            />
                            <button className="px-6 py-3 bg-card border border-border rounded-lg font-bold hover:bg-muted transition-colors">Copy</button>
                        </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-2xl space-y-4">
                        <h2 className="text-2xl font-bold">Quick Links</h2>
                        <div className="space-y-2">
                            {[
                                { name: 'My Live Rooms', href: '/dashboard' },
                                { name: 'Marketplace Dashboard', href: '/marketplace' },
                                { name: 'Security Settings', href: '#' },
                                { name: 'Billing & Payouts', href: '#' },
                            ].map((l, i) => (
                                <Link key={i} href={l.href} className="flex justify-between items-center p-4 bg-background/50 border border-border rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                                    {l.name}
                                    <span className="opacity-30">→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
