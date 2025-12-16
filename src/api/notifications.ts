import apiClient from './client';
import { Notification } from '../types';

// Helper to normalize notification from backend (maps _id to id)
const normalizeNotification = (n: any): Notification => ({
    id: n._id || n.id,
    user: n.user,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read || false,
    data: { ...n.data, metadata: n.metadata }, // Include metadata in data
    createdAt: n.createdAt,
});

export const notificationsApi = {
    // Get all notifications
    getNotifications: async (): Promise<{ notifications: Notification[] }> => {
        const response = await apiClient.get('/api/notifications');
        const rawNotifications = response.data.data || [];
        return { notifications: rawNotifications.map(normalizeNotification) };
    },

    // Mark notification as read (uses PATCH with notificationIds array)
    markAsRead: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.patch('/api/notifications', {
            notificationIds: [id]
        });
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<{ success: boolean }> => {
        const response = await apiClient.patch('/api/notifications', {
            markAllRead: true
        });
        return response.data;
    },

    // Get unread count (backend returns unreadCount in main /api/notifications response)
    getUnreadCount: async (): Promise<{ count: number }> => {
        try {
            const response = await apiClient.get('/api/notifications');
            return { count: response.data.unreadCount ?? 0 };
        } catch {
            return { count: 0 };
        }
    },
};
