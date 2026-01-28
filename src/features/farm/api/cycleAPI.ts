import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { CreateCycleCommand, CycleData } from '@/features/farm/types/farm.types';

export const cycleApi = {
    createCycle: async (pondId: string, data: CreateCycleCommand): Promise<CycleData> => {
        const response = await apiClient.post(API_ENDPOINTS.POND.CYCLE.CREATE(pondId), data);
        return response.data;
    },
};
