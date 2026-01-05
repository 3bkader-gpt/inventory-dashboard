import apiClient from './client';
import type { User, UserCreateInput } from '@/types';

/**
 * Users API calls (Admin only).
 */
export const usersApi = {
    /**
     * Get all users.
     */
    async list(): Promise<User[]> {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    /**
     * Get a single user by ID.
     */
    async get(id: number): Promise<User> {
        const response = await apiClient.get<User>(`/users/${id}`);
        return response.data;
    },

    /**
     * Create a new user.
     */
    async create(data: UserCreateInput): Promise<User> {
        const response = await apiClient.post<User>('/users', data);
        return response.data;
    },

    /**
     * Update a user.
     */
    async update(id: number, data: Partial<UserCreateInput & { is_active: boolean }>): Promise<User> {
        const response = await apiClient.put<User>(`/users/${id}`, data);
        return response.data;
    },

    /**
     * Deactivate a user.
     */
    async deactivate(id: number): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    },
};
