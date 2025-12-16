import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightPress?: () => void;
    rightBadge?: number;
}

export function Header({
    title,
    showBack = false,
    onBack,
    rightIcon,
    onRightPress,
    rightBadge,
}: HeaderProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.headerBackground,
                    paddingTop: insets.top + spacing.sm,
                    borderBottomColor: colors.border,
                },
            ]}
        >
            <View style={styles.content}>
                {showBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}

                <Text
                    style={[styles.title, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {rightIcon ? (
                    <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                        <Ionicons name={rightIcon} size={24} color={colors.text} />
                        {rightBadge !== undefined && rightBadge > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.error }]}>
                                <Text style={styles.badgeText}>
                                    {rightBadge > 99 ? '99+' : rightBadge}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingBottom: spacing.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconPlaceholder: {
        width: 40,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
