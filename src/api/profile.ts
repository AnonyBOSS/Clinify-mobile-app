import apiClient from './client';
import { User, Patient, Doctor } from '../types';

export const profileApi = {
    // Update profile (full_name, phone, email, etc.)
    updateProfile: async (data: Partial<Patient | Doctor>): Promise<{ user: User }> => {
        const response = await apiClient.put('/api/profile', data);
        return { user: response.data.data };
    },

    // Change password - uses same endpoint, backend checks for currentPassword & newPassword fields
    changePassword: async (data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{ success: boolean }> => {
        const response = await apiClient.put('/api/profile', data);
        return { success: response.data.success };
    },
};
