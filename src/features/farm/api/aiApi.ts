import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type { IApiResponse } from '@/shared/types/common.types';
import type {
    AIPredictRequest,
    SeedstockCountingResponse,
    EstimatedSizeResponse,
    ShrimpHealthResponse,
} from '@/features/farm/types/ai.types';

export const aiApi = {
    countSeedstock: async (data: AIPredictRequest): Promise<SeedstockCountingResponse> => {
        const response = await apiClient.post<IApiResponse<SeedstockCountingResponse>>(
            API_ENDPOINTS.AI.SEEDSTOCK_COUNTING,
            data,
            { timeout: 60000 }
        );
        return response.data?.data || { totalCount: 0, detections: [] };
    },
    estimateSize: async (data: AIPredictRequest): Promise<EstimatedSizeResponse> => {
        const response = await apiClient.post<IApiResponse<EstimatedSizeResponse>>(
            API_ENDPOINTS.AI.ESTIMATED_SIZE,
            data,
            { timeout: 60000 }
        );
        return response.data?.data || {};
    },
    predictHealth: async (data: AIPredictRequest): Promise<ShrimpHealthResponse> => {
        const response = await apiClient.post<IApiResponse<ShrimpHealthResponse>>(
            API_ENDPOINTS.AI.SHRIMP_HEALTH,
            data,
            { timeout: 60000 }
        );
        return response.data?.data || { results: [] };
    },
};
