import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, spacing } from '../theme';

interface CardProps {
    children: ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'small' | 'medium' | 'large';
    style?: StyleProp<ViewStyle>;
}

export function Card({
    children,
    variant = 'elevated',
    padding = 'medium',
    style,
}: CardProps) {
    const { colors, isDark } = useTheme();

    const getPadding = () => {
        switch (padding) {
            case 'none':
                return 0;
            case 'small':
                return spacing.sm;
            case 'large':
                return spacing.lg;
            default:
                return spacing.md;
        }
    };

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'outlined':
                return {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'filled':
                return {
                    backgroundColor: colors.surfaceVariant,
                };
            default: // elevated
                return {
                    backgroundColor: colors.cardBackground,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                };
        }
    };

    return (
        <View
            style={[
                styles.card,
                { padding: getPadding() },
                getVariantStyles(),
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
});
