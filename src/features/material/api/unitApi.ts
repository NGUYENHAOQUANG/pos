import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IUnit } from '@/features/material/types/material.types';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export type GetUnitsResponse = IApiResponse<IPaginate<IUnit>>;

export const unitApi = {
    getUnits: async (): Promise<GetUnitsResponse> => {
        const { data } = await apiClient.get<GetUnitsResponse>(API_ENDPOINTS.MATERIAL.UNITS.LIST);
        return data;
    },
};
