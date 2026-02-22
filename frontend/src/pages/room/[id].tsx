import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import DonationAlert from '../../components/DonationAlert';
import VideoPlayer from '../../components/VideoPlayer';

const socket = io('http://localhost:4000');

export default function Room() {
    const router = useRouter();
    const { id } = router.query;
    const [viewers, setViewers] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [modAlert, setModAlert] = useState<string | null>(null);

    // Ref for chat auto-scroll
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            // Mock User ID - in real app, get from Auth Context
            const userId = `user-${Math.floor(Math.random() * 1000)}`;

            socket.emit('join-room', { roomId: id, userId });

            socket.on('room-update', (data) => {
                setViewers(data.viewers);
            });

            socket.on('new-message', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            socket.on('moderation-alert', (data) => {
                setModAlert(data.message);
                setTimeout(() => setModAlert(null), 5000);
            });

            return () => {
                socket.emit('leave-room', { roomId: id, userId });
                socket.off('room-update');
                socket.off('new-message');
                socket.off('moderation-alert');
            };
        }
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && id) {
            socket.emit('send-message', {
                roomId: id,
                message: input,
                user: 'Guest' // Replace with real username
            });
            setInput('');
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            <DonationAlert socket={socket} />

            {/* Moderation Alert Overlay */}
            {modAlert && (
                <div className="fixed top-20 right-4 z-[100] bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-bounce border border-white/20">
                    <p className="font-bold flex items-center gap-2">
                        <span>⚠️</span> {modAlert}
                    </p>
                </div>
            )}

            {/* Main Video Area */}
            <div className="flex-1 flex flex-col relative z-0">
                <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full text-white text-sm backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE <span className="text-white/50">|</span> <span className="font-mono">{viewers}</span> Viewers
                </div>

                {/* HLS Video Player */}
                <div className="flex-1 bg-black overflow-hidden">
                    <VideoPlayer
                        streamKey={id as string}
                        isHost={false}
                    />
                </div>
            </div>


            {/* Chat Sidebar */}
            <div className="w-80 border-l border-border bg-card flex flex-col z-10 shadow-xl">
                <div className="p-4 border-b border-border font-semibold text-foreground bg-card/50 backdrop-blur-sm sticky top-0">
                    Live Chat
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-border">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="text-sm animate-fade-in-up">
                            <span className="font-bold text-primary mr-2 cursor-pointer hover:underline">{msg.user}:</span>
                            <span className="text-foreground/90 break-words">{msg.message}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-border bg-background">
                    <form onSubmit={sendMessage} className="relative">
                        <input
                            className="w-full bg-input/50 text-foreground border border-input rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                            placeholder="Send a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            title="Send message"
                            aria-label="Send message"
                            className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
}
