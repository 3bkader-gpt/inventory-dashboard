import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import apiClient from '@/api/client';

interface Forecast {
    product_id: number;
    sku: string;
    name: string;
    current_quantity: number;
    avg_daily_sales: number;
    days_until_stockout: number | null;
    suggested_reorder: number;
    urgency: 'critical' | 'warning' | 'ok';
    category_name: string | null;
}

export function AIReorderWidget() {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecasts = async () => {
            try {
                const response = await apiClient.get<Forecast[]>('/analytics/forecast', {
                    params: { limit: 5 }, // Top 5 urgent items
                });
                setForecasts(response.data);
            } catch (error) {
                console.error('Failed to fetch forecasts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecasts();
    }, []);

    const getUrgencyColor = (urgency: Forecast['urgency']) => {
        switch (urgency) {
            case 'critical':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'warning':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            default:
                return 'text-green-400 bg-green-500/10 border-green-500/30';
        }
    };

    const getUrgencyIcon = (urgency: Forecast['urgency']) => {
        switch (urgency) {
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-red-400" />;
            case 'warning':
                return <TrendingDown className="h-4 w-4 text-yellow-400" />;
            default:
                return <Package className="h-4 w-4 text-green-400" />;
        }
    };

    if (loading) {
        return (
            <div className="glass-panel rounded-2xl border border-white/10 p-6 h-full animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    const criticalItems = forecasts.filter((f) => f.urgency !== 'ok');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl border border-white/10 p-6 h-full"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">AI Reorder Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                        {criticalItems.length > 0
                            ? `${criticalItems.length} items need attention`
                            : 'All stock levels healthy'}
                    </p>
                </div>
            </div>

            {/* Forecast List */}
            <div className="space-y-3">
                {forecasts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No forecast data available</p>
                    </div>
                ) : (
                    forecasts.map((forecast) => (
                        <motion.div
                            key={forecast.product_id}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                                'p-3 rounded-lg border flex items-center justify-between gap-3 transition-all cursor-pointer',
                                getUrgencyColor(forecast.urgency)
                            )}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {getUrgencyIcon(forecast.urgency)}
                                <div className="min-w-0">
                                    <p className="font-medium text-white truncate text-sm">
                                        {forecast.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        SKU: {forecast.sku}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {forecast.days_until_stockout !== null ? (
                                    <>
                                        <p className="font-bold text-lg">
                                            {forecast.days_until_stockout.toFixed(0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">days left</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-bold text-lg text-green-400">∞</p>
                                        <p className="text-xs text-muted-foreground">no velocity</p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Suggested Action */}
            {criticalItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-muted-foreground">
                        💡 <strong>Suggested:</strong> Reorder{' '}
                        {criticalItems.reduce((sum, f) => sum + f.suggested_reorder, 0)} units
                        total to maintain 14-day buffer.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
