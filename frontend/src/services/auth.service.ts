import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
};

// Get current user profile
export const getProfile = async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile');
    return response.data;
};

// Update user profile
export const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
};

// Change password
export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
    });
    return response.data;
};
