import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateMaterialRequest,
    UpdateMaterialRequest,
    GetMaterialsResponse,
    GetMaterialByIdResponse,
    GetMaterialsParams,
    IAppResponse,
} from '@/features/material/types/material.types';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

export const materialApi = {
    /**
     * Get list of materials with pagination and filters
     * @param params - Query params (Search, MaterialTypeId, Page, PageSize)
     */
    getAll: async (params?: GetMaterialsParams): Promise<GetMaterialsResponse> => {
        const { data } = await apiClient.get<GetMaterialsResponse>(API_ENDPOINTS.MATERIAL.LIST, {
            params,
        });
        return data;
    },

    /**
     * Get material by ID
     * @param id - Material ID
     */
    getById: async (id: number): Promise<GetMaterialByIdResponse> => {
        const { data } = await apiClient.get<GetMaterialByIdResponse>(
            API_ENDPOINTS.MATERIAL.DETAIL(id)
        );
        return data;
    },

    /**
     * Create a new material
     * @param request - Create material request data
     */
    create: async (request: CreateMaterialRequest): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.post<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL.CREATE,
            request
        );
        if (!data.result) {
            const errorMessage = getErrorMessage(
                { response: { data } },
                data.message || 'Tạo vật tư thất bại'
            );
            throw new Error(errorMessage);
        }
        return data;
    },

    /**
     * Update an existing material
     * @param id - Material ID
     * @param request - Update material request data
     */
    update: async (id: number, request: UpdateMaterialRequest): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.put<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL.UPDATE(id),
            request
        );
        if (!data.result) {
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
    delete: async (id: number): Promise<IAppResponse<null>> => {
        const { data } = await apiClient.delete<IAppResponse<null>>(
            API_ENDPOINTS.MATERIAL.DELETE(id)
        );
        return data;
    },
};
