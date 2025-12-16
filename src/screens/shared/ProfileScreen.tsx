import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components';
import { spacing, borderRadius } from '../../theme';

export function ProfileScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user, logout } = useAuth();

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            'Are you sure you want to logout?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auth.logout'), style: 'destructive', onPress: logout },
            ]
        );
    };

    const MenuItem = ({
        icon,
        label,
        value,
        onPress,
        showChevron = true,
        rightComponent,
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        label: string;
        value?: string;
        onPress?: () => void;
        showChevron?: boolean;
        rightComponent?: React.ReactNode;
    }) => (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onPress}
            disabled={!onPress && !rightComponent}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {value && (
                    <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                        {value}
                    </Text>
                )}
                {rightComponent}
                {showChevron && onPress && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.full_name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>
                        {user?.role?.toUpperCase() === 'DOCTOR' ? 'Dr. ' : ''}{user?.full_name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                        {user?.email}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.roleText, { color: colors.primary }]}>
                            {user?.role?.toUpperCase() === 'DOCTOR' ? 'Doctor' : 'Patient'}
                        </Text>
                    </View>
                </View>

                {/* Personal Info */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('profile.personalInfo')}
                    </Text>
                    <MenuItem
                        icon="person-outline"
                        label={t('auth.fullName')}
                        value={user?.full_name}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="call-outline"
                        label={t('auth.phone')}
                        value={user?.phone}
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label={t('auth.email')}
                        value={user?.email}
                        showChevron={false}
                    />
                </Card>

                {/* Settings */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('profile.settings')}
                    </Text>
                    <MenuItem
                        icon="moon-outline"
                        label={t('profile.darkMode')}
                        showChevron={false}
                        rightComponent={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        }
                    />
                    <MenuItem
                        icon="language-outline"
                        label={t('profile.language')}
                        value={language === 'en' ? 'English' : 'العربية'}
                        onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                    />
                    <MenuItem
                        icon="lock-closed-outline"
                        label={t('profile.changePassword')}
                        onPress={() => setShowPasswordModal(true)}
                    />
                </Card>

                {/* Support */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help Center"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label="Privacy Policy"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Terms of Service"
                        onPress={() => { }}
                    />
                </Card>

                {/* Logout */}
                <Button
                    title={t('auth.logout')}
                    onPress={handleLogout}
                    variant="outline"
                    fullWidth
                    style={styles.logoutButton}
                    icon={<Ionicons name="log-out-outline" size={20} color={colors.primary} />}
                />

                <Text style={[styles.version, { color: colors.textMuted }]}>
                    Version 1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '600',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    roleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    section: {
        marginBottom: spacing.md,
        padding: 0,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    menuLabel: {
        fontSize: 15,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    menuValue: {
        fontSize: 14,
    },
    logoutButton: {
        marginTop: spacing.md,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
});
