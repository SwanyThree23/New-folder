"use client";

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VideoPlayer from '../../components/VideoPlayer';

export default function Embed() {
    const router = useRouter();
    const { id, chat } = router.query;
    const showChat = chat === 'true';

    if (!id) return <div className="bg-black text-white h-screen flex items-center justify-center">Invalid Room ID</div>;

    return (
        <div className="h-screen w-screen bg-transparent overflow-hidden flex flex-col">
            <div className="flex-1 relative">
                <VideoPlayer streamKey={id as string} isHost={false} />

                {/* Minimal Overlay for Embed */}
                <div className="absolute top-2 left-2 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                        SWANNIE3 EMBED
                    </div>
                </div>
            </div>

            {showChat && (
                <div className="h-1/3 bg-background/90 border-t border-border p-2 overflow-hidden flex flex-col">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-widest px-1">Live Chat Widget</div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                        {/* Simplified Chat View for Embeds */}
                        <div className="text-[11px]">
                            <span className="font-bold text-primary mr-1">System:</span>
                            <span className="text-foreground/70 italic">Chat embed initialized for room {id}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
