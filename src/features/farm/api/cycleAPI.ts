import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateCycleCommand,
    CycleData,
    UpdateCycleCommand,
    CycleApiResponse,
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
        const rawData = response.data?.data || response.data;
        if (!rawData) return rawData;
        return {
            ...rawData,
            cycleName: rawData.name || rawData.cycleName,
            breedSource: rawData.breedSource || rawData.warehouseItemId,
            stockingDate: rawData.stockingDate || rawData.createdAt,
            season: rawData.season,
        };
    },

    deleteCycle: async (
        pondId: string,
        cycleId: string
    ): Promise<{ success?: boolean; message?: string }> => {
        const response = await apiClient.delete(API_ENDPOINTS.POND.CYCLE.DELETE(pondId, cycleId));
        return response.data || {};
    },

    getCyclesByPond: async (pondId: string): Promise<CycleData[]> => {
        const url = API_ENDPOINTS.POND.CYCLE.LIST(pondId);
        const response = await apiClient.get(url, {
            params: {
                PageSize: 100,
            },
        });

        const responseDataObject = response.data?.data;
        const items: CycleApiResponse[] =
            responseDataObject?.items || (Array.isArray(response.data) ? response.data : []);

        return items.map(
            item =>
                ({
                    ...item,
                    cycleName: item.name || item.cycleName || '',
                    breedSource: item.breedSource || item.warehouseItemId || '',
                    stockingDate: item.stockingDate || item.createdAt || '',
                    season: item.season,
                } as CycleData)
        );
    },
};
