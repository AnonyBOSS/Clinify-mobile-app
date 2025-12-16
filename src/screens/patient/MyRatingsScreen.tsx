import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Header, LoadingSpinner, EmptyState } from '../../components';
import { ratingsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Rating } from '../../types';

export function MyRatingsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState<Rating[]>([]);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        try {
            const { ratings: fetchedRatings } = await ratingsApi.getMyRatings();
            setRatings(fetchedRatings);
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? colors.warning : colors.textMuted}
                    />
                ))}
            </View>
        );
    };

    const renderRating = ({ item }: { item: any }) => {
        const doctor = item.doctor || {};
        return (
            <Card style={styles.ratingCard}>
                <View style={styles.ratingHeader}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {doctor.full_name?.charAt(0) || 'D'}
                        </Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.doctorName, { color: colors.text }]}>
                            Dr. {doctor.full_name || 'Unknown'}
                        </Text>
                        <Text style={[styles.specialization, { color: colors.textSecondary }]}>
                            {doctor.specializations?.join(', ') || 'Doctor'}
                        </Text>
                    </View>
                </View>

                <View style={styles.ratingContent}>
                    {renderStars(item.rating)}
                    <Text style={[styles.ratingDate, { color: colors.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {item.review && (
                    <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                        "{item.review}"
                    </Text>
                )}
            </Card>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading ratings..." />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title="My Ratings"
                showBack
                onBack={() => navigation.goBack()}
            />

            {ratings.length === 0 ? (
                <EmptyState
                    icon="star-outline"
                    title="No Ratings Yet"
                    message="Your ratings will appear here after you rate doctors."
                />
            ) : (
                <FlatList
                    data={ratings}
                    renderItem={renderRating}
                    keyExtractor={(item, index) => (item as any)._id || (item as any).id || String(index)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: spacing.md,
    },
    ratingCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    ratingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    headerInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
    },
    specialization: {
        fontSize: 13,
        marginTop: 2,
    },
    ratingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingDate: {
        fontSize: 12,
    },
    reviewText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
});
