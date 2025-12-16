import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner } from '../../components';
import { doctorsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { ScheduleDay, Clinic, Room } from '../../types';

// Day keys for translation lookup
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type ScheduleRowForm = {
    dayOfWeek: number;
    clinicId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isActive: boolean;
};

const defaultRow: ScheduleRowForm = {
    dayOfWeek: 0,
    clinicId: '',
    roomId: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 15,
    isActive: true,
};

export function ScheduleScreen() {
    const { colors } = useTheme();
    const { t, isRTL } = useLanguage();

    // Get translated day names
    const DAYS = DAY_KEYS.map(key => t(`schedule.days.${key}`));
    const SHORT_DAYS = DAYS.map(day => day.substring(0, 3));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Data
    const [scheduleRows, setScheduleRows] = useState<ScheduleRowForm[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [consultationFee, setConsultationFee] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<ScheduleRowForm>(defaultRow);

    const fetchSchedule = useCallback(async () => {
        try {
            const { schedule, clinics: fetchedClinics, rooms: fetchedRooms, consultationFee: fee } = await doctorsApi.getSchedule();

            // Normalize clinics
            const normalizedClinics = (fetchedClinics || []).map((c: any) => ({
                id: c._id || c.id,
                name: c.name,
                phone: c.phone || '',
                operating_hours: c.operating_hours || '',
                address: c.address || {},
            }));
            setClinics(normalizedClinics);

            // Normalize rooms
            const normalizedRooms = (fetchedRooms || []).map((r: any) => ({
                id: r._id || r.id,
                clinic: r.clinic?._id || r.clinic,
                room_number: r.room_number,
                type: r.type || '',
                status: r.status || 'AVAILABLE',
            }));
            setRooms(normalizedRooms);

            // Transform schedule to row format
            const rows: ScheduleRowForm[] = (schedule || []).map((s: any) => ({
                dayOfWeek: s.dayOfWeek,
                clinicId: s.clinic?._id || s.clinic || '',
                roomId: s.room?._id || s.room || '',
                startTime: s.startTime || '09:00',
                endTime: s.endTime || '17:00',
                slotDurationMinutes: s.slotDurationMinutes || 15,
                isActive: s.isActive !== false,
            }));
            setScheduleRows(rows);

            // Load consultation fee from API (or empty if not set)
            if (fee !== undefined && fee !== null) {
                setConsultationFee(String(fee));
            } else {
                setConsultationFee('');
            }
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
            Alert.alert(t('common.error'), t('schedule.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const getRoomsForClinic = (clinicId: string) => {
        return rooms.filter(r => r.clinic === clinicId && r.status === 'AVAILABLE');
    };

    const getClinicName = (clinicId: string) => {
        const clinic = clinics.find(c => c.id === clinicId);
        return clinic?.name || t('schedule.selectClinic');
    };

    const getRoomNumber = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        return room ? `${t('schedule.room')} ${room.room_number}` : t('schedule.selectRoom');
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setFormData({
            ...defaultRow,
            clinicId: clinics[0]?.id || '',
        });
        setShowModal(true);
    };

    const openEditModal = (index: number) => {
        setEditingIndex(index);
        setFormData({ ...scheduleRows[index] });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingIndex(null);
        setFormData(defaultRow);
    };

    const saveModalForm = () => {
        // Validation
        if (!formData.clinicId) {
            Alert.alert(t('common.error'), t('schedule.selectClinic'));
            return;
        }
        if (!formData.roomId) {
            Alert.alert(t('common.error'), t('schedule.selectRoom'));
            return;
        }
        if (formData.startTime >= formData.endTime) {
            Alert.alert(t('common.error'), t('schedule.startBeforeEnd'));
            return;
        }

        if (editingIndex !== null) {
            // Update existing row
            setScheduleRows(prev => {
                const updated = [...prev];
                updated[editingIndex] = formData;
                return updated;
            });
        } else {
            // Add new row
            setScheduleRows(prev => [...prev, formData]);
        }
        closeModal();
    };

    const removeRow = (index: number) => {
        Alert.alert(
            t('common.confirm'),
            t('schedule.removeRow') + '?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        setScheduleRows(prev => prev.filter((_, i) => i !== index));
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        const feeNumber = Number(consultationFee);
        if (isNaN(feeNumber) || feeNumber < 0) {
            Alert.alert(t('common.error'), t('schedule.feeInvalid'));
            return;
        }

        // Validate rows
        for (let i = 0; i < scheduleRows.length; i++) {
            const row = scheduleRows[i];
            if (!row.clinicId) {
                Alert.alert(t('common.error'), `Row ${i + 1}: ${t('schedule.selectClinic')}`);
                return;
            }
            if (!row.roomId) {
                Alert.alert(t('common.error'), `Row ${i + 1}: ${t('schedule.selectRoom')}`);
                return;
            }
        }

        setSaving(true);
        try {
            // Convert to API format - use clinicId/roomId to match web app
            const scheduleDays = scheduleRows.map(row => ({
                dayOfWeek: row.dayOfWeek,
                clinicId: row.clinicId,
                roomId: row.roomId,
                startTime: row.startTime,
                endTime: row.endTime,
                slotDurationMinutes: row.slotDurationMinutes,
                isActive: row.isActive,
            }));

            await doctorsApi.updateSchedule(scheduleDays, feeNumber);
            Alert.alert(t('common.done'), t('schedule.scheduleUpdated'));
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.error || t('schedule.failedToSave'));
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateSlots = async () => {
        if (scheduleRows.length === 0) {
            Alert.alert(t('common.error'), t('schedule.noSchedule'));
            return;
        }

        setGenerating(true);
        try {
            const result = await doctorsApi.generateSlots();
            Alert.alert(t('common.done'), `${t('schedule.slotsGenerated')} (${result.createdCount} slots)`);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.error || t('schedule.failedToGenerate'));
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

                {/* Consultation Fee Card */}
                <Card style={styles.feeCard}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('schedule.consultationFee')}
                    </Text>
                    <Text style={[styles.feeDesc, { color: colors.textSecondary }]}>
                        {t('schedule.consultationFeeDesc')}
                    </Text>
                    <View style={styles.feeRow}>
                        <TextInput
                            style={[styles.feeInput, {
                                backgroundColor: colors.surface,
                                color: colors.text,
                                borderColor: colors.border,
                                textAlign: isRTL ? 'right' : 'left',
                            }]}
                            value={consultationFee}
                            onChangeText={setConsultationFee}
                            keyboardType="numeric"
                            placeholder="300"
                            placeholderTextColor={colors.textMuted}
                        />
                        <Text style={[styles.currency, { color: colors.textSecondary }]}>EGP</Text>
                    </View>
                </Card>

                {/* Schedule Rows Card */}
                <Card style={styles.scheduleCard}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {t('schedule.workingDays')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.addBtn, { backgroundColor: colors.primary }]}
                            onPress={openAddModal}
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.addBtnText}>{t('schedule.addSchedule')}</Text>
                        </TouchableOpacity>
                    </View>

                    {scheduleRows.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {t('schedule.noScheduleYet')}
                            </Text>
                        </View>
                    ) : (
                        scheduleRows.map((row, index) => (
                            <View
                                key={index}
                                style={[styles.scheduleRow, {
                                    backgroundColor: row.isActive ? colors.surface : colors.background,
                                    borderColor: colors.border,
                                    opacity: row.isActive ? 1 : 0.6,
                                }]}
                            >
                                <View style={styles.rowMain}>
                                    <View style={[styles.dayBadge, { backgroundColor: row.isActive ? colors.primary : colors.textMuted }]}>
                                        <Text style={styles.dayBadgeText}>
                                            {SHORT_DAYS[row.dayOfWeek]}
                                        </Text>
                                    </View>
                                    <View style={styles.rowInfo}>
                                        <Text style={[styles.rowDay, { color: colors.text }]}>
                                            {DAYS[row.dayOfWeek]}
                                        </Text>
                                        <Text style={[styles.rowClinic, { color: colors.textSecondary }]}>
                                            {getClinicName(row.clinicId)} • {getRoomNumber(row.roomId)}
                                        </Text>
                                        <View style={styles.rowTimeContainer}>
                                            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                                            <Text style={[styles.rowTime, { color: colors.textMuted }]}>
                                                {row.startTime} - {row.endTime} ({row.slotDurationMinutes} min)
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.rowActions}>
                                        {/* Active Toggle */}
                                        <Switch
                                            value={row.isActive}
                                            onValueChange={(val) => {
                                                setScheduleRows(prev => {
                                                    const updated = [...prev];
                                                    updated[index] = { ...updated[index], isActive: val };
                                                    return updated;
                                                });
                                            }}
                                            trackColor={{ false: colors.border, true: colors.primary }}
                                            thumbColor={row.isActive ? '#FFFFFF' : colors.textMuted}
                                            style={styles.activeSwitch}
                                        />
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => openEditModal(index)}
                                        >
                                            <Ionicons name="pencil" size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => removeRow(index)}
                                        >
                                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                        <Button
                            title={t('schedule.saveSchedule')}
                            onPress={handleSave}
                            loading={saving}
                            style={styles.saveBtn}
                        />
                        <Button
                            title={t('schedule.generateSlotsFor2Weeks')}
                            onPress={handleGenerateSlots}
                            loading={generating}
                            variant="secondary"
                            disabled={scheduleRows.length === 0}
                            style={styles.generateBtn}
                            icon={<Ionicons name="flash" size={18} color={scheduleRows.length === 0 ? colors.textMuted : colors.primary} />}
                        />
                    </View>
                </Card>
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        {/* Gradient accent line */}
                        <View style={styles.modalAccent} />
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingIndex !== null ? t('schedule.editSchedule') : t('schedule.addSchedule')}
                            </Text>
                            <TouchableOpacity
                                onPress={closeModal}
                                style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                            >
                                <Ionicons name="close" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Day of Week */}
                            <Text style={[styles.label, { color: colors.text }]}>{t('schedule.dayOfWeek')}</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Picker
                                    selectedValue={formData.dayOfWeek}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, dayOfWeek: val }))}
                                    style={{ color: colors.text }}
                                >
                                    {DAYS.map((day, idx) => (
                                        <Picker.Item key={idx} label={day} value={idx} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Clinic */}
                            <Text style={[styles.label, { color: colors.text }]}>{t('schedule.clinic')}</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Picker
                                    selectedValue={formData.clinicId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, clinicId: val, roomId: '' }))}
                                    style={{ color: colors.text }}
                                >
                                    <Picker.Item label={t('schedule.selectClinic')} value="" />
                                    {clinics.map((clinic) => (
                                        <Picker.Item
                                            key={clinic.id}
                                            label={`${clinic.name}${clinic.address?.city ? ` - ${clinic.address.city}` : ''}`}
                                            value={clinic.id}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            {/* Room */}
                            <Text style={[styles.label, { color: colors.text }]}>{t('schedule.room')}</Text>
                            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Picker
                                    selectedValue={formData.roomId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, roomId: val }))}
                                    style={{ color: colors.text }}
                                    enabled={!!formData.clinicId}
                                >
                                    <Picker.Item label={t('schedule.selectRoom')} value="" />
                                    {getRoomsForClinic(formData.clinicId).map((room) => (
                                        <Picker.Item
                                            key={room.id}
                                            label={`${t('schedule.room')} ${room.room_number}`}
                                            value={room.id}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            {/* Time inputs */}
                            <View style={styles.timeRow}>
                                <View style={styles.timeCol}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('schedule.startTime')}</Text>
                                    <TextInput
                                        style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                        value={formData.startTime}
                                        onChangeText={(val) => setFormData(prev => ({ ...prev, startTime: val }))}
                                        placeholder="09:00"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={styles.timeCol}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('schedule.endTime')}</Text>
                                    <TextInput
                                        style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                        value={formData.endTime}
                                        onChangeText={(val) => setFormData(prev => ({ ...prev, endTime: val }))}
                                        placeholder="17:00"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                            </View>

                            {/* Slot duration */}
                            <Text style={[styles.label, { color: colors.text }]}>{t('schedule.slotDuration')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                                value={formData.slotDurationMinutes ? String(formData.slotDurationMinutes) : ''}
                                onChangeText={(val) => {
                                    const num = parseInt(val, 10);
                                    setFormData(prev => ({ ...prev, slotDurationMinutes: isNaN(num) ? 0 : num }));
                                }}
                                keyboardType="numeric"
                                placeholder="15"
                                placeholderTextColor={colors.textMuted}
                            />

                            {/* Active toggle */}
                            <View style={styles.toggleRow}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>{t('schedule.active')}</Text>
                                <Switch
                                    value={formData.isActive}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button
                                title={t('common.cancel')}
                                onPress={closeModal}
                                variant="secondary"
                                style={styles.modalBtn}
                            />
                            <Button
                                title={t('common.save')}
                                onPress={saveModalForm}
                                style={styles.modalBtn}
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
        paddingBottom: spacing.xl * 2,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    feeCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    feeDesc: {
        fontSize: 13,
        marginBottom: spacing.md,
    },
    feeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    feeInput: {
        flex: 1,
        maxWidth: 150,
        height: 44,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: 16,
    },
    currency: {
        fontSize: 14,
        fontWeight: '500',
    },
    scheduleCard: {
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    scheduleRow: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
    },
    rowMain: {
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
    rowInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    rowDay: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowClinic: {
        fontSize: 13,
        marginTop: 2,
    },
    rowTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    rowTime: {
        fontSize: 12,
    },
    rowActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    actionBtn: {
        padding: spacing.sm,
    },
    activeSwitch: {
        transform: [{ scale: 0.85 }],
        marginRight: spacing.xs,
    },
    actionRow: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    saveBtn: {
        marginBottom: spacing.sm,
    },
    generateBtn: {},
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '85%',
        overflow: 'hidden',
    },
    modalAccent: {
        height: 4,
        backgroundColor: '#6366F1',
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalBody: {
        padding: spacing.md,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    modalBtn: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: spacing.xs,
        marginTop: spacing.md,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: 16,
    },
    timeRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    timeCol: {
        flex: 1,
    },
    timeInput: {
        height: 44,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        textAlign: 'center',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderRadius: borderRadius.md,
    },
});
