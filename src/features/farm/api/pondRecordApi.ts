import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { serializeParams } from '@/core/utils/params';
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
        const queryString = serializeParams(params as Record<string, unknown>);
        const url = queryString
            ? `${API_ENDPOINTS.POND.RECORD.LIST(pondId)}?${queryString}`
            : API_ENDPOINTS.POND.RECORD.LIST(pondId);
        const response = await apiClient.get<PondRecordListResponse>(url);
        return response.data;
    },
};
