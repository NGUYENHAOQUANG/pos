import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IUnit } from '@/features/material/types/material.types';
import { IAppResponseV2, IPaginateV2 } from '@/features/material/types/materialGroup.types';

export type GetUnitsResponse = IAppResponseV2<IPaginateV2<IUnit>>;

export const unitApi = {
    getUnits: async (): Promise<GetUnitsResponse> => {
        const { data } = await apiClient.get<GetUnitsResponse>(API_ENDPOINTS.UNITS.LIST);
        return data;
    },
};
