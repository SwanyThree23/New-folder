"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CreateRoom() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock API call - in real app, use RoomService or axios
            // const res = await axios.post('/api/rooms', { title, description });

            // Simulation
            setTimeout(() => {
                const mockRoomId = `${title.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
                router.push(`/room/${mockRoomId}`);
            }, 1000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create room.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-2xl">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-primary hover:underline text-sm mb-4 block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold">Launch Stream</h1>
                    <p className="text-muted-foreground mt-2">Set up your room details and go live.</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-70">Stream Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. My Epic Live Session"
                            className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 opacity-70">Description</label>
                        <textarea
                            placeholder="Tell your viewers what to expect..."
                            rows={4}
                            className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60 uppercase font-bold tracking-widest">Moderation Level</span>
                            <span className="text-primary">AI ENABLED</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60 uppercase font-bold tracking-widest">Max Panelists</span>
                            <span className="text-primary">20 SLOTS</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : 'Launch Live Terminal'}
                    </button>
                </form>

                <p className="mt-8 text-[10px] text-center opacity-30 uppercase tracking-[0.2em]">Powered by Swannie3 Orchestration Engine</p>
            </div>
        </div>
    );
}
