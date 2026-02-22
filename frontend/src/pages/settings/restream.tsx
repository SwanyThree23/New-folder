"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconShield, IconSettings } from '../../components/Icons';

const PLATFORMS = [
    { id: 'twitch', name: 'Twitch', icon: '🟣' },
    { id: 'youtube', name: 'YouTube', icon: '🔴' },
    { id: 'facebook', name: 'Facebook', icon: '🔵' },
    { id: 'custom', name: 'Custom RTMP', icon: '🔌' },
];

export default function RestreamSettings() {
    const [targets, setTargets] = useState([
        { id: 1, platform: 'twitch', enabled: false, key: '' },
    ]);

    const addTarget = () => {
        setTargets([...targets, { id: Date.now(), platform: 'youtube', enabled: false, key: '' }]);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-end border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Multi-Platform Sync</h1>
                        <p className="text-muted-foreground">Broadcast your stream to multiple destinations simultaneously.</p>
                    </div>
                    <button
                        onClick={addTarget}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        + Add Destination
                    </button>
                </header>

                <div className="space-y-4">
                    {targets.map((target) => (
                        <motion.div
                            key={target.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6 bg-card border border-border rounded-xl flex flex-col md:flex-row gap-6 items-center"
                        >
                            <div className="flex items-center gap-4 w-full md:w-48">
                                <select
                                    title="Select Platform"
                                    aria-label="Select streaming platform"
                                    className="bg-input border border-border rounded-lg px-3 py-2 w-full text-foreground"
                                >
                                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 w-full">
                                <input
                                    type="password"
                                    placeholder="Stream Key (Encrypted via Vault Pro)"
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={target.enabled} />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ms-3 text-sm font-medium opacity-70">Active</span>
                                </label>
                                <button
                                    title="Delete Destination"
                                    aria-label="Delete streaming destination"
                                    className="text-destructive hover:opacity-80"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <IconShield className="text-primary" />
                        Security Implementation
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        All external stream keys are encrypted using **AES-256-GCM** before storage.
                        Ingest authentication is performed via high-performance Lua scripts in the Nginx RTMP module.
                    </p>
                </div>
            </div>
        </div>
    );
}
