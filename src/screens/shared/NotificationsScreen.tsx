import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, LoadingSpinner, EmptyState } from '../../components';
import { notificationsApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Notification } from '../../types';

export function NotificationsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        try {
            const { notifications: fetched } = await notificationsApi.getNotifications();
            // Only update if we got data (preserve previous on empty/error)
            if (fetched && fetched.length >= 0) {
                setNotifications(fetched);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Don't clear notifications on error - keep existing data
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Refetch notifications when screen comes into focus (e.g., after pressing back)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNotifications();
        });
        return unsubscribe;
    }, [navigation, fetchNotifications]);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 5 seconds
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'appointment':
                return 'calendar';
            case 'message':
                return 'chatbubble';
            case 'rating':
                return 'star';
            default:
                return 'notifications';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'appointment':
                return colors.primary;
            case 'message':
                return colors.success;
            case 'rating':
                return colors.warning;
            default:
                return colors.info;
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        // Navigate based on notification type FIRST before marking as read
        // Backend uses NEW_MESSAGE for message notifications and stores sender in metadata
        const notifData = notification.data as any;
        const metadata = notifData?.metadata || notifData;

        // Also check top-level metadata field
        const topMetadata = (notification as any).metadata;
        const finalSenderId = metadata?.senderId || notifData?.senderId || topMetadata?.senderId;

        // Extract sender name from metadata OR from message "New message(s) from [Name]"
        let finalSenderName = metadata?.senderName || notifData?.senderName || topMetadata?.senderName;
        if (!finalSenderName && notification.message) {
            const match = notification.message.match(/from\s+(.+)$/i);
            if (match) {
                finalSenderName = match[1].trim();
            }
        }
        finalSenderName = finalSenderName || 'User';

        // Navigate first
        if ((notification.type === 'message' || notification.type === 'NEW_MESSAGE') && finalSenderId) {
            // Chat is in parent stack navigator, not in tabs - need to use getParent()
            const parentNav = navigation.getParent() || navigation;
            parentNav.navigate('Chat', {
                recipientId: finalSenderId,
                recipientName: finalSenderName,
            });
        } else if ((notification.type === 'appointment' || notification.type === 'APPOINTMENT') &&
            (metadata?.appointmentId || notifData?.appointmentId || topMetadata?.appointmentId)) {
            // Navigate to dashboard which is in the same tabs
            navigation.navigate('Dashboard');
        }

        // Mark as read in background (don't update local state immediately to avoid blanking)
        if (!notification.read) {
            notificationsApi.markAsRead(notification.id).catch(err => {
                console.error('Failed to mark notification as read:', err);
            });
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const iconColor = getNotificationColor(item.type);
        const isUnread = !item.read;

        return (
            <TouchableOpacity onPress={() => handleNotificationPress(item)}>
                <Card
                    style={[
                        styles.notificationCard,
                        isUnread ? { borderLeftWidth: 3, borderLeftColor: colors.primary } : {},
                    ]}
                >
                    <View style={styles.notificationRow}>
                        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                            <Ionicons
                                name={getNotificationIcon(item.type)}
                                size={20}
                                color={iconColor}
                            />
                        </View>
                        <View style={styles.notificationContent}>
                            <Text
                                style={[
                                    styles.notificationTitle,
                                    { color: colors.text, fontWeight: isUnread ? '600' : '400' },
                                ]}
                            >
                                {item.title}
                            </Text>
                            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                                {item.message}
                            </Text>
                            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                                {new Date(item.createdAt).toLocaleString()}
                            </Text>
                        </View>
                        {isUnread && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{t('notifications.title')}</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={[styles.markRead, { color: colors.primary }]}>
                            {t('notifications.markAllRead')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item, index) => item.id || `notif-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="notifications-outline"
                        title={t('notifications.noNotifications')}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    markRead: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    notificationCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    notificationTitle: {
        fontSize: 15,
        marginBottom: spacing.xs,
    },
    notificationMessage: {
        fontSize: 13,
        lineHeight: 18,
    },
    timestamp: {
        fontSize: 11,
        marginTop: spacing.xs,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: spacing.xs,
    },
});
