import apiClient from './client';
import { Appointment, Payment } from '../types';

// Normalize appointment from backend (maps _id to id)
const normalizeAppointment = (apt: any): Appointment => ({
    ...apt,
    id: apt._id || apt.id,
});

export const appointmentsApi = {
    // Get user appointments
    getAppointments: async (status?: string): Promise<{ appointments: Appointment[] }> => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/api/appointments', { params });
        // Backend returns { success: true, data: [...] } with _id fields
        const rawAppointments = response.data.data || [];
        return { appointments: rawAppointments.map(normalizeAppointment) };
    },

    // Get appointment by ID
    getAppointment: async (id: string): Promise<{ appointment: Appointment }> => {
        const response = await apiClient.get(`/api/appointments/${id}`);
        return { appointment: normalizeAppointment(response.data.data) };
    },

    // Book appointment - backend requires: doctorId, clinicId, roomId, slotId, method
    bookAppointment: async (data: {
        doctorId: string;
        clinicId?: string;
        roomId?: string;
        slotId: string;
        method: 'CASH' | 'CARD';  // Backend requires uppercase
        notes?: string;
    }): Promise<{ appointment: Appointment }> => {
        const response = await apiClient.post('/api/appointments', data);
        return { appointment: normalizeAppointment(response.data.data) };
    },

    // Cancel appointment - backend uses POST
    cancelAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post(`/api/appointments/${id}/cancel`);
        return response.data;
    },

    // Confirm appointment (for doctors) - backend uses POST
    confirmAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post(`/api/appointments/${id}/confirm`);
        return response.data;
    },

    // Complete appointment (for doctors) - backend uses POST
    completeAppointment: async (id: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post(`/api/appointments/${id}/complete`);
        return response.data;
    },
};
