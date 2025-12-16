import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, EmptyState, LoadingSpinner } from '../../components';
import { appointmentsApi, ratingsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Appointment } from '../../types';

export function PatientDashboard() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
    const [ratedAppointmentIds, setRatedAppointmentIds] = useState<Set<string>>(new Set());

    const fetchAppointments = useCallback(async () => {
        try {
            const { appointments } = await appointmentsApi.getAppointments();
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            const todayAppts: Appointment[] = [];
            const upcomingAppts: Appointment[] = [];
            const pastAppts: Appointment[] = [];

            appointments.forEach((apt) => {
                const slot = apt.slot as any;
                const aptDate = slot?.date || '';

                if (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') {
                    pastAppts.push(apt);
                } else if (aptDate === today) {
                    todayAppts.push(apt);
                } else if (aptDate > today) {
                    upcomingAppts.push(apt);
                } else {
                    pastAppts.push(apt);
                }
            });

            setTodayAppointments(todayAppts);
            setUpcomingAppointments(upcomingAppts);
            setPastAppointments(pastAppts);

            // Fetch user's ratings to know which appointments are already rated
            try {
                const { ratings } = await ratingsApi.getMyRatings();
                const ratedIds = new Set(ratings.map((r: any) => r.appointment?._id || r.appointment));
                setRatedAppointmentIds(ratedIds);
            } catch (err) {
                // Ignore rating fetch errors
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [fetchAppointments])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
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

    const renderAppointmentCard = (appointment: Appointment, index: number) => {
        const doctor = appointment.doctor as any;
        const slot = appointment.slot as any;
        const clinic = appointment.clinic as any;

        return (
            <Card key={appointment.id || `apt-${index}`} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                    <View style={styles.doctorInfo}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {doctor?.full_name?.charAt(0) || 'D'}
                            </Text>
                        </View>
                        <View style={styles.doctorDetails}>
                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                Dr. {doctor?.full_name || 'Unknown'}
                            </Text>
                            <Text style={[styles.specialty, { color: colors.textSecondary }]}>
                                {doctor?.specializations?.[0] || 'General'}
                            </Text>
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
                            {t(`appointments.status.${appointment.status.toLowerCase()}`)}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {slot?.date || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {slot?.time || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                            {clinic?.name || 'N/A'}
                        </Text>
                    </View>
                </View>

                {appointment.status === 'BOOKED' && (
                    <Button
                        title={t('appointments.cancel')}
                        onPress={() => handleCancelAppointment(appointment.id)}
                        variant="outline"
                        size="small"
                        style={styles.cancelButton}
                    />
                )}

                {appointment.status === 'COMPLETED' && (
                    ratedAppointmentIds.has(appointment.id) ? (
                        <View style={[styles.ratedBadge, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.ratedText, { color: colors.success }]}>{t('dashboard.rated')}</Text>
                        </View>
                    ) : (
                        <Button
                            title={`⭐ ${t('dashboard.rateDoctor')}`}
                            onPress={() => navigation.navigate('RateDoctor', {
                                appointmentId: appointment.id,
                                doctorId: doctor?.id || doctor?._id,
                                doctorName: doctor?.full_name,
                            })}
                            variant="primary"
                            size="small"
                            style={styles.rateButton}
                        />
                    )
                )}
            </Card>
        );
    };

    const handleCancelAppointment = async (appointmentId: string) => {
        try {
            await appointmentsApi.cancelAppointment(appointmentId);
            fetchAppointments(); // Refresh list
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                            {t('dashboard.welcome')},
                        </Text>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {user?.full_name || 'User'}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <Ionicons name="calendar-outline" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>{t('dashboard.bookAppointment')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.secondary }]}
                        onPress={() => navigation.navigate('SymptomChecker')}
                    >
                        <Ionicons name="fitness-outline" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>{t('dashboard.symptomChecker')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.success }]}
                        onPress={() => navigation.navigate('AIAssistant')}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFFFFF" />
                        <Text style={styles.actionText}>{t('dashboard.aiAssistant')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Today's Appointments */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('dashboard.todayAppointments')}
                    </Text>
                    {todayAppointments.length > 0 ? (
                        todayAppointments.map((apt, i) => renderAppointmentCard(apt, i))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {t('dashboard.noAppointments')}
                            </Text>
                        </Card>
                    )}
                </View>

                {/* Upcoming Appointments */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('dashboard.upcomingAppointments')}
                        </Text>
                    </View>
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.slice(0, 3).map((apt, i) => renderAppointmentCard(apt, i))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {t('dashboard.noAppointments')}
                            </Text>
                        </Card>
                    )}
                </View>

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('dashboard.pastAppointments')}
                        </Text>
                        {pastAppointments.map((apt, i) => renderAppointmentCard(apt, i))}
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
    scrollContent: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: 14,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    actionCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    appointmentCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    doctorDetails: {
        marginLeft: spacing.sm,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    specialty: {
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    appointmentDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    detailText: {
        fontSize: 13,
    },
    cancelButton: {
        marginTop: spacing.md,
    },
    rateButton: {
        marginTop: spacing.md,
    },
    emptyCard: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    ratedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    ratedText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
