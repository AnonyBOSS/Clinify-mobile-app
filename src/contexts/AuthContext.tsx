import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, doctorsApi, profileApi } from '../api';
import { getAuthToken, clearAuthToken } from '../api/client';
import { User, LoginCredentials, RegisterData, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await getAuthToken();
            if (token) {
                const { user } = await authApi.getMe();
                setUser(user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            await clearAuthToken();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authApi.login(credentials);
            if (response.data?.user) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message || 'Login failed' };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authApi.register(data);
            if (response.data?.user) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.message || 'Registration failed' };
        } catch (error: any) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const { user } = await authApi.getMe();
            setUser(user);
        } catch (error) {
            console.error('Refresh user failed:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
