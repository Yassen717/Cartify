import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import * as authService from '../services/auth.service';
import type { User } from '../services/auth.service';

interface ApiErrorBody {
    message?: string;
    details?: unknown;
}

const getErrorData = (error: unknown): ApiErrorBody | undefined =>
    axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data : undefined;

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
    updateAccessToken: (token: string) => void;
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
                    const { user, accessToken } = response.data;

                    // Clean up legacy raw token keys - the refresh token now
                    // lives in an httpOnly cookie, never in localStorage.
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    set({
                        user,
                        accessToken,
                        refreshToken: null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: getErrorData(error)?.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: authService.RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.register(data);
                    const { user, accessToken } = response.data;

                    // Refresh token is delivered via httpOnly cookie
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    set({
                        user,
                        accessToken,
                        refreshToken: null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    const data = getErrorData(error);
                    // Extract error message with validation details
                    let errorMessage = data?.message || 'Registration failed';
                    const details = data?.details;

                    // If there are validation details, format them
                    if (Array.isArray(details)) {
                        const validationErrors = details
                            .map((detail) =>
                                detail && typeof detail === 'object' && 'message' in detail
                                    ? String(detail.message)
                                    : String(detail)
                            )
                            .join(', ');
                        errorMessage = validationErrors || errorMessage;
                    } else if (typeof details === 'string') {
                        errorMessage = details;
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
                    // Clear any legacy raw token keys
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

            updateAccessToken: (token: string) => {
                set({ accessToken: token });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
