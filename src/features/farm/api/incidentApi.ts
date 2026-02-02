import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type {
    CreateIncidentPayload,
    UpdateIncidentPayload,
    GetIncidentListParams,
    IncidentListResponse,
    IncidentDetailResponse,
    IncidentCreateResponse,
} from '@/features/farm/types/incident.types';

export const incidentApi = {
    /**
     * Tạo mới incident (Rửa ao / Phơi ao / Xử lý sự cố)
     * POST /api/v1/pond/{pondId}/incident
     */
    create: async (
        pondId: string,
        payload: CreateIncidentPayload
    ): Promise<IncidentCreateResponse> => {
        const url = API_ENDPOINTS.POND.INCIDENT.CREATE(pondId);
        console.log('[incidentApi] POST incident – URL:', url);
        console.log('[incidentApi] POST incident – pondId:', pondId);
        console.log('[incidentApi] POST incident – payload:', JSON.stringify(payload, null, 2));
        const response = await apiClient.post<IncidentCreateResponse>(url, payload);
        console.log(
            '[incidentApi] POST incident – response:',
            JSON.stringify(response.data, null, 2)
        );
        return response.data;
    },

    /**
     * GET /pond/{pondId}/incident – list incidents with optional query params.
     * Map PaginationParams (page, limit) → Page, PageSize cho backend.
     */
    list: async (pondId: string, params?: GetIncidentListParams): Promise<IncidentListResponse> => {
        const { page = 1, limit = 100, ...rest } = params || {};
        const query = { ...rest, Page: page, PageSize: limit };
        const response = await apiClient.get<IncidentListResponse>(
            API_ENDPOINTS.POND.INCIDENT.LIST(pondId),
            { params: query }
        );
        return response.data;
    },

    /**
     * GET /pond/{pondId}/incident/{id} – lấy chi tiết incident (cho màn chỉnh sửa)
     */
    getDetail: async (pondId: string, id: string): Promise<IncidentDetailResponse> => {
        const response = await apiClient.get<IncidentDetailResponse>(
            API_ENDPOINTS.POND.INCIDENT.DETAIL(pondId, id)
        );
        return response.data;
    },

    /**
     * PATCH /pond/{pondId}/incident/{id} – cập nhật incident
     */
    update: async (
        pondId: string,
        id: string,
        payload: UpdateIncidentPayload
    ): Promise<IncidentDetailResponse> => {
        const response = await apiClient.patch<IncidentDetailResponse>(
            API_ENDPOINTS.POND.INCIDENT.UPDATE(pondId, id),
            payload
        );
        return response.data;
    },

    delete: async (pondId: string, id: string) => {
        const response = await apiClient.delete(API_ENDPOINTS.POND.INCIDENT.DELETE(pondId, id));
        return response.data;
    },
};
