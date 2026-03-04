import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    ICycleDetailResponse,
    ICycleListParams,
    ICycleListResponse,
    ICreateCyclePayload,
    IUpdateCyclePayload,
} from '@/features/farm/types/cycle.types';
import { IApiResponse } from '@/shared/types/common.types';

export const cycleApi = {
    /**
     * Get cycles for a pond
     */
    getCyclesByPond: async (
        pondId: string,
        params?: ICycleListParams
    ): Promise<ICycleListResponse> => {
        const url = API_ENDPOINTS.POND.CYCLE.LIST(pondId);
        const response = await apiClient.get<ICycleListResponse>(url, {
            params,
        });
        return response.data;
    },

    /**
     * Create a new cycle
     */
    createCycle: async (
        pondId: string,
        data: ICreateCyclePayload
    ): Promise<ICycleDetailResponse> => {
        const response = await apiClient.post<ICycleDetailResponse>(
            API_ENDPOINTS.POND.CYCLE.CREATE(pondId),
            data
        );
        return response.data;
    },

    /**
     * Update an existing cycle
     */
    updateCycle: async (
        pondId: string,
        cycleId: string,
        data: IUpdateCyclePayload
    ): Promise<ICycleDetailResponse> => {
        const response = await apiClient.patch<ICycleDetailResponse>(
            API_ENDPOINTS.POND.CYCLE.UPDATE(pondId, cycleId),
            data
        );
        return response.data;
    },

    /**
     * Get cycle detail
     */
    getCycleDetail: async (pondId: string, cycleId: string): Promise<ICycleDetailResponse> => {
        const response = await apiClient.get<ICycleDetailResponse>(
            API_ENDPOINTS.POND.CYCLE.DETAIL(pondId, cycleId)
        );
        return response.data;
    },

    /**
     * Delete a cycle
     */
    deleteCycle: async (pondId: string, cycleId: string): Promise<IApiResponse<boolean>> => {
        const response = await apiClient.delete<IApiResponse<boolean>>(
            API_ENDPOINTS.POND.CYCLE.DELETE(pondId, cycleId)
        );
        return response.data;
    },
};
