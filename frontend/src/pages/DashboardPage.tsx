import { useEffect, useState } from 'react';
import {
    Package,
    FolderTree,
    AlertTriangle,
    DollarSign,
    Boxes,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/api/dashboard';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import { AIReorderWidget } from '@/components/dashboard/AIReorderWidget';
import type { CategoryValue, DashboardStats, LowStockItem } from '@/types';

// Neon Palette for Charts
const COLORS = ['#06b6d4', '#8b5cf6', '#f472b6', '#10b981', '#f59e0b', '#ef4444'];

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

// Animated Counter removed (handled by PremiumCard)

export function DashboardPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
    const [categoryValues, setCategoryValues] = useState<CategoryValue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, lowStockData, categoryData] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getLowStock(),
                    dashboardApi.getCategoryValues(),
                ]);
                setStats(statsData);
                setLowStock(lowStockData);
                setCategoryValues(categoryData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                {/* Bento Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-panel p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-[350px] glass-panel p-6">
                            <div className="mb-6">
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <div className="h-[250px] w-full flex items-end gap-2">
                                <Skeleton className="h-full w-full rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Command Center
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Orbital Overview • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {isAdmin && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/20">
                        <Activity className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">System Online</span>
                    </div>
                )}
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants}>
                    <PremiumCard
                        title="Total Products"
                        value={stats?.total_products ?? 0}
                        trend={12}
                        icon={Package}
                        className="border-blue-500/20"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <PremiumCard
                        title="Categories"
                        value={stats?.total_categories ?? 0}
                        icon={FolderTree}
                        className="border-purple-500/20"
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <PremiumCard
                        title="Low Stock Alerts"
                        value={stats?.low_stock_count ?? 0}
                        trend={-2}
                        icon={AlertTriangle}
                        className="border-red-500/20"
                    />
                </motion.div>

                {isAdmin && (
                    <motion.div variants={itemVariants}>
                        <PremiumCard
                            title="Inventory Value"
                            value={Number(stats?.total_inventory_value ?? 0)}
                            formatter={(v) => formatCurrency(v)}
                            icon={DollarSign}
                            className="border-green-500/20"
                        />
                    </motion.div>
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Reorder Widget */}
                <motion.div variants={itemVariants} className="h-full">
                    <AIReorderWidget />
                </motion.div>

                {/* Low Stock Chart */}
                <motion.div variants={itemVariants} className="h-full">
                    <Card className="h-full border-white/5 bg-black/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Critical Stock Levels
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStock.length === 0 ? (
                                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <div className="mb-2 text-4xl">✨</div>
                                        All systems nominal
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={lowStock} layout="vertical" margin={{ left: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#f87171" stopOpacity={1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                            <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={100}
                                                stroke="#ffffff80"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Bar dataKey="quantity" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Category Distribution */}
                <motion.div variants={itemVariants} className="h-full">
                    <Card className="h-full border-white/5 bg-black/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Boxes className="h-5 w-5 text-primary" />
                                Category Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {categoryValues.length === 0 ? (
                                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                    No data available
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryValues}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey={isAdmin ? 'total_value' : 'total_quantity'}
                                                nameKey="category_name"
                                                stroke="none"
                                            >
                                                {categoryValues.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        style={{ filter: `drop-shadow(0px 0px 8px ${COLORS[index % COLORS.length]}60)` }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    color: '#fff'
                                                }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: number) =>
                                                    isAdmin ? formatCurrency(value) : value.toLocaleString()
                                                }
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => <span style={{ color: '#ffffff90' }}>{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions / Recent Activity Placeholder (Future expansion) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
                <Card className="glass-panel border-primary/10 bg-primary/5">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <h3 className="text-lg font-medium text-white">System Status</h3>
                            <p className="text-sm text-primary/60">All inventory systems operational. Database synced.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-mono text-green-500">OPTIMAL</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
