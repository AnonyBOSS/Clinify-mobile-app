import apiClient, { setAuthToken, clearAuthToken } from './client';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

export const authApi = {
    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // Backend expects role in uppercase (PATIENT/DOCTOR)
        const payload = {
            email: credentials.email,
            password: credentials.password,
            role: (credentials.role || 'patient').toUpperCase(),
        };
        const response = await apiClient.post('/api/auth/login', payload);
        if (response.data.data?.token) {
            await setAuthToken(response.data.data.token);
        }
        return response.data;
    },

    // Register
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post('/api/auth/register', data);
        if (response.data.data?.token) {
            await setAuthToken(response.data.data.token);
        }
        return response.data;
    },

    // Get current user
    getMe: async (): Promise<{ user: User }> => {
        const response = await apiClient.get('/api/auth/me');
        return { user: response.data.data };
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            // Ignore errors on logout
        } finally {
            await clearAuthToken();
        }
    },
};
