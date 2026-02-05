import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetMetricsResponse } from '@/features/farm/types/metric.types';

export const metricApi = {
    getMetrics: async (): Promise<GetMetricsResponse> => {
        const response = await apiClient.get<GetMetricsResponse>(API_ENDPOINTS.METRIC.LIST);
        return response.data;
    },
};
