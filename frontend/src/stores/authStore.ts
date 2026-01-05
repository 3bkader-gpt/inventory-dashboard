import { create } from 'zustand';
import { authApi } from '@/api/auth';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start loading to check existing token
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(email, password);

            // Store access token in sessionStorage (more secure than localStorage)
            // Refresh token is stored in HttpOnly cookie by backend
            sessionStorage.setItem('access_token', response.access_token);

            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'Login failed. Please check your credentials.';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout failed', error);
        }

        sessionStorage.removeItem('access_token');
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    checkAuth: async () => {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const user = await authApi.getCurrentUser();
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            // Token invalid, clear it
            sessionStorage.removeItem('access_token');
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
