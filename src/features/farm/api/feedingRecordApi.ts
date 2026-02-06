import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type {
    CreateFeedingRecordPayload,
    FeedingRecordCreateResponse,
    FeedingRecordListParams,
    FeedingRecordListResponse,
    FeedingRecordDetailResponse,
} from '@/features/farm/types/feedingRecord.types';

export const feedingRecordApi = {
    /**
     * Tạo mới feeding record
     * POST /api/v1/pond/{pondId}/feeding-records
     */
    create: async (
        pondId: string,
        payload: CreateFeedingRecordPayload
    ): Promise<FeedingRecordCreateResponse> => {
        const response = await apiClient.post<FeedingRecordCreateResponse>(
            API_ENDPOINTS.POND.FEEDING_RECORDS.CREATE(pondId),
            payload
        );
        return response.data;
    },

    /**
     * Lấy danh sách feeding records (GET /api/v1/pond/{pondId}/feeding-records)
     */
    list: async (
        pondId: string,
        params?: FeedingRecordListParams
    ): Promise<FeedingRecordListResponse> => {
        const response = await apiClient.get<FeedingRecordListResponse>(
            API_ENDPOINTS.POND.FEEDING_RECORDS.LIST(pondId),
            {
                params,
            }
        );
        return response.data;
    },

    /**
     * Lấy chi tiết một feeding record
     */
    getDetail: async (pondId: string, id: string): Promise<FeedingRecordDetailResponse> => {
        const response = await apiClient.get<FeedingRecordDetailResponse>(
            API_ENDPOINTS.POND.FEEDING_RECORDS.DETAIL(pondId, id)
        );
        return response.data;
    },

    /**
     * Cập nhật feeding record
     * PUT /api/v1/pond/{pondId}/feeding-records/{id}
     */
    update: async (
        pondId: string,
        id: string,
        payload: CreateFeedingRecordPayload
    ): Promise<FeedingRecordCreateResponse> => {
        const response = await apiClient.put<FeedingRecordCreateResponse>(
            API_ENDPOINTS.POND.FEEDING_RECORDS.UPDATE(pondId, id),
            payload
        );
        return response.data;
    },

    /**
     * Xóa feeding record
     * DELETE /api/v1/pond/{pondId}/feeding-records/{id}
     */
    delete: async (pondId: string, id: string): Promise<any> => {
        const response = await apiClient.delete(
            API_ENDPOINTS.POND.FEEDING_RECORDS.DELETE(pondId, id)
        );
        return response.data;
    },
};
