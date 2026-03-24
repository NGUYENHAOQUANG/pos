import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateMaterialV2Request,
    UpdateMaterialV2Request,
    GetMaterialsParams,
    GetMaterialsV2Response,
    GetMaterialByIdV2Response,
    DeleteMaterialResponse,
    CreateMaterialResponse,
    UpdateMaterialResponse,
} from '@/features/material/types/material.types';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

export const materialApi = {
    /**
     * Get list of materials with pagination and filters
     * @param params - Query params (Search, MaterialTypeId, Page, PageSize)
     */
    getAll: async (params?: GetMaterialsParams): Promise<GetMaterialsV2Response> => {
        const { data } = await apiClient.get<GetMaterialsV2Response>(API_ENDPOINTS.MATERIAL.LIST, {
            params,
        });
        return data;
    },

    /**
     * Get material by ID
     * @param id - Material ID
     */
    getById: async (id: string): Promise<GetMaterialByIdV2Response> => {
        const { data } = await apiClient.get<GetMaterialByIdV2Response>(
            API_ENDPOINTS.MATERIAL.DETAIL(id)
        );
        return data;
    },

    /**
     * Create a new material
     * @param request - Create material request data
     */
    create: async (request: CreateMaterialV2Request): Promise<CreateMaterialResponse> => {
        const { data } = await apiClient.post<CreateMaterialResponse>(
            API_ENDPOINTS.MATERIAL.CREATE,
            request
        );
        return data;
    },

    /**
     * Update an existing material
     * @param id - Material ID
     * @param request - Update material request data
     */
    update: async (
        id: string,
        request: UpdateMaterialV2Request
    ): Promise<UpdateMaterialResponse> => {
        const { data } = await apiClient.patch<UpdateMaterialResponse>(
            API_ENDPOINTS.MATERIAL.UPDATE(id),
            request
        );
        if (!data.success) {
            const errorMessage = getErrorMessage(
                { response: { data } },
                data.message || 'Cập nhật vật tư thất bại'
            );
            throw new Error(errorMessage);
        }
        return data;
    },

    /**
     * Delete a material
     * @param id - Material ID
     */
    delete: async (id: string): Promise<DeleteMaterialResponse> => {
        const { data } = await apiClient.delete<DeleteMaterialResponse>(
            API_ENDPOINTS.MATERIAL.DELETE(id)
        );
        return data;
    },
};
