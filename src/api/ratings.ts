import apiClient from './client';
import { Rating } from '../types';

export const ratingsApi = {
    // Get ratings for a doctor
    getDoctorRatings: async (doctorId: string): Promise<{ ratings: Rating[]; average: number }> => {
        const response = await apiClient.get(`/api/ratings?doctorId=${doctorId}`);
        return response.data.data;
    },

    // Submit rating
    submitRating: async (data: {
        doctorId: string;
        appointmentId: string;
        rating: number;
        review?: string;
    }): Promise<{ rating: Rating }> => {
        const response = await apiClient.post('/api/ratings', data);
        return { rating: response.data.data };
    },

    // Check if user can rate an appointment
    canRate: async (appointmentId: string): Promise<{ canRate: boolean; existingRating?: Rating }> => {
        const response = await apiClient.get(`/api/ratings/can-rate/${appointmentId}`);
        return response.data.data;
    },
};
