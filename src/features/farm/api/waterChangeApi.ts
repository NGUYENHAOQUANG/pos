import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { CreateWaterSupplyCommand } from '@/features/farm/types/waterChange.types';

export const waterSupplyApi = {
    create: async (pondId: string, data: CreateWaterSupplyCommand): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_CHANGE_RECORD.CREATE(pondId);
            const response = await apiClient.post(url, data);

            return !!response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (
        pondId: string,
        id: string,
        data: CreateWaterSupplyCommand
    ): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_CHANGE_RECORD.UPDATE(pondId, id);
            const response = await apiClient.put(url, data);

            return !!response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (pondId: string, id: string): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.WATER_CHANGE_RECORD.DELETE(pondId, id);
            const response = await apiClient.delete(url);
            return !!response.data;
        } catch (error) {
            console.error('Delete water supply error:', error);
            throw error;
        }
    },

    getAll: async (pondId: string, params?: any) => {
        try {
            const url = API_ENDPOINTS.POND.WATER_CHANGE_RECORD.LIST(pondId);
            const response = await apiClient.get(url, { params });
            return response.data;
        } catch (error) {
            console.error('Get all water supply error:', error);
            throw error;
        }
    },

    getDetail: async (pondId: string, id: string) => {
        try {
            const url = API_ENDPOINTS.POND.WATER_CHANGE_RECORD.DETAIL(pondId, id);
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error('Get detail water supply error:', error);
            throw error;
        }
    },
};
