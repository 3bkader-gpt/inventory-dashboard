import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for sparkline - in production this would come from props
const mockData = [
    { value: 40 }, { value: 30 }, { value: 65 },
    { value: 50 }, { value: 90 },
];

interface PremiumCardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ElementType;
    className?: string;
    chartData?: { value: number }[];
    formatter?: (value: number) => string;
}

export function PremiumCard({ title, value, trend, icon: Icon, className, chartData = mockData, formatter }: PremiumCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [displayValue, setDisplayValue] = useState<number | string>(value);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // Animation logic
    useEffect(() => {
        if (typeof value === 'number') {
            let start = 0;
            const end = value;
            if (start === end) return;

            const duration = 2000;
            const startTime = performance.now();

            const updateCounter = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                if (elapsedTime < duration) {
                    const progress = elapsedTime / duration;
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = start + (end - start) * easeOut;
                    setDisplayValue(formatter ? formatter(current) : Math.round(current).toLocaleString());
                    requestAnimationFrame(updateCounter);
                } else {
                    setDisplayValue(formatter ? formatter(end) : end.toLocaleString());
                }
            };
            requestAnimationFrame(updateCounter);
        } else {
            setDisplayValue(value);
        }
    }, [value, formatter]);

    return (
        <div
            className={cn(
                "group relative rounded-xl border border-white/10 bg-zinc-900/50 px-6 py-5 overflow-hidden backdrop-blur-xl transition-colors hover:border-white/20",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            {/* 🔦 Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(124, 58, 237, 0.15),
              transparent 80%
            )
          `,
                }}
            />

            {/* 🌫️ Noise Texture Overlay (Optional, if global noise isn't enough) */}

            {/* Content */}
            <div className="relative flex justify-between items-start mb-4 z-10">
                <div>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight text-white font-[Geist]">{displayValue}</h3>
                        {trend !== undefined && (
                            <span className={cn(
                                "text-xs font-medium px-1.5 py-0.5 rounded-full",
                                trend > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
                            )}>
                                {trend > 0 ? '+' : ''}{trend}%
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </div>
            </div>

            {/* 📈 Sparkline Chart */}
            <div className="h-12 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity z-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
