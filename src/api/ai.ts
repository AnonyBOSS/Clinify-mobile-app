import apiClient from './client';
import { SymptomCheckResult, AIMessage, Doctor } from '../types';

export const aiApi = {
    // Symptom check - backend returns { data: { checkId, analysis, recommendedDoctors } }
    checkSymptoms: async (symptoms: string): Promise<SymptomCheckResult> => {
        const response = await apiClient.post('/api/ai/symptom-check', { symptoms });
        // Debug: log the raw response
        console.log('SYMPTOM CHECK RAW RESPONSE:', JSON.stringify(response.data, null, 2));
        // Backend returns analysis object inside data
        const data = response.data.data;
        // Map backend analysis format to SymptomCheckResult
        return {
            analysis: data.analysis?.possibleConditions || data.analysis?.analysis || 'Analysis not available',
            recommendations: data.analysis?.recommendations || [],
            suggestedSpecializations: data.analysis?.suggestedSpecialties || data.analysis?.suggestedSpecializations || [],
            urgency: data.analysis?.urgency || 'low',
        };
    },

    // Get symptom check history
    getSymptomHistory: async (): Promise<{ history: SymptomCheckResult[] }> => {
        const response = await apiClient.get('/api/ai/symptom-check');
        return { history: response.data.data || [] };
    },

    // AI Chat - backend expects { message: string }, returns { data: { message, quickActions } }
    chat: async (message: string): Promise<{ response: string }> => {
        const response = await apiClient.post('/api/ai/chat', { message });
        // Backend returns message in data.message, not data.response
        return { response: response.data.data?.message || 'No response' };
    },

    // Get doctor recommendations based on symptoms
    recommendDoctors: async (symptoms: string): Promise<{ doctors: Doctor[] }> => {
        const response = await apiClient.post('/api/ai/recommend-doctors', { symptoms });
        return { doctors: response.data.data || [] };
    },
};
