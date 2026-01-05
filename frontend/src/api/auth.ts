import apiClient from './client';
import type { TokenResponse, User } from '@/types';

/**
 * Authentication API calls.
 */
export const authApi = {
    /**
     * Login with email and password.
     */
    async login(email: string, password: string): Promise<TokenResponse> {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await apiClient.post<TokenResponse>('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    },

    /**
     * Get current user profile.
     */
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },

    /**
     * Refresh access token.
     */
    async refresh(): Promise<TokenResponse> {
        const response = await apiClient.post<TokenResponse>('/auth/refresh');
        return response.data;
    },

    /**
     * Logout user.
     */
    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },
};
