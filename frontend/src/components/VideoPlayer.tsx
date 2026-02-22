"use client";

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
    IconExpand,
    IconSettings,
    IconShield
} from './Icons';

interface VideoPlayerProps {
    streamKey: string;
    isHost?: boolean;
}

export default function VideoPlayer({ streamKey, isHost }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamKey) return;

        // Use deployed RTMP HLS URL (port 8080)
        const hlsUrl = `http://localhost:8080/hls/${streamKey}.m3u8`;

        if (Hls.isSupported()) {
            const hls = new Hls({
                lowLatencyMode: true,
                maxLiveSyncPlaybackRate: 1.1, // Increase playback rate to catch up
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Auto-play muted to respect browser policy
                video.play().then(() => setIsPlaying(true)).catch((e) => console.log('Autoplay blocked', e));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    setError('Stream Offline or Error');
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("fatal network error, try recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("fatal media error, try recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native Safari HLS
            video.src = hlsUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play()
                    .then(() => setIsPlaying(true))
                    .catch((e) => console.log('Autoplay blocked Safari', e));
            });
        }
    }, [streamKey]);

    return (
        <div className="relative w-full h-full bg-black group overflow-hidden">

            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                poster="/stream-offline-placeholder.jpg" // Add a real placeholder image
                muted // Muted by default for autoplay
                controls={false} // Custom controls
            />

            {/* Overlay Status if Error/Offline */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors">Retry Connection</button>
                    </div>
                </div>
            )}

            {/* Custom Controls (fade on hover) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (videoRef.current) {
                                if (videoRef.current.paused) videoRef.current.play();
                                else videoRef.current.pause();
                            }
                        }}
                        className="text-white hover:text-primary transition-colors"
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-bold text-red-500">LIVE</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-white">
                    {isHost && (
                        <button title="Moderation Settings" className="hover:text-primary transition-colors">
                            <IconShield className="w-5 h-5" />
                        </button>
                    )}
                    <button title="Settings" className="hover:text-primary transition-colors">
                        <IconSettings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => videoRef.current?.requestFullscreen()}
                        title="Fullscreen"
                        className="hover:text-primary transition-colors"
                    >
                        <IconExpand className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
