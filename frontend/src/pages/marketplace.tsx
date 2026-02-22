import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';

const MOCK_PRODUCTS = [
    { id: 'prod_1', title: 'Exclusive Stream Overlay', price: 15.00, image: 'https://placehold.co/400x300/1a1a1a/FFF.png?text=Overlay', creator: 'StreamDesigns' },
    { id: 'prod_2', title: 'Emote Pack Vol 1', price: 4.99, image: 'https://placehold.co/400x300/1a1a1a/FFF.png?text=Emotes', creator: 'PixelArtist' },
    { id: 'prod_3', title: 'Custom Alert Sounds', price: 9.99, image: 'https://placehold.co/400x300/1a1a1a/FFF.png?text=Sounds', creator: 'AudioMaster' },
    { id: 'prod_4', title: 'Panel Graphics Kit', price: 12.50, image: 'https://placehold.co/400x300/1a1a1a/FFF.png?text=Panels', creator: 'DesignGuru' },
];

export default function Marketplace() {
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handlePurchase = async (productId: string) => {
        setBuyingId(productId);
        setMsg(null);

        try {
            // In real app, headers: { Authorization: `Bearer ${token}` }
            // const res = await axios.post(`/api/marketplace/products/${productId}/purchase`);

            // Simulation
            await new Promise(r => setTimeout(r, 1500));
            setMsg({ type: 'success', text: 'Transaction authorized. Item added to your library!' });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed.' });
        } finally {
            setBuyingId(null);
            setTimeout(() => setMsg(null), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">

            {/* Global Notification */}
            {msg && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${msg.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
                    }`}>
                    {msg.text}
                </div>
            )}

            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Swannie3 Market</Link>
                    <div className="flex gap-4">
                        <input
                            title="Search Marketplace"
                            aria-label="Search for assets"
                            className="px-4 py-2 bg-input rounded-full text-sm border border-border focus:ring-1 focus:ring-primary outline-none w-64"
                            placeholder="Search for assets..."
                        />
                        <Link href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"> Dashboard </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="py-16 bg-gradient-to-b from-primary/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold mb-4">Creator Marketplace</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover premium assets, tools, and services to elevate your stream. 90/10 revenue split for all creators.</p>
                </div>
            </div>

            {/* Grid */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MOCK_PRODUCTS.map((prod, idx) => (
                        <motion.div
                            key={prod.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                        >
                            <div className="aspect-video bg-muted relative overflow-hidden">
                                <img src={prod.image} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                    <button
                                        onClick={() => handlePurchase(prod.id)}
                                        disabled={!!buyingId}
                                        title={`Purchase ${prod.title}`}
                                        className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform disabled:opacity-50"
                                    >
                                        {buyingId === prod.id ? 'Processing...' : `Buy Now ($${prod.price})`}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg line-clamp-1">{prod.title}</h3>
                                        <p className="text-xs text-muted-foreground">by {prod.creator}</p>
                                    </div>
                                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono font-bold">${prod.price}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

        </div>
    );
}
