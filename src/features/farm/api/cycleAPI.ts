import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateCycleCommand,
    CycleData,
    UpdateCycleCommand,
} from '@/features/farm/types/farm.types';

export const cycleApi = {
    createCycle: async (pondId: string, data: CreateCycleCommand): Promise<CycleData> => {
        const response = await apiClient.post(API_ENDPOINTS.POND.CYCLE.CREATE(pondId), data);
        return response.data;
    },

    updateCycle: async (
        pondId: string,
        cycleId: string,
        data: UpdateCycleCommand
    ): Promise<CycleData> => {
        const response = await apiClient.patch(
            API_ENDPOINTS.POND.CYCLE.UPDATE(pondId, cycleId),
            data
        );
        return response.data;
    },

    getCycleDetail: async (pondId: string, cycleId: string): Promise<CycleData> => {
        const response = await apiClient.get(API_ENDPOINTS.POND.CYCLE.DETAIL(pondId, cycleId));
        return response.data?.data || response.data;
    },

    deleteCycle: async (pondId: string, cycleId: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.POND.CYCLE.DELETE(pondId, cycleId));
    },

    getCyclesByPond: async (pondId: string): Promise<CycleData[]> => {
        const url = API_ENDPOINTS.POND.CYCLE.LIST(pondId);
        const response = await apiClient.get(url, {
            params: {
                PageSize: 100,
            },
        });

        const responseDataObject = response.data?.data;
        if (responseDataObject?.items && Array.isArray(responseDataObject.items)) {
            return responseDataObject.items;
        }

        // Fallback for flat array if API changes
        if (Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    },
};
