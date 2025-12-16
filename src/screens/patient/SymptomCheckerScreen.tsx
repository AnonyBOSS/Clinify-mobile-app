import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, Header } from '../../components';
import { aiApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { SymptomCheckResult } from '../../types';

export function SymptomCheckerScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SymptomCheckResult | null>(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) {
            Alert.alert(t('common.error'), t('ai.pleaseDescribe'));
            return;
        }

        setLoading(true);
        try {
            const response = await aiApi.checkSymptoms(symptoms);
            setResult(response);
        } catch (error) {
            Alert.alert(t('common.error'), t('ai.failedToAnalyze'));
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency?: string) => {
        switch (urgency?.toUpperCase()) {
            case 'HIGH':
                return colors.error;
            case 'MEDIUM':
                return colors.warning;
            default:
                return colors.success;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title={t('ai.symptomChecker')}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Disclaimer */}
                <Card style={[styles.disclaimerCard, { backgroundColor: colors.surfaceVariant }]}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                        {t('ai.disclaimer')}
                    </Text>
                </Card>

                {/* Symptom Input */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('ai.describeSymptoms')}
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    ]}
                >
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="E.g., I've been having headaches and feeling dizzy for the past 3 days..."
                        placeholderTextColor={colors.textMuted}
                        value={symptoms}
                        onChangeText={setSymptoms}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                    />
                </View>

                <Button
                    title={loading ? t('ai.analyzing') : t('ai.analyzeSymptoms')}
                    onPress={handleAnalyze}
                    loading={loading}
                    disabled={!symptoms.trim()}
                    fullWidth
                    icon={<Ionicons name="search" size={20} color="#FFFFFF" />}
                />

                {/* Results */}
                {result && (
                    <View style={styles.results}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('ai.results')}
                        </Text>

                        {/* Urgency */}
                        <Card style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Ionicons
                                    name="alert-circle"
                                    size={24}
                                    color={getUrgencyColor(result.urgencyLevel)}
                                />
                                <Text style={[styles.resultTitle, { color: colors.text }]}>
                                    {t('ai.urgency')}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.urgencyBadge,
                                    { backgroundColor: getUrgencyColor(result.urgencyLevel) + '20' },
                                ]}
                            >
                                <Text
                                    style={[styles.urgencyText, { color: getUrgencyColor(result.urgencyLevel) }]}
                                >
                                    {result.urgencyLevel || 'LOW'}
                                </Text>
                            </View>
                        </Card>

                        <Card style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Ionicons name="document-text" size={24} color={colors.primary} />
                                <Text style={[styles.resultTitle, { color: colors.text }]}>
                                    {t('ai.summary')}
                                </Text>
                            </View>
                            <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                                {result.summary}
                            </Text>
                        </Card>

                        {/* Possible Conditions */}
                        {result.possibleConditions?.length > 0 && (
                            <Card style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="fitness" size={24} color={colors.warning} />
                                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                                        {t('ai.possibleConditions')}
                                    </Text>
                                </View>
                                {result.possibleConditions.map((condition, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <Text style={[styles.bulletPoint, { color: colors.warning }]}>•</Text>
                                        <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                                            {condition}
                                        </Text>
                                    </View>
                                ))}
                            </Card>
                        )}

                        {/* Detailed Analysis */}
                        <Card style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Ionicons name="analytics" size={24} color={colors.info} />
                                <Text style={[styles.resultTitle, { color: colors.text }]}>
                                    {t('ai.detailedAnalysis')}
                                </Text>
                            </View>
                            <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                                {result.detailedAnalysis}
                            </Text>
                        </Card>

                        {/* Self Care Advice */}
                        {result.selfCareAdvice?.length > 0 && (
                            <Card style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="heart" size={24} color={colors.success} />
                                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                                        {t('ai.selfCareAdvice')}
                                    </Text>
                                </View>
                                {result.selfCareAdvice.map((advice, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <Text style={[styles.bulletPoint, { color: colors.success }]}>•</Text>
                                        <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                                            {advice}
                                        </Text>
                                    </View>
                                ))}
                            </Card>
                        )}

                        {/* Warning Signs */}
                        {result.warningSignsToWatch?.length > 0 && (
                            <Card style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="warning" size={24} color={colors.error} />
                                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                                        {t('ai.warningSignsToWatch')}
                                    </Text>
                                </View>
                                {result.warningSignsToWatch.map((warning, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <Text style={[styles.bulletPoint, { color: colors.error }]}>•</Text>
                                        <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                                            {warning}
                                        </Text>
                                    </View>
                                ))}
                            </Card>
                        )}

                        {/* Suggested Specialists */}
                        {result.suggestedSpecialties?.length > 0 && (
                            <Card style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="medical" size={24} color={colors.secondary} />
                                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                                        {t('ai.suggestedSpecialists')}
                                    </Text>
                                </View>
                                <View style={styles.specialistTags}>
                                    {result.suggestedSpecialties.map((spec, index) => (
                                        <View
                                            key={index}
                                            style={[styles.specialistTag, { backgroundColor: colors.primary + '20' }]}
                                        >
                                            <Text style={[styles.specialistText, { color: colors.primary }]}>
                                                {spec}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <Button
                                    title={t('ai.findDoctors')}
                                    onPress={() => {
                                        // Navigate to Search which is in the tabs
                                        const parentNav = navigation.getParent() || navigation;
                                        parentNav.navigate('Search');
                                    }}
                                    variant="outline"
                                    fullWidth
                                    style={styles.findButton}
                                />
                            </Card>
                        )}
                    </View>
                )}
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
    disclaimerCard: {
        flexDirection: 'row',
        padding: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    input: {
        padding: spacing.md,
        fontSize: 16,
        minHeight: 120,
    },
    results: {
        marginTop: spacing.xl,
    },
    resultCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    resultText: {
        fontSize: 14,
        lineHeight: 22,
    },
    urgencyBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    urgencyText: {
        fontSize: 14,
        fontWeight: '700',
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
        gap: spacing.sm,
    },
    bulletPoint: {
        fontSize: 16,
        fontWeight: '700',
    },
    specialistTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    specialistTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    specialistText: {
        fontSize: 14,
        fontWeight: '500',
    },
    findButton: {
        marginTop: spacing.sm,
    },
});
