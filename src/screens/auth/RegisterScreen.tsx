import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components';
import { spacing, borderRadius } from '../../theme';
import { AuthStackParamList, UserRole, RegisterData } from '../../types';

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: RegisterScreenProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { register } = useAuth();

    const [role, setRole] = useState<UserRole>('patient');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // Doctor specific
        qualifications: '',
        specializations: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = t('auth.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.password) {
            newErrors.password = t('auth.passwordRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordMismatch');
        }

        if (role === 'doctor') {
            if (!formData.qualifications.trim()) {
                newErrors.qualifications = 'Qualifications are required';
            }
            if (!formData.specializations.trim()) {
                newErrors.specializations = 'Specialization is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const data: RegisterData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role,
            };

            if (role === 'doctor') {
                data.qualifications = formData.qualifications;
                data.specializations = formData.specializations.split(',').map(s => s.trim());
            }

            const result = await register(data);
            if (!result.success) {
                Alert.alert(t('common.error'), result.error || t('auth.registerFailed'));
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('errors.networkError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.logo, { color: colors.primary }]}>Clinify</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Create your account
                        </Text>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.roleTab,
                                {
                                    backgroundColor: role === 'patient' ? colors.primary : colors.surface,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => setRole('patient')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    { color: role === 'patient' ? colors.textOnPrimary : colors.primary },
                                ]}
                            >
                                {t('auth.asPatient')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.roleTab,
                                {
                                    backgroundColor: role === 'doctor' ? colors.primary : colors.surface,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => setRole('doctor')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    { color: role === 'doctor' ? colors.textOnPrimary : colors.primary },
                                ]}
                            >
                                {t('auth.asDoctor')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Form */}
                    <Card style={styles.formCard}>
                        <Text style={[styles.formTitle, { color: colors.text }]}>
                            {t('auth.register')}
                        </Text>

                        <Input
                            label={t('auth.fullName')}
                            value={formData.full_name}
                            onChangeText={(v) => updateField('full_name', v)}
                            placeholder="John Doe"
                            autoCapitalize="words"
                            leftIcon="person-outline"
                            error={errors.full_name}
                        />

                        <Input
                            label={t('auth.email')}
                            value={formData.email}
                            onChangeText={(v) => updateField('email', v)}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            leftIcon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label={t('auth.phone')}
                            value={formData.phone}
                            onChangeText={(v) => updateField('phone', v)}
                            placeholder="+1234567890"
                            keyboardType="phone-pad"
                            leftIcon="call-outline"
                            error={errors.phone}
                        />

                        <Input
                            label={t('auth.password')}
                            value={formData.password}
                            onChangeText={(v) => updateField('password', v)}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                        />

                        <Input
                            label={t('auth.confirmPassword')}
                            value={formData.confirmPassword}
                            onChangeText={(v) => updateField('confirmPassword', v)}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        {/* Doctor-specific fields */}
                        {role === 'doctor' && (
                            <>
                                <Input
                                    label={t('profile.qualifications')}
                                    value={formData.qualifications}
                                    onChangeText={(v) => updateField('qualifications', v)}
                                    placeholder="MD, MBBS, etc."
                                    leftIcon="school-outline"
                                    error={errors.qualifications}
                                />

                                <Input
                                    label={t('profile.specializations')}
                                    value={formData.specializations}
                                    onChangeText={(v) => updateField('specializations', v)}
                                    placeholder="Cardiology, Neurology (comma-separated)"
                                    leftIcon="medical-outline"
                                    error={errors.specializations}
                                    hint="Separate multiple specializations with commas"
                                />
                            </>
                        )}

                        <Button
                            title={t('auth.signUp')}
                            onPress={handleRegister}
                            loading={loading}
                            fullWidth
                            style={styles.registerButton}
                        />
                    </Card>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                            {t('auth.hasAccount')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: colors.primary }]}>
                                {t('auth.signIn')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    logo: {
        fontSize: 42,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        marginTop: spacing.sm,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    roleTab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        borderWidth: 2,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    formCard: {
        padding: spacing.lg,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: spacing.lg,
    },
    registerButton: {
        marginTop: spacing.md,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
