import apiClient from './client';
import { Doctor, Slot, ScheduleDay } from '../types';

// Normalize doctor from backend (maps _id to id and ensures rating fields)
const normalizeDoctor = (doc: any): Doctor => ({
    ...doc,
    id: doc._id || doc.id,
    average_rating: doc.averageRating ?? doc.average_rating ?? 0,
    total_ratings: doc.totalRatings ?? doc.total_ratings ?? 0,
});

export const doctorsApi = {
    // Get all doctors
    getDoctors: async (): Promise<{ doctors: Doctor[] }> => {
        const response = await apiClient.get('/api/doctors');
        const rawDoctors = response.data.data || [];
        return { doctors: rawDoctors.map(normalizeDoctor) };
    },

    // Get doctor by ID
    getDoctor: async (id: string): Promise<{ doctor: Doctor }> => {
        const response = await apiClient.get(`/api/doctors/${id}`);
        const rawDoctor = response.data.data;
        return { doctor: rawDoctor ? normalizeDoctor(rawDoctor) : null as any };
    },

    // Search doctors by specialization or name
    searchDoctors: async (params: {
        query?: string;
        specialization?: string;
    }): Promise<{ doctors: Doctor[] }> => {
        const response = await apiClient.get('/api/doctors/search', { params });
        const rawDoctors = response.data.data || [];
        return { doctors: rawDoctors.map(normalizeDoctor) };
    },

    // Get available slots for a doctor
    getAvailableSlots: async (doctorId: string, date?: string): Promise<{ slots: Slot[] }> => {
        const params: Record<string, string> = { doctorId };
        if (date) params.date = date;
        const response = await apiClient.get('/api/slots/available', { params });
        // Normalize slots to ensure id field exists
        const rawSlots = response.data.data || [];
        const normalizedSlots = rawSlots.map((s: any) => ({
            ...s,
            id: s._id || s.id,
        }));
        return { slots: normalizedSlots };
    },

    // Get doctor schedule (for doctors)
    getSchedule: async (): Promise<{ schedule: ScheduleDay[], clinics?: any[], rooms?: any[], consultationFee?: number }> => {
        const response = await apiClient.get('/api/doctors/schedule');
        const data = response.data.data || {};
        return {
            schedule: data.schedule_days || [],
            clinics: data.clinics || [],
            rooms: data.rooms || [],
            consultationFee: data.consultationFee,
        };
    },

    // Update doctor schedule
    updateSchedule: async (scheduleDays: any[], consultationFee: number): Promise<{ success: boolean }> => {
        const response = await apiClient.put('/api/doctors/schedule', { scheduleDays, consultationFee });
        return response.data;
    },

    // Generate slots for the next 2 weeks based on schedule
    generateSlots: async (): Promise<{ createdCount: number }> => {
        const response = await apiClient.post('/api/doctors/slots/generate', {});
        return response.data.data || { createdCount: 0 };
    },
};
