import apiClient from './client';
import { Message, Conversation } from '../types';

// Helper to normalize message from backend (maps _id to id, handles ObjectId vs string)
const normalizeMessage = (msg: any): Message => ({
    id: msg._id || msg.id,
    sender: typeof msg.sender === 'object' ? msg.sender._id || msg.sender.id : msg.sender,
    senderRole: msg.senderType || msg.senderRole,
    recipient: typeof msg.receiver === 'object' ? msg.receiver._id || msg.receiver.id : msg.receiver,
    recipientRole: msg.receiverType || msg.recipientRole,
    content: msg.content,
    read: msg.read || false,
    createdAt: msg.createdAt,
});

export const messagesApi = {
    // Get all conversations
    getConversations: async (): Promise<{ conversations: Conversation[] }> => {
        const response = await apiClient.get('/api/messages');
        return { conversations: response.data.data || [] };
    },

    // Get messages with a specific user (use ?withUser= query param)
    getMessages: async (userId: string): Promise<{ messages: Message[] }> => {
        const response = await apiClient.get(`/api/messages?withUser=${userId}`);
        const rawMessages = response.data.data || [];
        const messages = rawMessages.map(normalizeMessage);
        return { messages };
    },

    // Send message (backend expects receiverId, receiverType, content)
    sendMessage: async (data: {
        receiverId: string;
        receiverType: 'DOCTOR' | 'PATIENT';
        content: string;
    }): Promise<{ message: Message }> => {
        const response = await apiClient.post('/api/messages', data);
        return { message: response.data.data };
    },

    // Mark messages as read (handled automatically by GET ?withUser= on backend)
    markAsRead: async (userId: string): Promise<{ success: boolean }> => {
        // The backend already marks messages as read when fetching with ?withUser=
        // This is a no-op for now, but kept for API compatibility
        return { success: true };
    },
};

