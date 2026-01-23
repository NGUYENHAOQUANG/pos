import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { Zone } from '@/features/farm/types/farm.types';

export const zoneApi = {
    getZones: async (): Promise<Zone[]> => {
        const response = await apiClient.get(API_ENDPOINTS.ZONE.LIST);
        const responseData = response.data;

        // Handle different potential response structures
        // 1. Direct Array
        if (Array.isArray(responseData)) {
            return responseData;
        }
        // 2. Wrapped in data property
        else if (responseData?.data) {
            if (Array.isArray(responseData.data)) {
                return responseData.data;
            } else if (responseData.data.items && Array.isArray(responseData.data.items)) {
                // Paged result inside data
                return responseData.data.items;
            }
        }
        // 3. Wrapped in result property
        else if (responseData?.result) {
            if (Array.isArray(responseData.result)) {
                return responseData.result;
            } else if (responseData.result.items && Array.isArray(responseData.result.items)) {
                return responseData.result.items;
            }
        }
        // 4. Direct Paged result (items at root)
        else if (responseData?.items && Array.isArray(responseData.items)) {
            return responseData.items;
        }

        console.warn('Unknown Zone API response structure:', responseData);
        return [];
    },
};
