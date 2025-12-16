import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Token storage keys
const TOKEN_KEY = 'auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.removeItem(TOKEN_KEY);
            // The auth context will handle redirecting to login
        }
        return Promise.reject(error);
    }
);

// Token management
export const setAuthToken = async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};

export default apiClient;

