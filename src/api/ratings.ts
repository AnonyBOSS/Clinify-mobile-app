import apiClient from './client';
import { Rating } from '../types';

export const ratingsApi = {
    // Get ratings for a doctor
    getDoctorRatings: async (doctorId: string): Promise<{ ratings: Rating[]; averageRating: number; totalRatings: number }> => {
        const response = await apiClient.get(`/api/ratings?doctorId=${doctorId}`);
        // Response: { ratings, averageRating, totalRatings }
        return response.data.data;
    },

    // Submit rating - backend only needs appointmentId, rating, review, isAnonymous
    // It gets doctorId from the appointment record
    submitRating: async (data: {
        appointmentId: string;
        rating: number;
        review?: string;
        isAnonymous?: boolean;
    }): Promise<{ rating: Rating }> => {
        const response = await apiClient.post('/api/ratings', data);
        return { rating: response.data.data };
    },

    // Check if user can rate an appointment
    canRate: async (appointmentId: string): Promise<{ canRate: boolean; existingRating?: Rating }> => {
        const response = await apiClient.get(`/api/ratings/can-rate/${appointmentId}`);
        return response.data.data;
    },

    // Get patient's own ratings history
    getMyRatings: async (): Promise<{ ratings: Rating[] }> => {
        const response = await apiClient.get('/api/ratings?myRatings=true');
        return { ratings: response.data.data || [] };
    },

    // Update an existing rating - PATCH /api/ratings with ratingId in body
    updateRating: async (ratingId: string, data: {
        rating: number;
        review?: string;
    }): Promise<{ success: boolean }> => {
        const response = await apiClient.patch('/api/ratings', {
            ratingId,
            ...data
        });
        return { success: response.data.success };
    },

    // Delete a rating - DELETE /api/ratings?ratingId=xxx
    deleteRating: async (ratingId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(`/api/ratings?ratingId=${ratingId}`);
        return { success: response.data.success };
    },
};
