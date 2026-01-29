import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { CreateSiphonCommand } from '@/features/farm/types/siphon.types';

export const siphonApi = {
    create: async (pondId: string, data: CreateSiphonCommand): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS.LIST(pondId);
            const response = await apiClient.post(url, data);
            return response.data?.success || false;
        } catch (error) {
            console.error('Create siphon error:', error);
            throw error;
        }
    },

    getAll: async (pondId: string, params?: any) => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS.LIST(pondId);
            const response = await apiClient.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Get all siphon error:', error);
            throw error;
        }
    },

    getDetail: async (pondId: string, id: string) => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS.DETAIL(pondId, id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Get detail siphon error:', error);
            throw error;
        }
    },
};
