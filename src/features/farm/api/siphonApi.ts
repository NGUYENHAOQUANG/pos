import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { CreateSiphonCommand } from '@/features/farm/types/siphon.types';

export const siphonApi = {
    create: async (pondId: string, data: CreateSiphonCommand): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS('ae9e1840-cad0-46cb-9648-7f8c3998235a');
            const response = await apiClient.post(url, data);
            return response.data?.success || false;
        } catch (error) {
            console.error('Create siphon error:', error);
            throw error;
        }
    },

    getAll: async (pondId: string, params?: any) => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS('ae9e1840-cad0-46cb-9648-7f8c3998235a');
            const response = await apiClient.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Get all siphon error:', error);
            throw error;
        }
    },
};
