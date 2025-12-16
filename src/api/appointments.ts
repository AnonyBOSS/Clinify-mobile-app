import apiClient from './client';
import { Appointment, Payment } from '../types';

export const appointmentsApi = {
    // Get user appointments
    getAppointments: async (status?: string): Promise<{ appointments: Appointment[] }> => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/api/appointments', { params });
        // Backend returns { success: true, data: [...] }
        return { appointments: response.data.data || [] };
    },

    // Get appointment by ID
    getAppointment: async (id: string): Promise<{ appointment: Appointment }> => {
        const response = await apiClient.get(`/api/appointments/${id}`);
        return { appointment: response.data.data };
    },

    // Book appointment
    bookAppointment: async (data: {
        doctorId: string;
        slotId: string;
        notes?: string;
        payment: Omit<Payment, 'timestamp' | 'status'>;
    }): Promise<{ appointment: Appointment }> => {
        const response = await apiClient.post('/api/appointments', data);
        return { appointment: response.data.data };
    },

    // Cancel appointment
    cancelAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.put(`/api/appointments/${id}/cancel`);
        return response.data;
    },

    // Confirm appointment (for doctors)
    confirmAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.put(`/api/appointments/${id}/confirm`);
        return response.data;
    },

    // Complete appointment (for doctors)
    completeAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.put(`/api/appointments/${id}/complete`);
        return response.data;
    },
};
