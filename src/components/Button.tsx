import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
}: ButtonProps) {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return colors.border;
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.secondary;
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.textMuted;
        switch (variant) {
            case 'primary':
            case 'secondary':
                return colors.textOnPrimary;
            case 'outline':
            case 'ghost':
                return colors.primary;
            default:
                return colors.textOnPrimary;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
            case 'large':
                return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
            default:
                return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return 14;
            case 'large':
                return 18;
            default:
                return 16;
        }
    };

    const buttonStyles: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: disabled ? colors.border : colors.primary,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...getPadding(),
        ...(fullWidth && { width: '100%' }),
    };

    const textStyles: TextStyle = {
        color: getTextColor(),
        fontSize: getFontSize(),
        fontWeight: '600',
        marginLeft: icon && iconPosition === 'left' ? spacing.sm : 0,
        marginRight: icon && iconPosition === 'right' ? spacing.sm : 0,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[buttonStyles, style]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text style={[textStyles, textStyle]}>{title}</Text>
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </TouchableOpacity>
    );
}
