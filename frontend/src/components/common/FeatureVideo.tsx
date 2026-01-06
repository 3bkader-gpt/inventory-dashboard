import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function FeatureVideo() {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-panel border-primary/20 group">
            {/* Simulated Video Content (Animation) */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-background to-cyan-900/20" />

                {/* Animated Grid / Data Flow */}
                <motion.div
                    animate={isPlaying ? {
                        backgroundPosition: ['0% 0%', '100% 100%'],
                        opacity: [0.3, 0.5, 0.3]
                    } : {}}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6,182,212,0.15) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Central "AI Core" Animation */}
                <motion.div
                    animate={isPlaying ? { scale: [1, 1.1, 1], rotate: [0, 180, 360] } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-32 h-32 rounded-full border-2 border-cyan-500/30 flex items-center justify-center"
                >
                    <motion.div
                        animate={isPlaying ? { scale: [1, 0.8, 1], opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-24 h-24 rounded-full bg-cyan-500/10 blur-xl absolute"
                    />
                    <Sparkles className="w-12 h-12 text-cyan-400" />
                </motion.div>

                {/* Floating Data Nodes */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-purple-400"
                        initial={{ x: Math.random() * 400 - 200, y: Math.random() * 200 - 100 }}
                        animate={isPlaying ? {
                            x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                            y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                            opacity: [0, 1, 0]
                        } : {}}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
                    />
                ))}
            </div>

            {/* Video Overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex justify-between items-start">
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                        LIVE DEMO
                    </span>
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-white font-medium">AI Inventory Analysis</h3>
                        <p className="text-sm text-slate-300">Real-time predictive forecasting engine.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        {/* Progress Bar */}
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-500"
                                animate={isPlaying ? { width: ['0%', '100%'] } : {}}
                                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>

                        <span className="text-xs text-mono text-slate-400">00:30 / 01:00</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
