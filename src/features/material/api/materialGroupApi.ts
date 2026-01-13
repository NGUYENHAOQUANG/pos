/**
 * @file materialGroupApi.ts
 * @description Material Group API
 * @author Kindy
 * @created 2025-01-13
 */
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateMaterialGroupRequest,
    UpdateMaterialGroupRequest,
    GetMaterialGroupsResponse,
    GetMaterialGroupByIdResponse,
    IAppResponse,
} from '@/features/material/types/material.types';

export interface GetMaterialGroupsParams {
    Page?: number;
    PageSize?: number;
}

export const materialGroupApi = {
    /**
     * Get all material groups with pagination
     * @param params - Pagination params (Page, PageSize)
     */
    getAll: async (params?: GetMaterialGroupsParams): Promise<GetMaterialGroupsResponse> => {
        const { data } = await apiClient.get<GetMaterialGroupsResponse>(
            API_ENDPOINTS.MATERIAL_GROUP.LIST,
            { params }
        );
        return data;
    },

    /**
     * Get material group by ID
     * @param id - Material group ID
     */
    getById: async (id: number): Promise<GetMaterialGroupByIdResponse> => {
        const { data } = await apiClient.get<GetMaterialGroupByIdResponse>(
            API_ENDPOINTS.MATERIAL_GROUP.DETAIL(id)
        );
        return data;
    },

    /**
     * Create a new material group
     * @param request - Create material group request data
     */
    create: async (request: CreateMaterialGroupRequest): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.post<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.CREATE,
            request
        );
        return data;
    },

    /**
     * Update an existing material group
     * @param id - Material group ID
     * @param request - Update material group request data
     */
    update: async (
        id: number,
        request: UpdateMaterialGroupRequest
    ): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.put<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.UPDATE(id),
            request
        );
        return data;
    },

    /**
     * Delete a material group
     * @param id - Material group ID
     */
    delete: async (id: number): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.delete<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.DELETE(id)
        );
        return data;
    },
};
