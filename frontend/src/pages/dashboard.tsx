import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import RevenueChart from '../components/RevenueChart';

export default function Dashboard() {
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

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-foreground">Welcome, <span className="text-primary">{user.username}</span></h1>
                    <div className="flex gap-4">
                        <Link href="/settings/restream" className="text-muted-foreground hover:text-white flex items-center gap-2">
                            <span>Restreaming</span>
                        </Link>
                        <button
                            onClick={() => { localStorage.removeItem('userInfo'); router.push('/') }}
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Top Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Link href="/room/create" className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-transform hover:-translate-y-1 block md:col-span-2">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">Go Live</h3>
                        <p className="text-muted-foreground text-sm">Create a new room and start streaming to Twitch, YouTube, and Swannie3 simultaneously.</p>
                    </Link>

                    <div className="p-6 bg-card border border-border rounded-xl flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-foreground">Wallet</h3>
                            <p className="text-muted-foreground text-sm mb-4">Balance: <span className="font-mono text-foreground text-xl font-bold">${user.walletBalance?.toFixed(2) || '0.00'}</span></p>
                        </div>
                        <button
                            className="w-full py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm font-bold hover:bg-green-500 hover:text-white transition-all uppercase tracking-wider"
                            onClick={() => alert('Payout request sent to Admin mission control.')}
                        >
                            Withdraw Funds
                        </button>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <RevenueChart />
                    <div className="p-6 bg-card border border-border rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-foreground">Active Campaigns</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Overlay Emote Pack', sales: 45, rev: '$450.00' },
                                { name: 'VIP Subscription', sales: 12, rev: '$240.00' }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-border/50">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <div className="text-right">
                                        <div className="text-sm text-foreground font-bold">{item.rev}</div>
                                        <div className="text-[10px] text-muted-foreground">{item.sales} Sales</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
