import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IMaterialType } from '@/features/material/types/material.types';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';

// Keep legacy params for backward compatibility
export interface GetMaterialTypesParams {
    Page?: number;
    PageSize?: number;
    MaterialGroupId?: string;
}

export type GetMaterialTypesResponse = IApiResponse<IPaginate<IMaterialType>>;

export const materialTypeApi = {
    getList: async (params?: GetMaterialTypesParams): Promise<GetMaterialTypesResponse> => {
        const { data } = await apiClient.get<GetMaterialTypesResponse>(
            API_ENDPOINTS.MATERIAL.TYPE.LIST,
            { params }
        );
        return data;
    },
};
