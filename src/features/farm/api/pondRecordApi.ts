import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type {
    IPondRecordListParams,
    PondRecordListResponse,
} from '@/features/farm/types/pondRecord.types';

export const pondRecordApi = {
    /**
     * Get all pond records (GET /api/v1/pond/{pondId}/record)
     * Consolidated view of all operation records for a pond
     */
    list: async (
        pondId: string,
        params?: IPondRecordListParams
    ): Promise<PondRecordListResponse> => {
        const response = await apiClient.get<PondRecordListResponse>(
            API_ENDPOINTS.POND.RECORD.LIST(pondId),
            { params }
        );
        return response.data;
    },
};
