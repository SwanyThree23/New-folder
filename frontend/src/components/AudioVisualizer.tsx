import { useRef, useEffect } from 'react';

// Generates an interactive visual wave for the home page hero
export default function AudioVisualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let resizeFrameId: number;
        let animationFrameId: number;

        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
            canvas.height = 300;
        };

        window.addEventListener('resize', resize);
        resize();

        // Visual params
        const bars = 100;

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; // Primary color with opacity
            const barWidth = canvas.width / bars;

            for (let i = 0; i < bars; i++) {
                const time = Date.now() / 1000;
                // Simulated audio wave logic using sin waves
                const height = Math.abs(Math.sin(time * 2 + i * 0.1) * 100) * (Math.sin(time + i * 0.05) + 1.5) * 0.4;

                const x = i * barWidth;
                const y = (canvas.height / 2) - (height / 2);

                // Gradient
                const gradient = ctx.createLinearGradient(x, y, x, y + height);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0)'); // Purple
                gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)'); // Blue
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)'); // Purple

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth - 2, height);
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full opacity-60 pointer-events-none" />;
}
