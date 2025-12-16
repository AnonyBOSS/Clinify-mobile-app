import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSpinner } from '../components';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { DoctorNavigator } from './DoctorNavigator';

export function RootNavigator() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const { colors, isDark } = useTheme();

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        dark: isDark,
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.error,
        },
    };

    if (isLoading) {
        return <LoadingSpinner fullScreen message="Loading..." />;
    }

    // Check role case-insensitively (backend may return 'DOCTOR' or 'doctor')
    const isDoctor = user?.role?.toUpperCase() === 'DOCTOR';

    return (
        <NavigationContainer theme={navigationTheme}>
            {!isAuthenticated ? (
                <AuthNavigator />
            ) : isDoctor ? (
                <DoctorNavigator />
            ) : (
                <PatientNavigator />
            )}
        </NavigationContainer>
    );
}
