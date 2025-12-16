import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors } from '../theme';

const THEME_STORAGE_KEY = '@clinify_theme';

interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
    const [loaded, setLoaded] = useState(false);

    // Load saved theme preference on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDark(savedTheme === 'dark');
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setLoaded(true);
            }
        };
        loadTheme();
    }, []);

    const colors = isDark ? darkColors : lightColors;

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const setTheme = async (dark: boolean) => {
        setIsDark(dark);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

