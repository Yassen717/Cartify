import axios from 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        /** Skip the 401 -> refresh -> retry flow for this request (used by the refresh call itself) */
        _skipAuthRetry?: boolean;
    }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AUTH_STORAGE_KEY = 'auth-storage';

// CSRF token cache
let csrfToken: string | null = null;

// Fetch CSRF token
const fetchCsrfToken = async (): Promise<string | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
            withCredentials: true,
        });
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.warn('Failed to fetch CSRF token (continuing without it):', error);
        return null;
    }
};

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies (refresh token + session)
});

// --- Token storage helpers -------------------------------------------------
// Access token lives ONLY in zustand's persisted 'auth-storage'.
// The refresh token is never stored in JS-accessible storage; the backend
// sends it as an httpOnly cookie scoped to /api/auth.

const getStoredAccessToken = (): string | null => {
    // Legacy raw key written by older versions of the app
    const legacyToken = localStorage.getItem('accessToken');
    if (legacyToken) return legacyToken;

    try {
        const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            return parsed?.state?.accessToken || null;
        }
    } catch {
        // Ignore parsing errors
    }
    return null;
};

const updateStoredAccessToken = (accessToken: string): void => {
    try {
        const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);
        const parsed = authStorage ? JSON.parse(authStorage) : { state: {} };
        parsed.state = { ...(parsed.state || {}), accessToken };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
        // Ignore storage errors
    }
    // Clean up legacy copy so it can't go stale
    localStorage.removeItem('accessToken');
};

const clearAuthStorage = (): void => {
    try {
        const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            parsed.state = {
                ...(parsed.state || {}),
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
    } catch {
        // Ignore storage errors
    }
    // Remove legacy keys from older versions of the app
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// --- Refresh flow ----------------------------------------------------------
// Single-flight: concurrent 401s share one refresh request so the rotated
// refresh token is only consumed once.
let refreshPromise: Promise<string | null> | null = null;

const performRefresh = (): Promise<string | null> => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                // Goes through the `api` instance so the CSRF header and the
                // httpOnly refresh cookie are sent automatically.
                const response = await api.post('/auth/refresh', {}, { _skipAuthRetry: true });
                const { accessToken } = response.data.data;
                updateStoredAccessToken(accessToken);
                return accessToken as string;
            } catch {
                return null;
            }
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};

// Request interceptor - add auth token and CSRF token to requests
api.interceptors.request.use(
    async (config) => {
        // Add CSRF token for non-GET requests (only in production)
        if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
            // Only fetch CSRF in production or if explicitly needed
            if (import.meta.env.PROD) {
                if (!csrfToken) {
                    await fetchCsrfToken();
                }
                if (csrfToken) {
                    config.headers['x-csrf-token'] = csrfToken;
                }
            }
        }

        const token = getStoredAccessToken()?.trim();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle CSRF token errors
        if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
            // Fetch new CSRF token and retry
            csrfToken = null;
            await fetchCsrfToken();
            if (csrfToken) {
                originalRequest.headers['x-csrf-token'] = csrfToken;
                return api(originalRequest);
            }
        }

        // Internal requests (e.g. the refresh call itself) bypass this flow
        if (originalRequest?._skipAuthRetry) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check error message to determine if we should try refresh
            const errorMessage = error.response?.data?.message || '';

            // Only try refresh if token is expired or invalid (not if no token provided)
            if (errorMessage === 'Token expired' || errorMessage === 'Invalid token') {
                const newAccessToken = await performRefresh();

                if (newAccessToken) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }

                // Refresh failed (invalid/expired/reused refresh token) -> force re-login
                clearAuthStorage();
                window.location.href = '/login';
            } else if (errorMessage === 'No token provided') {
                // No token - redirect to login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
