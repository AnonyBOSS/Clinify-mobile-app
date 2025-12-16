import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon = 'document-outline',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: colors.surfaceVariant },
                ]}
            >
                <Ionicons name={icon} size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message && (
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {message}
                </Text>
            )}
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={styles.action}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    action: {
        marginTop: spacing.lg,
    },
});
