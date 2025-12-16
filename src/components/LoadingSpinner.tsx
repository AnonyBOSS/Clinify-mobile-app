import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = 'large',
    message,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const { colors } = useTheme();

    const content = (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={colors.primary} />
            {message && (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {message}
                </Text>
            )}
        </View>
    );

    if (fullScreen) {
        return (
            <View
                style={[
                    styles.fullScreen,
                    { backgroundColor: colors.background },
                ]}
            >
                {content}
            </View>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    fullScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        marginTop: spacing.md,
        fontSize: 14,
    },
});
