import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetUnitsResponse } from '@/features/material/types/material.types';

export const unitApi = {
    getUnits: async (): Promise<GetUnitsResponse> => {
        const { data } = await apiClient.get<GetUnitsResponse>(API_ENDPOINTS.UNITS.LIST);
        return data;
    },
};
