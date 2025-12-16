import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner } from '../../components';
import { doctorsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { ScheduleDay } from '../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const { schedule: fetchedSchedule } = await doctorsApi.getSchedule();
            setSchedule(fetchedSchedule || []);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSlots = async () => {
        if (schedule.length === 0) {
            Alert.alert('Error', 'Please configure your schedule first');
            return;
        }

        setGenerating(true);
        try {
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            await doctorsApi.generateSlots({
                clinicId: schedule[0].clinic,
                roomId: schedule[0].room,
                startDate,
                endDate,
            });

            Alert.alert('Success', t('schedule.slotsGenerated'));
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to generate slots');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('schedule.title')}
                    </Text>
                </View>

                {/* Schedule Info Card */}
                <Card style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Configure your working days and times below. Then generate slots to make them available for booking.
                    </Text>
                </Card>

                {/* Working Days */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('schedule.workingDays')}
                </Text>

                {schedule.length > 0 ? (
                    schedule.map((day, index) => (
                        <Card key={index} style={styles.dayCard}>
                            <View style={styles.dayHeader}>
                                <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.dayBadgeText}>
                                        {DAYS[day.dayOfWeek].substring(0, 3)}
                                    </Text>
                                </View>
                                <View style={styles.dayInfo}>
                                    <Text style={[styles.dayName, { color: colors.text }]}>
                                        {DAYS[day.dayOfWeek]}
                                    </Text>
                                    <View style={styles.timeRow}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                                            {day.startTime} - {day.endTime}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.editButton}>
                                    <Ionicons name="pencil" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.dayDetails, { borderTopColor: colors.border }]}>
                                <View style={styles.detailItem}>
                                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                                        Slot Duration
                                    </Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {day.slotDurationMinutes} min
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            {t('schedule.noSchedule')}
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Add your working days and times to get started
                        </Text>
                        <Button
                            title={t('schedule.addSchedule')}
                            onPress={() => { }}
                            variant="primary"
                            style={styles.addButton}
                            icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
                        />
                    </Card>
                )}

                {/* Generate Slots */}
                {schedule.length > 0 && (
                    <Button
                        title={t('schedule.generateSlots')}
                        onPress={handleGenerateSlots}
                        loading={generating}
                        fullWidth
                        style={styles.generateButton}
                        icon={<Ionicons name="flash" size={20} color="#FFFFFF" />}
                    />
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
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    infoCard: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    dayCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayBadge: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    dayInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    timeText: {
        fontSize: 13,
    },
    editButton: {
        padding: spacing.sm,
    },
    dayDetails: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        marginBottom: spacing.xs,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    addButton: {
        marginTop: spacing.lg,
    },
    generateButton: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
});
