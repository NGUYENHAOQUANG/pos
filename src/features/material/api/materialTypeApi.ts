import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetMaterialTypesResponse } from '@/features/material/types/material.types';

export interface GetMaterialTypesParams {
    Page?: number;
    PageSize?: number;
    MaterialGroupId?: number;
}

export const materialTypeApi = {
    getList: async (params?: GetMaterialTypesParams): Promise<GetMaterialTypesResponse> => {
        const { data } = await apiClient.get<GetMaterialTypesResponse>(
            API_ENDPOINTS.MATERIAL_TYPE.LIST,
            { params }
        );
        return data;
    },
};
