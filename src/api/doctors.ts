import apiClient from './client';
import { Doctor, Slot, ScheduleDay } from '../types';

export const doctorsApi = {
    // Get all doctors
    getDoctors: async (): Promise<{ doctors: Doctor[] }> => {
        const response = await apiClient.get('/api/doctors');
        return { doctors: response.data.data || [] };
    },

    // Get doctor by ID
    getDoctor: async (id: string): Promise<{ doctor: Doctor }> => {
        const response = await apiClient.get(`/api/doctors/${id}`);
        return { doctor: response.data.data };
    },

    // Search doctors by specialization or name
    searchDoctors: async (params: {
        query?: string;
        specialization?: string;
    }): Promise<{ doctors: Doctor[] }> => {
        const response = await apiClient.get('/api/doctors/search', { params });
        return { doctors: response.data.data || [] };
    },

    // Get available slots for a doctor
    getAvailableSlots: async (doctorId: string, date?: string): Promise<{ slots: Slot[] }> => {
        const params: Record<string, string> = { doctorId };
        if (date) params.date = date;
        const response = await apiClient.get('/api/slots/available', { params });
        return { slots: response.data.data || [] };
    },

    // Get doctor schedule (for doctors)
    getSchedule: async (): Promise<{ schedule: ScheduleDay[], clinics?: any[], rooms?: any[] }> => {
        const response = await apiClient.get('/api/doctors/schedule');
        const data = response.data.data || {};
        return {
            schedule: data.schedule_days || [],
            clinics: data.clinics || [],
            rooms: data.rooms || []
        };
    },

    // Update doctor schedule
    updateSchedule: async (schedule: ScheduleDay[]): Promise<{ success: boolean }> => {
        const response = await apiClient.put('/api/doctors/schedule', { schedule });
        return response.data;
    },

    // Generate slots
    generateSlots: async (data: {
        clinicId: string;
        roomId: string;
        startDate: string;
        endDate: string;
    }): Promise<{ slots: Slot[] }> => {
        const response = await apiClient.post('/api/doctors/slots', data);
        return { slots: response.data.data || [] };
    },
};
