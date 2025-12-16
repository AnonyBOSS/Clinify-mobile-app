import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Header, LoadingSpinner } from '../../components';
import { aiApi } from '../../api';
import { spacing, borderRadius } from '../../theme';
import { AIMessage } from '../../types';

export function AIAssistantScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: AIMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Send only the latest message content - backend manages history
            const { response } = await aiApi.chat(userMessage.content);
            const assistantMessage: AIMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: AIMessage = {
                role: 'assistant',
                content: t('ai.aiError'),
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const getQuickQuestions = () => [
        t('ai.q1'),
        t('ai.q2'),
        t('ai.q3'),
        t('ai.q4'),
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Header
                title={t('ai.medicalAssistant')}
                showBack
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <View style={styles.welcomeContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="chatbubble-ellipses" size={40} color={colors.primary} />
                            </View>
                            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                                {t('ai.medicalAssistant')}
                            </Text>
                            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                                {t('ai.disclaimer')}
                            </Text>

                            {/* Quick Questions */}
                            <Text style={[styles.quickTitle, { color: colors.text }]}>
                                {t('ai.quickQuestions')}
                            </Text>
                            {getQuickQuestions().map((question, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.quickQuestion, { backgroundColor: colors.surface }]}
                                    onPress={() => setInput(question)}
                                >
                                    <Text style={[styles.quickQuestionText, { color: colors.primary }]}>
                                        {question}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Messages */}
                    {messages.map((message, index) => (
                        <View
                            key={index}
                            style={[
                                styles.messageBubble,
                                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                {
                                    backgroundColor:
                                        message.role === 'user' ? colors.primary : colors.surface,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    {
                                        color: message.role === 'user' ? '#FFFFFF' : colors.text,
                                    },
                                ]}
                            >
                                {message.content}
                            </Text>
                            <Text
                                style={[
                                    styles.timestamp,
                                    {
                                        color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.textMuted,
                                    },
                                ]}
                            >
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    ))}

                    {loading && (
                        <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.surface }]}>
                            <LoadingSpinner size="small" />
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder={t('ai.askQuestion')}
                        placeholderTextColor={colors.textMuted}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: colors.primary }]}
                        onPress={sendMessage}
                        disabled={!input.trim() || loading}
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
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: spacing.md,
        paddingBottom: spacing.lg,
    },
    welcomeContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    welcomeText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    quickTitle: {
        fontSize: 16,
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginBottom: spacing.md,
    },
    quickQuestion: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    quickQuestionText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: spacing.xs,
    },
    assistantBubble: {
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
