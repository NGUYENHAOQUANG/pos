import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IMaterialType } from '@/features/material/types/material.types';
import { IAppResponseV2, IPaginateV2 } from '@/features/material/types/materialGroup.types';

// Keep legacy params for backward compatibility
export interface GetMaterialTypesParams {
    Page?: number;
    PageSize?: number;
    MaterialGroupId?: number;
}

export type GetMaterialTypesResponse = IAppResponseV2<IPaginateV2<IMaterialType>>;

export const materialTypeApi = {
    getList: async (params?: GetMaterialTypesParams): Promise<GetMaterialTypesResponse> => {
        const { data } = await apiClient.get<GetMaterialTypesResponse>(
            API_ENDPOINTS.MATERIAL_TYPE.LIST,
            { params }
        );
        return data;
    },
};
