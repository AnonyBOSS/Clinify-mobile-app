import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, LoadingSpinner } from '../../components';
import { analyticsApi, DoctorAnalytics } from '../../api';
import { spacing, borderRadius } from '../../theme';

export function DoctorDashboard() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            const { analytics: data } = await analyticsApi.getDoctorAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return colors.info;
            case 'CONFIRMED':
                return colors.success;
            case 'CANCELLED':
                return colors.error;
            case 'COMPLETED':
                return colors.textMuted;
            default:
                return colors.textSecondary;
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    const summary = analytics?.summary;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Header */}
                <View style={styles.header}>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                        {t('dashboard.welcome')},
                    </Text>
                    <Text style={[styles.userName, { color: colors.text }]}>
                        Dr. {user?.full_name || 'Doctor'}
                    </Text>
                </View>

                {/* Main Stats Row */}
                <View style={styles.statsContainer}>
                    <Card style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="calendar" size={24} color={colors.primary} />
                        <Text style={[styles.statNumber, { color: colors.primary }]}>
                            {summary?.totalAppointments || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                    </Card>
                    <Card style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        <Text style={[styles.statNumber, { color: colors.success }]}>
                            {summary?.completedAppointments || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
                    </Card>
                    <Card style={[styles.statCard, { backgroundColor: colors.info + '15' }]}>
                        <Ionicons name="time" size={24} color={colors.info} />
                        <Text style={[styles.statNumber, { color: colors.info }]}>
                            {summary?.upcomingCount || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Upcoming</Text>
                    </Card>
                </View>

                {/* Revenue & Ratings Row */}
                <View style={styles.statsContainer}>
                    <Card style={[styles.wideStatCard, { backgroundColor: colors.success + '10' }]}>
                        <View style={styles.wideStatContent}>
                            <Ionicons name="cash-outline" size={28} color={colors.success} />
                            <View style={styles.wideStatText}>
                                <Text style={[styles.wideStatNumber, { color: colors.success }]}>
                                    ${summary?.totalRevenue || 0}
                                </Text>
                                <Text style={[styles.wideStatLabel, { color: colors.textSecondary }]}>
                                    Total Revenue
                                </Text>
                            </View>
                        </View>
                    </Card>
                    <Card style={[styles.wideStatCard, { backgroundColor: colors.warning + '10' }]}>
                        <View style={styles.wideStatContent}>
                            <Ionicons name="star" size={28} color={colors.warning} />
                            <View style={styles.wideStatText}>
                                <Text style={[styles.wideStatNumber, { color: colors.warning }]}>
                                    {summary?.avgRating || 0} ★
                                </Text>
                                <Text style={[styles.wideStatLabel, { color: colors.textSecondary }]}>
                                    Rating ({summary?.totalRatings || 0})
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Available Slots */}
                <Card style={styles.slotsCard}>
                    <View style={styles.slotsHeader}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={[styles.slotsTitle, { color: colors.text }]}>
                            Available Slots
                        </Text>
                    </View>
                    <Text style={[styles.slotsNumber, { color: colors.primary }]}>
                        {summary?.availableSlots || 0}
                    </Text>
                    <Text style={[styles.slotsSubtitle, { color: colors.textSecondary }]}>
                        open slots for booking
                    </Text>
                </Card>

                {/* Upcoming Week */}
                {analytics?.upcomingStats && analytics.upcomingStats.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Next 7 Days
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.weekContainer}>
                                {analytics.upcomingStats.map((day, index) => (
                                    <Card key={day.date} style={[
                                        styles.dayCard,
                                        day.appointments > 0 ? { backgroundColor: colors.primary + '15' } : {}
                                    ]}>
                                        <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                                            {day.day}
                                        </Text>
                                        <Text style={[
                                            styles.dayCount,
                                            { color: day.appointments > 0 ? colors.primary : colors.textMuted }
                                        ]}>
                                            {day.appointments}
                                        </Text>
                                    </Card>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Upcoming Appointments */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Upcoming Appointments
                    </Text>

                    {analytics?.upcomingAppointments && analytics.upcomingAppointments.length > 0 ? (
                        analytics.upcomingAppointments.map((appointment, index) => (
                            <Card key={appointment.id || `apt-${index}`} style={styles.appointmentCard}>
                                <View style={styles.appointmentHeader}>
                                    <View style={styles.patientInfo}>
                                        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                                            <Text style={styles.avatarText}>
                                                {appointment.patient?.charAt(0) || 'P'}
                                            </Text>
                                        </View>
                                        <View style={styles.patientDetails}>
                                            <Text style={[styles.patientName, { color: colors.text }]}>
                                                {appointment.patient || 'Patient'}
                                            </Text>
                                            <View style={styles.timeRow}>
                                                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                                                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                                                    {appointment.date} • {appointment.time}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(appointment.status) + '20' },
                                        ]}
                                    >
                                        <Text
                                            style={[styles.statusText, { color: getStatusColor(appointment.status) }]}
                                        >
                                            {appointment.status}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                No upcoming appointments
                            </Text>
                        </Card>
                    )}
                </View>

                {/* Busy Hours */}
                {analytics?.busyHours && analytics.busyHours.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Popular Hours
                        </Text>
                        <Card style={styles.busyHoursCard}>
                            {analytics.busyHours.slice(0, 5).map((hour, index) => (
                                <View key={hour.hour} style={styles.busyHourRow}>
                                    <Text style={[styles.busyHourTime, { color: colors.text }]}>
                                        {hour.hour}
                                    </Text>
                                    <View style={styles.busyHourBarContainer}>
                                        <View
                                            style={[
                                                styles.busyHourBar,
                                                {
                                                    backgroundColor: colors.primary,
                                                    width: `${Math.min((hour.appointments / Math.max(...analytics.busyHours.map(h => h.appointments))) * 100, 100)}%`
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.busyHourCount, { color: colors.textSecondary }]}>
                                        {hour.appointments}
                                    </Text>
                                </View>
                            ))}
                        </Card>
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
    header: {
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: 14,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: 11,
        marginTop: spacing.xs,
    },
    wideStatCard: {
        flex: 1,
        padding: spacing.md,
    },
    wideStatContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    wideStatText: {
        flex: 1,
    },
    wideStatNumber: {
        fontSize: 20,
        fontWeight: '700',
    },
    wideStatLabel: {
        fontSize: 12,
    },
    slotsCard: {
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    slotsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    slotsTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    slotsNumber: {
        fontSize: 36,
        fontWeight: '700',
        marginTop: spacing.sm,
    },
    slotsSubtitle: {
        fontSize: 12,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    weekContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    dayCard: {
        width: 60,
        alignItems: 'center',
        padding: spacing.sm,
    },
    dayName: {
        fontSize: 12,
        fontWeight: '500',
    },
    dayCount: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    appointmentCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    patientDetails: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    patientName: {
        fontSize: 15,
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    timeText: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    busyHoursCard: {
        padding: spacing.md,
    },
    busyHourRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    busyHourTime: {
        width: 50,
        fontSize: 12,
        fontWeight: '500',
    },
    busyHourBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginHorizontal: spacing.sm,
    },
    busyHourBar: {
        height: '100%',
        borderRadius: 4,
    },
    busyHourCount: {
        width: 30,
        fontSize: 12,
        textAlign: 'right',
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 14,
    },
});
