import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner } from '../../components';
import { ratingsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';

type RateDoctorRouteParams = {
    RateDoctor: {
        appointmentId: string;
        doctorId: string;
        doctorName: string;
    };
};

export function RateDoctorScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RateDoctorRouteParams, 'RateDoctor'>>();
    const { appointmentId, doctorId, doctorName } = route.params;

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating');
            return;
        }

        setSubmitting(true);
        try {
            await ratingsApi.submitRating({
                appointmentId,
                rating,
                review: review.trim() || undefined,
            });
            Alert.alert(
                'Thank You!',
                'Your rating has been submitted successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to submit rating. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={40}
                            color={star <= rating ? colors.warning : colors.textMuted}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Rate Your Visit
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Card style={styles.ratingCard}>
                    <View style={styles.doctorSection}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {doctorName?.charAt(0) || 'D'}
                            </Text>
                        </View>
                        <Text style={[styles.doctorName, { color: colors.text }]}>
                            Dr. {doctorName}
                        </Text>
                    </View>

                    <Text style={[styles.prompt, { color: colors.textSecondary }]}>
                        How was your experience?
                    </Text>

                    {renderStars()}

                    <Text style={[styles.ratingLabel, { color: colors.text }]}>
                        {rating === 0 && 'Tap to rate'}
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                    </Text>

                    <TextInput
                        style={[
                            styles.reviewInput,
                            {
                                backgroundColor: colors.surfaceVariant,
                                color: colors.text,
                                borderColor: colors.border,
                            }
                        ]}
                        placeholder="Share your experience (optional)"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={4}
                        value={review}
                        onChangeText={setReview}
                        textAlignVertical="top"
                    />

                    <Button
                        title={submitting ? 'Submitting...' : 'Submit Rating'}
                        onPress={handleSubmit}
                        disabled={submitting || rating === 0}
                        variant="primary"
                        style={styles.submitButton}
                    />
                </Card>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    ratingCard: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    doctorSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '600',
    },
    doctorName: {
        fontSize: 20,
        fontWeight: '600',
    },
    prompt: {
        fontSize: 16,
        marginBottom: spacing.md,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    starButton: {
        padding: spacing.xs,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: spacing.lg,
    },
    reviewInput: {
        width: '100%',
        minHeight: 100,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        padding: spacing.md,
        fontSize: 15,
        marginBottom: spacing.lg,
    },
    submitButton: {
        width: '100%',
    },
});
