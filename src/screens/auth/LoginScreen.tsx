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
import { AuthStackParamList, UserRole } from '../../types';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { login } = useAuth();

    const [role, setRole] = useState<UserRole>('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = t('auth.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = t('auth.passwordRequired');
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const result = await login({ email, password, role });
            if (!result.success) {
                Alert.alert(t('common.error'), result.error || t('auth.invalidCredentials'));
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
                    {/* Logo/Header */}
                    <View style={styles.header}>
                        <Text style={[styles.logo, { color: colors.primary }]}>Clinify</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Your Health, Our Priority
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

                    {/* Login Form */}
                    <Card style={styles.formCard}>
                        <Text style={[styles.formTitle, { color: colors.text }]}>
                            {t('auth.login')}
                        </Text>

                        <Input
                            label={t('auth.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            leftIcon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label={t('auth.password')}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                {t('auth.forgotPassword')}
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title={t('auth.signIn')}
                            onPress={handleLogin}
                            loading={loading}
                            fullWidth
                            style={styles.loginButton}
                        />
                    </Card>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                            {t('auth.noAccount')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLink, { color: colors.primary }]}>
                                {t('auth.signUp')}
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
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    logo: {
        fontSize: 48,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        marginTop: spacing.sm,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    registerText: {
        fontSize: 14,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
