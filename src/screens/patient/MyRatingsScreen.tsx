import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Header, LoadingSpinner, EmptyState, Button } from '../../components';
import { ratingsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Rating } from '../../types';

export function MyRatingsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRating, setEditingRating] = useState<any>(null);
    const [editStars, setEditStars] = useState(5);
    const [editReview, setEditReview] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchRatings();
        }, [])
    );

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

    const handleEdit = (item: any) => {
        setEditingRating(item);
        setEditStars(item.rating);
        setEditReview(item.review || '');
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingRating) return;

        setIsSaving(true);
        try {
            const ratingId = editingRating._id || editingRating.id;
            await ratingsApi.updateRating(ratingId, {
                rating: editStars,
                review: editReview.trim() || undefined,
            });
            Alert.alert(t('common.done'), t('ratings.updateSuccess'));
            setShowEditModal(false);
            fetchRatings();
        } catch (error: any) {
            const message = error.response?.data?.error || t('ratings.failedUpdate');
            Alert.alert(t('common.error'), message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (item: any) => {
        const ratingId = item._id || item.id;
        Alert.alert(
            t('ratings.deleteRating'),
            t('ratings.confirmDelete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ratingsApi.deleteRating(ratingId);
                            Alert.alert(t('common.done'), t('ratings.deleteSuccess'));
                            fetchRatings();
                        } catch (error: any) {
                            const message = error.response?.data?.error || t('ratings.failedDelete');
                            Alert.alert(t('common.error'), message);
                        }
                    },
                },
            ]
        );
    };

    const renderStars = (rating: number, interactive = false, onPress?: (star: number) => void) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => interactive && onPress?.(star)}
                        disabled={!interactive}
                    >
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={interactive ? 32 : 16}
                            color={star <= rating ? colors.warning : colors.textMuted}
                        />
                    </TouchableOpacity>
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
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}
                            onPress={() => handleEdit(item)}
                        >
                            <Ionicons name="pencil" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: colors.error + '20' }]}
                            onPress={() => handleDelete(item)}
                        >
                            <Ionicons name="trash" size={16} color={colors.error} />
                        </TouchableOpacity>
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
        return <LoadingSpinner fullScreen message={t('ratings.loadingRatings')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title={t('profile.myRatings')}
                showBack
                onBack={() => navigation.goBack()}
            />

            {ratings.length === 0 ? (
                <EmptyState
                    icon="star-outline"
                    title={t('ratings.noRatingsYet')}
                    message={t('ratings.ratingsAppearHere')}
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

            {/* Edit Rating Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {t('ratings.editRating')}
                            </Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('ratings.yourRating')}
                            </Text>
                            <View style={styles.starsContainer}>
                                {renderStars(editStars, true, setEditStars)}
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                {t('ratings.yourReview')}
                            </Text>
                            <TextInput
                                style={[styles.textInput, styles.reviewInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('ratings.writeYourReview')}
                                placeholderTextColor={colors.textMuted}
                                value={editReview}
                                onChangeText={setEditReview}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={() => setShowEditModal(false)}
                                variant="outline"
                                style={{ flex: 1, marginRight: spacing.sm }}
                            />
                            <Button
                                title={isSaving ? t('profile.saving') : t('profile.saveChanges')}
                                onPress={handleSaveEdit}
                                disabled={isSaving}
                                style={{ flex: 1, marginLeft: spacing.sm }}
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
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    actionBtn: {
        padding: spacing.sm,
        borderRadius: borderRadius.md,
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
    starsContainer: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    ratingDate: {
        fontSize: 12,
    },
    reviewText: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalBody: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 16,
    },
    reviewInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
    },
});
