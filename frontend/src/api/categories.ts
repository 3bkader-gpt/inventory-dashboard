import apiClient from './client';
import type { Category, CategoryCreateInput } from '@/types';

/**
 * Categories API calls.
 */
export const categoriesApi = {
    /**
     * Get all categories.
     */
    async list(): Promise<Category[]> {
        const response = await apiClient.get<Category[]>('/categories');
        return response.data;
    },

    /**
     * Get a single category by ID.
     */
    async get(id: number): Promise<Category> {
        const response = await apiClient.get<Category>(`/categories/${id}`);
        return response.data;
    },

    /**
     * Create a new category.
     */
    async create(data: CategoryCreateInput): Promise<Category> {
        const response = await apiClient.post<Category>('/categories', data);
        return response.data;
    },

    /**
     * Update a category.
     */
    async update(id: number, data: Partial<CategoryCreateInput>): Promise<Category> {
        const response = await apiClient.put<Category>(`/categories/${id}`, data);
        return response.data;
    },

    /**
     * Delete a category.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/categories/${id}`);
    },
};
