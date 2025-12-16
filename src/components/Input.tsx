import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    secureTextEntry,
    containerStyle,
    ...props
}: InputProps) {
    const { colors } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = secureTextEntry !== undefined;
    const showPassword = isPassword ? !isPasswordVisible : false;

    const getBorderColor = () => {
        if (error) return colors.error;
        if (isFocused) return colors.primary;
        return colors.border;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.inputBackground,
                        borderColor: getBorderColor(),
                        borderWidth: isFocused || error ? 2 : 1,
                    },
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={colors.textMuted}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                            flex: 1,
                        },
                    ]}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={isPassword ? !isPasswordVisible : false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.rightIcon}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
                {rightIcon && !isPassword && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                        disabled={!onRightIconPress}
                    >
                        <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            )}
            {hint && !error && (
                <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: spacing.sm,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    error: {
        fontSize: 12,
        marginTop: spacing.xs,
    },
    hint: {
        fontSize: 12,
        marginTop: spacing.xs,
    },
});
