/**
 * @file materialTypeApi.ts
 * @description Material Type API - Get Material Types by Material Group ID
 * @author Kindy
 * @created 2026-01-13
 */
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetMaterialTypesResponse } from '@/features/material/types/material.types';

export interface GetMaterialTypesParams {
    Page?: number;
    PageSize?: number;
    MaterialGroupId?: number;
}

export const materialTypeApi = {
    /**
     * Get all material types with pagination and optional filter by MaterialGroupId
     * @param params - Pagination params (Page, PageSize) and optional MaterialGroupId filter
     */
    getList: async (params?: GetMaterialTypesParams): Promise<GetMaterialTypesResponse> => {
        const { data } = await apiClient.get<GetMaterialTypesResponse>(
            API_ENDPOINTS.MATERIAL_TYPE.LIST,
            { params }
        );
        console.log('[API] materialTypeApi.getList:', JSON.stringify(data, null, 2));
        return data;
    },
};
