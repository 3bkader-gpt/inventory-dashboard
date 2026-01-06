import { motion } from 'framer-motion';
import { Activity, Search, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.png';

interface DashboardHeroProps {
    isAdmin: boolean;
}

export function DashboardHero({ isAdmin }: DashboardHeroProps) {
    const navigate = useNavigate();
    const today = new Date();

    return (
        <div className="relative w-full h-[300px] rounded-3xl overflow-hidden mb-8 group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={heroBg} 
                    alt="Dashboard Hero" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 max-w-4xl">
                {/* Status Badge */}
                {isAdmin && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-primary/20 w-fit mb-4 bg-background/30 backdrop-blur-md"
                    >
                        <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span className="text-xs font-medium text-cyan-300 tracking-wide uppercase">System Optimal</span>
                    </motion.div>
                )}

                {/* Main Heading */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2"
                >
                    Orbital Command Center
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-slate-300 mb-8 max-w-xl flex items-center gap-2"
                >
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span>
                        {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-400 font-medium">v2.0 Stable</span>
                </motion.p>

                {/* Quick Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-4"
                >
                    <Button 
                        size="lg" 
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        onClick={() => navigate('/products?action=ai-search')}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Inventory Analysis
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="glass-panel border-white/10 hover:bg-white/10 text-white"
                        onClick={() => navigate('/products')}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Quick Search
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
