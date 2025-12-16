import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner, EmptyState } from '../../components';
import { doctorsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Doctor } from '../../types';

const SPECIALIZATIONS = [
    'All',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'General',
];

export function DoctorSearchScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');

    const fetchDoctors = useCallback(async () => {
        try {
            const { doctors: fetchedDoctors } = await doctorsApi.getDoctors();
            setDoctors(fetchedDoctors);
            setFilteredDoctors(fetchedDoctors);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    useEffect(() => {
        let result = doctors;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (doctor) =>
                    doctor.full_name.toLowerCase().includes(query) ||
                    doctor.specializations.some((s) => s.toLowerCase().includes(query))
            );
        }

        // Filter by specialization
        if (selectedSpecialization !== 'All') {
            result = result.filter((doctor) =>
                doctor.specializations.some(
                    (s) => s.toLowerCase() === selectedSpecialization.toLowerCase()
                )
            );
        }

        setFilteredDoctors(result);
    }, [searchQuery, selectedSpecialization, doctors]);

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
                    size={14}
                    color={colors.warning}
                />
            );
        }
        return stars;
    };

    const renderDoctorCard = ({ item: doctor }: { item: Doctor }) => (
        <Card style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                        {doctor.full_name.charAt(0)}
                    </Text>
                </View>
                <View style={styles.doctorInfo}>
                    <Text style={[styles.doctorName, { color: colors.text }]}>
                        Dr. {doctor.full_name}
                    </Text>
                    <Text style={[styles.specialty, { color: colors.textSecondary }]}>
                        {doctor.specializations.join(', ')}
                    </Text>
                    <View style={styles.ratingRow}>
                        <View style={styles.stars}>
                            {renderStars(doctor.average_rating || 0)}
                        </View>
                        <Text style={[styles.ratingText, { color: colors.textMuted }]}>
                            ({doctor.total_ratings || 0} {t('doctors.reviews')})
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.doctorDetails}>
                <Text style={[styles.qualifications, { color: colors.textSecondary }]}>
                    {doctor.qualifications}
                </Text>
                <View style={styles.feeRow}>
                    <Text style={[styles.feeLabel, { color: colors.textMuted }]}>
                        {t('doctors.consultationFee')}:
                    </Text>
                    <Text style={[styles.fee, { color: colors.primary }]}>
                        ${doctor.consultation_fee || 300}
                    </Text>
                </View>
            </View>

            <Button
                title={t('appointments.book')}
                onPress={() => navigation.navigate('Booking', {
                    doctorId: doctor.id,
                    doctorName: doctor.full_name
                })}
                fullWidth
                style={styles.bookButton}
            />
        </Card>
    );

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={t('doctors.searchDoctors')}
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Specialization Filter */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={SPECIALIZATIONS}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: selectedSpecialization === item ? colors.primary : colors.surface,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => setSelectedSpecialization(item)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: selectedSpecialization === item ? '#FFFFFF' : colors.primary },
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Results */}
            <FlatList
                data={filteredDoctors}
                renderItem={renderDoctorCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="search-outline"
                        title={t('common.noResults')}
                        message="Try adjusting your search or filters"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: spacing.md,
        paddingBottom: 0,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        height: 48,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterContainer: {
        paddingVertical: spacing.md,
    },
    filterList: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginRight: spacing.sm,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    doctorCard: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    doctorHeader: {
        flexDirection: 'row',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
    },
    doctorInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '600',
    },
    specialty: {
        fontSize: 14,
        marginTop: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    stars: {
        flexDirection: 'row',
        marginRight: spacing.xs,
    },
    ratingText: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    doctorDetails: {
        marginBottom: spacing.md,
    },
    qualifications: {
        fontSize: 14,
    },
    feeRow: {
        flexDirection: 'row',
        marginTop: spacing.sm,
    },
    feeLabel: {
        fontSize: 14,
    },
    fee: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
    bookButton: {
        marginTop: spacing.sm,
    },
});
