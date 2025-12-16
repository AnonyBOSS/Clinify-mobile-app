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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner, Header } from '../../components';
import { doctorsApi, appointmentsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Slot, Doctor } from '../../types';

type BookingRouteParams = {
    Booking: { doctorId: string; doctorName: string; consultationFee?: number };
};

export function BookingScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<BookingRouteParams, 'Booking'>>();
    const { doctorId, doctorName, consultationFee = 300 } = route.params;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [allSlots, setAllSlots] = useState<Slot[]>([]);
    const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [notes, setNotes] = useState('');

    // Get unique dates from all available slots
    const getAvailableDates = () => {
        const uniqueDates = [...new Set(allSlots.map(s => s.date))].sort();
        return uniqueDates.map(dateStr => {
            const date = new Date(dateStr);
            return {
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: date.getDate(),
            };
        });
    };

    // Fetch all available slots on mount
    useEffect(() => {
        fetchAllSlots();
    }, []);

    // Filter slots when date changes
    useEffect(() => {
        if (selectedDate) {
            setFilteredSlots(allSlots.filter(s => s.date === selectedDate));
            setSelectedSlot(null);
        } else {
            setFilteredSlots(allSlots);
        }
    }, [selectedDate, allSlots]);

    const fetchAllSlots = async () => {
        setLoading(true);
        try {
            // Fetch slots without date filter to get all available slots
            const { slots: fetchedSlots } = await doctorsApi.getAvailableSlots(doctorId);
            const availableSlots = fetchedSlots.filter(s => s.status === 'AVAILABLE');
            setAllSlots(availableSlots);

            // Auto-select first available date if slots exist
            if (availableSlots.length > 0) {
                const firstDate = availableSlots[0].date;
                setSelectedDate(firstDate);
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        setBooking(true);
        try {
            // Get clinicId and roomId from slot if available
            const slotData = selectedSlot as any;
            await appointmentsApi.bookAppointment({
                doctorId,
                clinicId: slotData.clinic?._id || slotData.clinic || slotData.clinicId,
                roomId: slotData.room?._id || slotData.room || slotData.roomId,
                slotId: selectedSlot.id,
                method: paymentMethod.toUpperCase() as 'CASH' | 'CARD',
                notes,
            });
            Alert.alert('Success', t('appointments.bookingSuccess'), [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            const message = error.response?.data?.error || error.response?.data?.message || 'Booking failed';
            Alert.alert('Error', message);
        } finally {
            setBooking(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title={`${t('appointments.book')}`}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Doctor Info */}
                <Card style={styles.doctorCard}>
                    <View style={styles.doctorRow}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>{doctorName.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                Dr. {doctorName}
                            </Text>
                            <Text style={[styles.consultFee, { color: colors.textSecondary }]}>
                                Consultation Fee: ${consultationFee}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Date Selection */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('appointments.selectDate')}
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateScroll}
                >
                    {getAvailableDates().map((d) => (
                        <TouchableOpacity
                            key={d.date}
                            style={[
                                styles.dateCard,
                                {
                                    backgroundColor: selectedDate === d.date ? colors.primary : colors.surface,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => {
                                setSelectedDate(d.date);
                                setSelectedSlot(null);
                            }}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    { color: selectedDate === d.date ? '#FFFFFF' : colors.textSecondary },
                                ]}
                            >
                                {d.day}
                            </Text>
                            <Text
                                style={[
                                    styles.dayNum,
                                    { color: selectedDate === d.date ? '#FFFFFF' : colors.text },
                                ]}
                            >
                                {d.dayNum}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Time Slots */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('appointments.selectTime')}
                </Text>
                {loading ? (
                    <LoadingSpinner />
                ) : filteredSlots.length > 0 ? (
                    <View style={styles.slotsGrid}>
                        {filteredSlots.map((slot) => {
                            const slotData = slot as any;
                            const clinicName = slotData.clinic?.name || slotData.clinicName;
                            const roomName = slotData.room?.name || slotData.roomName;
                            return (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.slotCard,
                                        {
                                            backgroundColor: selectedSlot?.id === slot.id ? colors.primary : colors.surface,
                                            borderColor: colors.primary,
                                        },
                                    ]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Text
                                        style={[
                                            styles.slotTime,
                                            { color: selectedSlot?.id === slot.id ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {slot.time}
                                    </Text>
                                    {(clinicName || roomName) && (
                                        <Text
                                            style={[
                                                styles.slotLocation,
                                                { color: selectedSlot?.id === slot.id ? '#FFFFFF99' : colors.textMuted },
                                            ]}
                                        >
                                            {clinicName}{roomName ? ` - ${roomName}` : ''}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <Card style={styles.noSlots}>
                        <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                        <Text style={[styles.noSlotsText, { color: colors.textMuted }]}>
                            {t('appointments.noSlots')}
                        </Text>
                    </Card>
                )}

                {/* Payment Method */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('appointments.paymentMethod')}
                </Text>
                <View style={styles.paymentOptions}>
                    <TouchableOpacity
                        style={[
                            styles.paymentCard,
                            {
                                backgroundColor: paymentMethod === 'cash' ? colors.primary : colors.surface,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color={paymentMethod === 'cash' ? '#FFFFFF' : colors.primary}
                        />
                        <Text
                            style={[
                                styles.paymentText,
                                { color: paymentMethod === 'cash' ? '#FFFFFF' : colors.text },
                            ]}
                        >
                            {t('appointments.cash')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.paymentCard,
                            {
                                backgroundColor: paymentMethod === 'card' ? colors.primary : colors.surface,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <Ionicons
                            name="card-outline"
                            size={24}
                            color={paymentMethod === 'card' ? '#FFFFFF' : colors.primary}
                        />
                        <Text
                            style={[
                                styles.paymentText,
                                { color: paymentMethod === 'card' ? '#FFFFFF' : colors.text },
                            ]}
                        >
                            {t('appointments.card')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Confirm Button */}
                <Button
                    title={t('appointments.confirmBooking')}
                    onPress={handleBooking}
                    loading={booking}
                    disabled={!selectedSlot}
                    fullWidth
                    style={styles.confirmButton}
                />
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
    doctorCard: {
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '600',
    },
    consultFee: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    dateScroll: {
        marginBottom: spacing.lg,
    },
    dateCard: {
        width: 60,
        height: 70,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    dayText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dayNum: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    slotCard: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
    },
    slotTime: {
        fontSize: 14,
        fontWeight: '500',
    },
    noSlots: {
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    noSlotsText: {
        marginTop: spacing.md,
        fontSize: 14,
    },
    paymentOptions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    paymentCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        gap: spacing.sm,
    },
    paymentText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        marginBottom: spacing.xl,
    },
    slotLocation: {
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },
});
