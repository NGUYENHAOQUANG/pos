import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { PondData, PondType, PondTypeOperation } from '@/features/farm/types/farm.types';

export const pondApi = {
    getPonds: async (): Promise<PondData[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PONDS.LIST);
            const responseData = response.data;

            // Handle different potential response structures (similar to zoneApi)
            if (Array.isArray(responseData)) {
                return responseData;
            } else if (responseData?.data) {
                if (Array.isArray(responseData.data)) {
                    return responseData.data;
                } else if (responseData.data.items && Array.isArray(responseData.data.items)) {
                    return responseData.data.items;
                }
            } else if (responseData?.result) {
                if (Array.isArray(responseData.result)) {
                    return responseData.result;
                } else if (responseData.result.items && Array.isArray(responseData.result.items)) {
                    return responseData.result.items;
                }
            } else if (responseData?.items && Array.isArray(responseData.items)) {
                return responseData.items;
            }

            console.warn('Unknown Pond API response structure:', responseData);
            return [];
        } catch (error) {
            console.error('Failed to fetch ponds API:', error);
            throw error;
        }
    },

    getPondsByZone: async (
        zoneId: number | string,
        params?: { PageSize?: number; PageNumber?: number }
    ): Promise<{ items: PondData[]; total: number }> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.ZONES.PONDS(zoneId), {
                params: {
                    pageSize: params?.PageSize || 100,
                    page: params?.PageNumber || 1,
                    // size: params?.PageSize || 100, // Try keeping both if unsure, but pageSize is standard
                },
            });
            const responseData = response.data;
            // Removed debug log
            let items: PondData[] = [];
            let total = 0;

            // Reuse the same response parsing logic but capture total
            if (Array.isArray(responseData)) {
                items = responseData;
                total = items.length;
            } else if (responseData?.data) {
                // Check simple wrapper or paging wrapper
                if (Array.isArray(responseData.data)) {
                    items = responseData.data;
                    total = items.length;
                } else if (responseData.data.items && Array.isArray(responseData.data.items)) {
                    items = responseData.data.items;
                    total = responseData.data.total || items.length;
                }
            } else if (responseData?.result) {
                if (Array.isArray(responseData.result)) {
                    items = responseData.result;
                    total = items.length;
                } else if (responseData.result.items && Array.isArray(responseData.result.items)) {
                    items = responseData.result.items;
                    total = responseData.result.total || items.length;
                }
            } else if (responseData?.items && Array.isArray(responseData.items)) {
                items = responseData.items;
                total = responseData.total || items.length;
            } else {
                console.warn(
                    `Unknown Ponds by Zone API response structure for zone ${zoneId}:`,
                    responseData
                );
            }

            return { items, total };
        } catch (error) {
            console.error(`Failed to fetch ponds for zone ${zoneId}:`, error);
            // Return empty result
            return { items: [], total: 0 };
        }
    },

    getPondTypes: async (): Promise<PondType[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.POND_TYPES.LIST);
            const responseData = response.data;
            // console.log('Raw Pond Types Response:', JSON.stringify(responseData, null, 2));

            if (Array.isArray(responseData)) return responseData;

            if (responseData?.data) {
                if (Array.isArray(responseData.data)) return responseData.data;
                if (responseData.data.items && Array.isArray(responseData.data.items))
                    return responseData.data.items;
            }

            if (responseData?.result) {
                if (Array.isArray(responseData.result)) return responseData.result;
                if (responseData.result.items && Array.isArray(responseData.result.items))
                    return responseData.result.items;
            }

            if (responseData?.items && Array.isArray(responseData.items)) return responseData.items;

            return [];
        } catch (error) {
            console.error('Failed to fetch pond types:', error);
            return [];
        }
    },

    getPondTypeOperations: async (): Promise<PondTypeOperation[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.POND_TYPE_OPERATIONS.LIST);
            const responseData = response.data;
            // console.log(
            //     'Raw Pond Type Operations Response:',
            //     JSON.stringify(responseData, null, 2)
            // );

            if (Array.isArray(responseData)) return responseData;

            if (responseData?.data) {
                if (Array.isArray(responseData.data)) return responseData.data;
                if (responseData.data.items && Array.isArray(responseData.data.items))
                    return responseData.data.items;
            }

            if (responseData?.result) {
                if (Array.isArray(responseData.result)) return responseData.result;
                if (responseData.result.items && Array.isArray(responseData.result.items))
                    return responseData.result.items;
            }

            if (responseData?.items && Array.isArray(responseData.items)) return responseData.items;

            return [];
        } catch (error) {
            console.error('Failed to fetch pond type operations:', error);
            return [];
        }
    },
};
