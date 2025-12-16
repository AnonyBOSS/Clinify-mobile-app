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
import { Card, LoadingSpinner, EmptyState } from '../../components';
import { messagesApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Conversation } from '../../types';

export function MessagesScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const fetchConversations = useCallback(async () => {
        try {
            const { conversations: fetchedConvos } = await messagesApi.getConversations();
            setConversations(fetchedConvos);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const renderConversation = ({ item }: { item: Conversation }) => {
        if (!item.userId || !item.userName) return null; // Defensive check
        const isUnread = item.unreadCount > 0;

        return (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('Chat', {
                        recipientId: item.userId,
                        recipientName: item.userName,
                    })
                }
            >
                <Card style={styles.conversationCard}>
                    <View style={styles.conversationRow}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {item.userName.charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.conversationContent}>
                            <View style={styles.topRow}>
                                <Text
                                    style={[
                                        styles.participantName,
                                        { color: colors.text, fontWeight: isUnread ? '700' : '500' },
                                    ]}
                                >
                                    {item.userType === 'DOCTOR' ? 'Dr. ' : ''}
                                    {item.userName}
                                </Text>
                                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                                    {new Date(item.lastMessageTime).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.bottomRow}>
                                <Text
                                    style={[
                                        styles.lastMessage,
                                        {
                                            color: isUnread ? colors.text : colors.textSecondary,
                                            fontWeight: isUnread ? '500' : '400',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.lastMessage}
                                </Text>
                                {isUnread && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text style={styles.badgeText}>{item.unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{t('messages.title')}</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item, index) => item.userId || `conv-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="chatbubbles-outline"
                        title={t('messages.noConversations')}
                        message={t('messages.startConversation')}
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
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    conversationCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    conversationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
    },
    conversationContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    participantName: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: spacing.sm,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});
