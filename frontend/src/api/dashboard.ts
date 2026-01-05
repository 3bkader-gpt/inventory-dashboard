import apiClient from './client';
import type { CategoryValue, DashboardStats, LowStockItem } from '@/types';

/**
 * Dashboard API calls.
 */
export const dashboardApi = {
    /**
     * Get aggregate statistics.
     */
    async getStats(): Promise<DashboardStats> {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },

    /**
     * Get low stock items for alerts.
     */
    async getLowStock(limit = 10): Promise<LowStockItem[]> {
        const response = await apiClient.get<LowStockItem[]>('/dashboard/low-stock', {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get inventory value by category for charts.
     */
    async getCategoryValues(): Promise<CategoryValue[]> {
        const response = await apiClient.get<CategoryValue[]>('/dashboard/category-value');
        return response.data;
    },
};
