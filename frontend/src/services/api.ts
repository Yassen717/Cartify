import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
    (config) => {
        // Try to get token from localStorage first
        let token = localStorage.getItem('accessToken');
        
        // If not found, try to get it from zustand persist storage
        if (!token) {
            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    token = parsed?.state?.accessToken || null;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        
        // Clean token (remove any whitespace)
        if (token) {
            token = token.trim();
            // Only add token if it's not empty after trimming
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check error message to determine if we should try refresh
            const errorMessage = error.response?.data?.message || '';
            
            // Only try refresh if token is expired or invalid (not if no token provided)
            if (errorMessage === 'Token expired' || errorMessage === 'Invalid token') {
                try {
                    // Try to get refresh token from localStorage or zustand
                    let refreshToken = localStorage.getItem('refreshToken');
                    
                    if (!refreshToken) {
                        try {
                            const authStorage = localStorage.getItem('auth-storage');
                            if (authStorage) {
                                const parsed = JSON.parse(authStorage);
                                refreshToken = parsed?.state?.refreshToken || null;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                    
                    if (refreshToken) {
                        refreshToken = refreshToken.trim();
                        
                        // Try to refresh the token
                        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                            refreshToken,
                        });

                        const { accessToken } = response.data.data;
                        // Save new token to both locations
                        localStorage.setItem('accessToken', accessToken);
                        
                        // Update zustand storage if it exists
                        try {
                            const authStorage = localStorage.getItem('auth-storage');
                            if (authStorage) {
                                const parsed = JSON.parse(authStorage);
                                parsed.state.accessToken = accessToken;
                                localStorage.setItem('auth-storage', JSON.stringify(parsed));
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }

                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed, clear tokens and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    
                    // Clear zustand storage
                    try {
                        const authStorage = localStorage.getItem('auth-storage');
                        if (authStorage) {
                            const parsed = JSON.parse(authStorage);
                            parsed.state.accessToken = null;
                            parsed.state.refreshToken = null;
                            parsed.state.isAuthenticated = false;
                            parsed.state.user = null;
                            localStorage.setItem('auth-storage', JSON.stringify(parsed));
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                    
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else if (errorMessage === 'No token provided') {
                // No token - redirect to login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
