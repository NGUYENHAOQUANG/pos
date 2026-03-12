import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type { IApiResponse, IPaginate } from '@/shared/types/common.types';
import type {
    CreateShrimpHealthCheckPayload,
    UpdateShrimpHealthCheckPayload,
    ShrimpHealthCheckResult,
    ShrimpHealthCheckDto,
    IShrimpHealthListParams,
} from '@/features/farm/types/shrimpHealthCheck.types';

// Re-export types for convenience
export type {
    LeftoverFeedEnum,
    GutConditionEnum,
    GutColorEnum,
    FecesColorEnum,
    LiverConditionEnum,
    ShrimpHealthCheckDetail,
    CreateShrimpHealthCheckPayload,
    UpdateShrimpHealthCheckPayload,
    Creator,
    ShrimpHealthCheckResult,
    ShrimpHealthCheckDetailDto,
    ShrimpHealthCheckDto,
} from '@/features/farm/types/shrimpHealthCheck.types';

export const shrimpHealthCheckApi = {
    /**
     * Tạo mới kiểm tra tôm
     * POST /api/v1/pond/{pondId}/shrimp-healths
     */
    create: async (
        pondId: string,
        payload: CreateShrimpHealthCheckPayload
    ): Promise<IApiResponse<ShrimpHealthCheckResult>> => {
        const response = await apiClient.post<IApiResponse<ShrimpHealthCheckResult>>(
            API_ENDPOINTS.POND.SHRIMP_HEALTH.CREATE(pondId),
            payload
        );
        return response.data;
    },

    /**
     * Lấy danh sách kiểm tra tôm của ao
     * GET /api/v1/pond/{pondId}/shrimp-healths
     */
    list: async (
        pondId: string,
        params?: IShrimpHealthListParams
    ): Promise<IApiResponse<IPaginate<ShrimpHealthCheckDto>>> => {
        const response = await apiClient.get<IApiResponse<IPaginate<ShrimpHealthCheckDto>>>(
            API_ENDPOINTS.POND.SHRIMP_HEALTH.LIST(pondId),
            { params }
        );
        return response.data;
    },

    /**
     * Lấy chi tiết một kiểm tra tôm
     * GET /api/v1/pond/{pondId}/shrimp-healths/{id}
     */
    getDetail: async (pondId: string, id: string): Promise<IApiResponse<ShrimpHealthCheckDto>> => {
        const response = await apiClient.get<IApiResponse<ShrimpHealthCheckDto>>(
            API_ENDPOINTS.POND.SHRIMP_HEALTH.DETAIL(pondId, id)
        );
        return response.data;
    },

    /**
     * Cập nhật kiểm tra tôm
     * PUT /api/v1/pond/{pondId}/shrimp-healths/{id}
     */
    update: async (
        pondId: string,
        id: string,
        payload: UpdateShrimpHealthCheckPayload
    ): Promise<IApiResponse<ShrimpHealthCheckResult>> => {
        const response = await apiClient.put<IApiResponse<ShrimpHealthCheckResult>>(
            API_ENDPOINTS.POND.SHRIMP_HEALTH.UPDATE(pondId, id),
            payload
        );
        return response.data;
    },

    /**
     * Xóa kiểm tra tôm
     * DELETE /api/v1/pond/{pondId}/shrimp-healths/{id}
     */
    delete: async (pondId: string, id: string): Promise<IApiResponse<void>> => {
        const response = await apiClient.delete<IApiResponse<void>>(
            API_ENDPOINTS.POND.SHRIMP_HEALTH.DELETE(pondId, id)
        );
        return response.data;
    },
};
