import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export interface CreateSiphonCommand {
    value: number;
    documentIds: string[];
    siphonDetail: {
        shrimplossKg: number;
        notes: string;
        materials: {
            warehouseItemId: string;
            quantity: number;
        }[];
    };
}

export const siphonApi = {
    create: async (pondId: string, data: CreateSiphonCommand): Promise<boolean> => {
        try {
            const url = API_ENDPOINTS.POND.SIPHON_RECORDS(pondId);
            const response = await apiClient.post(url, data);
            return response.data?.success || false;
        } catch (error) {
            console.error('Create siphon error:', error);
            throw error;
        }
    },
};
