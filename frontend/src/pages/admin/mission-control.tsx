import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function MissionControl() {
    const [mounted, setMounted] = useState(false);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const fetchTelemetry = async () => {
            try {
                // In real app, headers: { Authorization: `Bearer ${token}` }
                // const res = await axios.get('/api/admin/telemetry');

                // Simulation of data structure matching the new API
                const mockLogs = [
                    { _id: '1', type: 'SCENE_SWITCH', msg: 'Hype mode active', createdAt: new Date() },
                    { _id: '2', type: 'MODERATION', msg: 'Policy screening user_44', createdAt: new Date(Date.now() - 5000) }
                ];

                setTelemetry({
                    systems: [
                        { name: 'API Server', status: 'Healthy', latency: '45ms' },
                        { name: 'Database (Mongo)', status: 'Healthy', latency: '12ms' },
                        { name: 'Cache (Redis)', status: 'Healthy', latency: '2ms' },
                        { name: 'Stream Gateway', status: 'Healthy', latency: '89ms' },
                        { name: 'AI Moderator', status: 'Active', latency: '600ms' },
                    ],
                    logs: mockLogs,
                    agents: [
                        { name: 'Agent Alpha', role: 'Infrastructure', task: 'Cluster Optimization', status: 'Running' },
                        { name: 'Agent Beta', role: 'AI Director', task: 'Scene Orchestration', status: 'Idle' },
                        { name: 'Agent Gamma', role: 'Security', task: 'Policy Screening', status: 'Running' },
                    ]
                });
            } catch (err: any) {
                setError('Failed to sync telemetry.');
                console.error(err);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted || !telemetry) return <div className="p-8 font-mono text-green-500">INITIALIZING HUD...</div>;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="border-b border-green-500/30 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-widest text-green-400">Mission Control</h1>
                        <p className="text-sm opacity-70">Orchestration Layer | v3.0.1</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <Link href="/dashboard" className="hover:text-white underline"> User Dashboard </Link>
                        <span className="animate-pulse">● SYSTEM LIVE</span>
                    </div>
                </div>

                {/* System Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {telemetry.systems.map((sys: any, idx: number) => (
                        <div key={idx} className="bg-green-900/10 border border-green-500/20 p-4 rounded hover:bg-green-900/20 transition-colors">
                            <h3 className="text-xs uppercase opacity-70 mb-1">{sys.name}</h3>
                            <div className="text-lg font-bold">{sys.status}</div>
                            <div className="text-xs text-green-500/50 mt-2">{sys.latency}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Real-time Logs */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold uppercase border-b border-green-500/30 pb-2">Event Stream</h2>
                        <div className="bg-black border border-green-500/20 rounded h-96 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                            {telemetry.logs.map((log: any) => (
                                <div key={log._id} className="flex gap-4 hover:bg-green-500/5 p-1 rounded">
                                    <span className="w-20 text-green-500/50 text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    <span className={`w-24 font-bold ${log.type === 'MODERATION' ? 'text-red-400' : 'text-blue-400'}`}>{log.type}</span>
                                    <span className="flex-1 text-white/80">{log.msg}</span>
                                </div>
                            ))}
                            <div className="text-green-500/30 text-center py-4">-- End of Buffer --</div>
                        </div>
                    </div>

                    {/* Active Agents */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold uppercase border-b border-green-500/30 pb-2">Active Agents</h2>
                        <div className="space-y-2">
                            {telemetry.agents.map((agent: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-green-900/10 border border-green-500/20 rounded">
                                    <div>
                                        <div className="font-bold">{agent.name}</div>
                                        <div className="text-xs opacity-70">{agent.role}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs ${agent.status === 'Running' ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`}>{agent.status}</div>
                                        <div className="text-[10px] opacity-50">{agent.task}</div>
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
