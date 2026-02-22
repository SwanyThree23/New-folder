"use client";

import { motion } from 'framer-motion';

export default function RevenueChart() {
    const data = [120, 450, 300, 900, 1200, 850, 1500]; // Mock monthly data
    const max = Math.max(...data);

    return (
        <div className="bg-card border border-border rounded-xl p-6 h-64 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-foreground">Revenue Analytics</h3>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">+12.5% this month</span>
            </div>

            <div className="flex-1 flex items-end gap-2 px-2">
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(val / max) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                ${val}
                            </div>
                        </motion.div>
                        <span className="text-[10px] text-muted-foreground uppercase">M{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
