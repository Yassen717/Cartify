import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/auth.service';
import type { User } from '../services/auth.service';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: authService.RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login({ email, password });
                    const { user, accessToken, refreshToken } = response.data;

                    // Store tokens
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: authService.RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.register(data);
                    const { user, accessToken, refreshToken } = response.data;

                    // Store tokens
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    // Extract error message with validation details
                    let errorMessage = error.response?.data?.message || 'Registration failed';
                    
                    // If there are validation details, format them
                    if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
                        const validationErrors = error.response.data.details
                            .map((detail: any) => detail.message || `${detail.field}: ${detail.message}`)
                            .join(', ');
                        errorMessage = validationErrors || errorMessage;
                    } else if (error.response?.data?.details && typeof error.response.data.details === 'string') {
                        errorMessage = error.response.data.details;
                    }
                    
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    // Clear tokens and state
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                    });
                }
            },

            setUser: (user: User) => {
                set({ user });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
