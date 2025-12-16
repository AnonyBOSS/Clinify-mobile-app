import apiClient from './client';

export interface DoctorAnalytics {
    summary: {
        totalAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        upcomingCount: number;
        totalRevenue: number;
        avgRating: number;
        totalRatings: number;
        availableSlots: number;
    };
    dailyStats: Array<{
        date: string;
        appointments: number;
    }>;
    upcomingStats: Array<{
        date: string;
        day: string;
        appointments: number;
    }>;
    busyHours: Array<{
        hour: string;
        appointments: number;
    }>;
    upcomingAppointments: Array<{
        id: string;
        patient: string;
        date: string;
        time: string;
        status: string;
    }>;
}

export const analyticsApi = {
    // Get doctor analytics
    getDoctorAnalytics: async (): Promise<{ analytics: DoctorAnalytics }> => {
        const response = await apiClient.get('/api/analytics/doctor');
        return { analytics: response.data.data };
    },
};
