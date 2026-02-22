"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Donation {
    user: string;
    amount: number;
    message: string;
}

export default function DonationAlert({ socket }: { socket: any }) {
    const [alert, setAlert] = useState<Donation | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('donation-alert', (data: Donation) => {
            setAlert(data);
            setTimeout(() => setAlert(null), 5000); // Hide after 5s
        });

        return () => {
            socket.off('donation-alert');
        };
    }, [socket]);

    // Manual test trigger
    const triggerTest = () => {
        setAlert({
            user: "MegaDonator",
            amount: 50.00,
            message: "Keep up the great work! Swannie3 is amazing!"
        });
        setTimeout(() => setAlert(null), 5000);
    };

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-primary p-1 rounded-lg shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] border-2 border-primary-foreground/20"
                    >
                        <div className="bg-background/90 backdrop-blur-md px-8 py-4 rounded-md flex flex-col items-center text-center">
                            <h2 className="text-2xl font-black italic uppercase text-primary border-b-2 border-primary/20 pb-1 mb-2">NEW DONATION!</h2>
                            <p className="text-xl font-bold flex items-center gap-2">
                                <span className="text-primary">{alert.user}</span>
                                <span className="text-foreground/50">donated</span>
                                <span className="text-green-400 font-mono text-2xl">${alert.amount.toFixed(2)}</span>
                            </p>
                            <p className="mt-3 text-sm italic text-foreground/70 max-w-[300px]">"{alert.message}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Test Trigger Button (Visible in Dev Only) */}
            <div className="fixed bottom-4 left-4 pointer-events-auto opacity-20 hover:opacity-100 transition-opacity">
                <button
                    onClick={triggerTest}
                    className="bg-muted px-2 py-1 rounded text-[10px] uppercase font-bold text-muted-foreground border border-border"
                >
                    Test Alert
                </button>
            </div>
        </div>
    );
}
