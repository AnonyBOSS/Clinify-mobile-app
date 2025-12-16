import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, LoadingSpinner } from '../../components';
import { messagesApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { Message } from '../../types';

type ChatRouteParams = {
    Chat: { recipientId: string; recipientName: string };
};

export function ChatScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<ChatRouteParams, 'Chat'>>();
    const { recipientId, recipientName } = route.params;
    const flatListRef = useRef<FlatList>(null);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const fetchMessages = useCallback(async () => {
        try {
            const { messages: fetchedMessages } = await messagesApi.getMessages(recipientId);
            // Backend returns oldest first (ascending), which is correct for chat UI
            // Newest messages will be at the bottom, FlatList scrolls to end
            setMessages(fetchedMessages);
            // Mark as read (handled by backend on fetch)
            await messagesApi.markAsRead(recipientId);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, [recipientId]);

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 0.5 seconds for near-real-time feel
        const interval = setInterval(fetchMessages, 500);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        const messageContent = input.trim();
        setInput('');
        setSending(true);

        try {
            // Determine receiver type based on current user role
            const receiverType = user?.role?.toUpperCase() === 'DOCTOR' ? 'PATIENT' : 'DOCTOR';
            await messagesApi.sendMessage({
                receiverId: recipientId,
                receiverType: receiverType as 'DOCTOR' | 'PATIENT',
                content: messageContent,
            });
            // Refresh messages to get the sent message with proper format
            await fetchMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
            setInput(messageContent);
        } finally {
            setSending(false);
        }
    };

    const isMyMessage = (message: Message) => {
        const isMine = message.sender === user?.id;
        return isMine;
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = isMyMessage(item);

        return (
            <View
                style={[
                    styles.messageBubble,
                    isMine ? styles.myBubble : styles.theirBubble,
                    {
                        backgroundColor: isMine ? colors.primary : colors.surface,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        { color: isMine ? '#FFFFFF' : colors.text },
                    ]}
                >
                    {item.content}
                </Text>
                <Text
                    style={[
                        styles.timestamp,
                        { color: isMine ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                    ]}
                >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={t('common.loading')} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title={recipientName}
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item.id || `msg-${index}`}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                {t('messages.noMessages')}
                            </Text>
                        </View>
                    }
                />

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder={t('messages.typeMessage')}
                        placeholderTextColor={colors.textMuted}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: input.trim() ? colors.primary : colors.border },
                        ]}
                        onPress={sendMessage}
                        disabled={!input.trim() || sending}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        padding: spacing.md,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 14,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    myBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: spacing.xs,
    },
    theirBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: spacing.xs,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.md,
        borderTopWidth: 1,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
