import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    CreateMaterialGroupV2Request,
    UpdateMaterialGroupV2Request,
    GetMaterialGroupsV2Response,
    GetMaterialGroupByIdV2Response,
    GetMaterialGroupsV2Params,
    IAppResponseV2,
} from '@/features/material/types/materialGroup.types';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

export const materialGroupApi = {
    /**
     * Get all material groups with pagination
     * @param params - Query params (Page, PageSize, Name, Code, etc.)
     */
    getAll: async (params?: GetMaterialGroupsV2Params): Promise<GetMaterialGroupsV2Response> => {
        const { data } = await apiClient.get<GetMaterialGroupsV2Response>(
            API_ENDPOINTS.MATERIAL_GROUP.LIST,
            { params }
        );
        return data;
    },

    /**
     * Get material group by ID
     * @param id - Material group ID (UUID string)
     */
    getById: async (id: string): Promise<GetMaterialGroupByIdV2Response> => {
        const { data } = await apiClient.get<GetMaterialGroupByIdV2Response>(
            API_ENDPOINTS.MATERIAL_GROUP.DETAIL(id as any)
        );
        return data;
    },

    /**
     * Create a new material group
     * @param request - Create material group request data
     */
    create: async (request: CreateMaterialGroupV2Request): Promise<IAppResponseV2<null>> => {
        const { data } = await apiClient.post<IAppResponseV2<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.CREATE,
            request
        );
        if (!data.success) {
            const errorMessage = getErrorMessage(
                { response: { data } },
                data.message || 'Tạo nhóm vật tư thất bại'
            );
            throw new Error(errorMessage);
        }
        return data;
    },

    /**
     * Update an existing material group
     * @param id - Material group ID (UUID string)
     * @param request - Update material group request data
     */
    update: async (
        id: string,
        request: UpdateMaterialGroupV2Request
    ): Promise<IAppResponseV2<null>> => {
        const { data } = await apiClient.put<IAppResponseV2<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.UPDATE(id as any),
            request
        );
        if (!data.success) {
            const errorMessage = getErrorMessage(
                { response: { data } },
                data.message || 'Cập nhật nhóm vật tư thất bại'
            );
            throw new Error(errorMessage);
        }
        return data;
    },

    /**
     * Delete a material group
     * @param id - Material group ID (UUID string)
     */
    delete: async (id: string): Promise<IAppResponseV2<null>> => {
        const { data } = await apiClient.delete<IAppResponseV2<null>>(
            API_ENDPOINTS.MATERIAL_GROUP.DELETE(id as any)
        );
        return data;
    },
};
