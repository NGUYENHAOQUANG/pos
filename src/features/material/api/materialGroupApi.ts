import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetMaterialGroupsV2Response,
    GetMaterialGroupsV2Params,
} from '@/features/material/types/materialGroup.types';

export const materialGroupApi = {
    /**
     * Get all material groups with pagination
     * @param params - Query params (Page, PageSize, Name, Code, etc.)
     */
    getAll: async (params?: GetMaterialGroupsV2Params): Promise<GetMaterialGroupsV2Response> => {
        const { data } = await apiClient.get<GetMaterialGroupsV2Response>(
            API_ENDPOINTS.MATERIAL.GROUP.LIST,
            { params }
        );
        return data;
    },
};
