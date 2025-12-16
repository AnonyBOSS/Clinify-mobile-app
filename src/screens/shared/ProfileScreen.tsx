import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
    Linking,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input } from '../../components';
import { profileApi } from '../../api';
import { spacing, borderRadius } from '../../theme';

export function ProfileScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user, logout, refreshUser } = useAuth();
    const navigation = useNavigation<any>();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [editName, setEditName] = useState(user?.full_name || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('common.error'), t('profile.fillAllFields'));
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert(t('common.error'), t('profile.passwordsDoNotMatch'));
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert(t('common.error'), t('profile.passwordTooShort'));
            return;
        }

        setIsChangingPassword(true);
        try {
            await profileApi.changePassword({
                currentPassword,
                newPassword,
            });
            Alert.alert(t('common.done'), t('profile.passwordSuccess'));
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || t('profile.failedChangePass');
            Alert.alert(t('common.error'), message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert(t('common.error'), t('profile.nameRequired'));
            return;
        }

        setIsSavingProfile(true);
        try {
            await profileApi.updateProfile({
                full_name: editName.trim(),
                phone: editPhone.trim(),
            });
            // Refresh user data in context
            if (refreshUser) {
                await refreshUser();
            }
            Alert.alert(t('common.done'), t('profile.updateSuccess'));
            setShowEditProfileModal(false);
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || t('profile.failedUpdateProfile');
            Alert.alert(t('common.error'), message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout'),
            t('profile.logoutConfirm'),
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
                    <Text
                        style={[styles.menuValue, { color: colors.textSecondary }]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
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
                    <Text
                        style={[styles.userEmail, { color: colors.textSecondary }]}
                        selectable
                    >
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
                        onPress={() => {
                            setEditName(user?.full_name || '');
                            setEditPhone(user?.phone || '');
                            setShowEditProfileModal(true);
                        }}
                    />
                    <MenuItem
                        icon="call-outline"
                        label={t('auth.phone')}
                        value={user?.phone}
                        onPress={() => {
                            setEditName(user?.full_name || '');
                            setEditPhone(user?.phone || '');
                            setShowEditProfileModal(true);
                        }}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label={t('auth.email')}
                        value={user?.email}
                        showChevron={false}
                    />
                    {user?.role?.toUpperCase() === 'PATIENT' && (
                        <MenuItem
                            icon="star-outline"
                            label={t('profile.myRatings')}
                            onPress={() => navigation.navigate('MyRatings')}
                        />
                    )}
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

                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.support')}</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        label={t('profile.helpCenter')}
                        onPress={() => Linking.openURL('https://clinic-web-app-two.vercel.app/help')}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label={t('profile.privacyPolicy')}
                        onPress={() => Linking.openURL('https://clinic-web-app-two.vercel.app/privacy')}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label={t('profile.termsOfService')}
                        onPress={() => Linking.openURL('https://clinic-web-app-two.vercel.app/terms')}
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

            {/* Change Password Modal */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {t('profile.changePassword')}
                            </Text>
                            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('profile.currentPassword')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('profile.enterCurrentPassword')}
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('profile.newPassword')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('profile.enterNewPassword')}
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('profile.confirmPasswordLabel')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('profile.confirmNewPassword')}
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={() => setShowPasswordModal(false)}
                                variant="outline"
                                style={{ flex: 1, marginRight: spacing.sm }}
                            />
                            <Button
                                title={isChangingPassword ? t('profile.changing') : t('profile.changePassword')}
                                onPress={handleChangePassword}
                                disabled={isChangingPassword}
                                style={{ flex: 1, marginLeft: spacing.sm }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditProfileModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditProfileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {t('profile.editProfile')}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('auth.fullName')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('profile.enterName')}
                                placeholderTextColor={colors.textMuted}
                                value={editName}
                                onChangeText={setEditName}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('auth.phone')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('profile.enterPhone')}
                                placeholderTextColor={colors.textMuted}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={() => setShowEditProfileModal(false)}
                                variant="outline"
                                style={{ flex: 1, marginRight: spacing.sm }}
                            />
                            <Button
                                title={isSavingProfile ? t('profile.saving') : t('profile.saveChanges')}
                                onPress={handleSaveProfile}
                                disabled={isSavingProfile}
                                style={{ flex: 1, marginLeft: spacing.sm }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
        fontSize: 13,
        marginTop: spacing.xs,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
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
        flex: 1,
        justifyContent: 'flex-end',
        marginLeft: spacing.sm,
    },
    menuValue: {
        fontSize: 14,
        textAlign: 'right',
        flexShrink: 1,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalBody: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
    },
});
