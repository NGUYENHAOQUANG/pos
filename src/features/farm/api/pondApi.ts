import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    OperationType,
    PondData,
    PondType,
    PondTypeOperation,
} from '@/features/farm/types/farm.types';

// Helper function to parse paginated API response
const parseApiResponse = <T>(responseData: unknown): T[] => {
    if (Array.isArray(responseData)) return responseData;

    const data = responseData as Record<string, unknown>;

    if (data?.data) {
        if (Array.isArray(data.data)) return data.data;
        const nestedData = data.data as Record<string, unknown>;
        if (nestedData.items && Array.isArray(nestedData.items)) return nestedData.items;
    }

    if (data?.result) {
        if (Array.isArray(data.result)) return data.result;
        const resultData = data.result as Record<string, unknown>;
        if (resultData.items && Array.isArray(resultData.items)) return resultData.items;
    }

    if (data?.items && Array.isArray(data.items)) return data.items;

    return [];
};

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
        const response = await apiClient.get(API_ENDPOINTS.ZONES.PONDS(zoneId), {
            params: {
                pageSize: params?.PageSize || 100,
                page: params?.PageNumber || 1,
            },
        });
        const responseData = response.data;
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

        return {
            items: items.map(p => ({ ...p, zoneId: Number(zoneId) })),
            total,
        };
    },

    // Get all pond types (Ao nuôi, Ao vèo, Ao xử lý, etc.)
    getPondTypes: async (): Promise<PondType[]> => {
        const response = await apiClient.get(API_ENDPOINTS.POND_TYPES.LIST);
        return parseApiResponse<PondType>(response.data);
    },

    // Get all operation types (Cho ăn, Đo môi trường, Xi phông, etc.)
    getOperationTypes: async (): Promise<OperationType[]> => {
        const response = await apiClient.get(API_ENDPOINTS.OPERATION_TYPES.LIST);
        const operations = parseApiResponse<OperationType>(response.data);
        console.log('=== OPERATION TYPES FROM API ===');
        console.log(JSON.stringify(operations, null, 2));
        return operations;
    },

    // Get all pond type operations (mapping of operations for all pond types)
    getPondTypeOperations: async (): Promise<PondTypeOperation[]> => {
        const response = await apiClient.get(API_ENDPOINTS.POND_TYPE_OPERATIONS.LIST);
        return parseApiResponse<PondTypeOperation>(response.data);
    },

    // Get operations available for a specific pond type
    // Example: What operations are available for "Ao nuôi"? (Feeding, Environment monitoring, Siphon, etc.)
    getOperationsByPondType: async (pondTypeId: number): Promise<PondTypeOperation[]> => {
        const response = await apiClient.get(
            API_ENDPOINTS.POND_TYPE_OPERATIONS.BY_POND_TYPE(pondTypeId)
        );
        const operations = parseApiResponse<PondTypeOperation>(response.data);
        console.log(`=== OPERATIONS FOR POND TYPE ${pondTypeId} ===`);
        console.log(JSON.stringify(operations, null, 2));
        return operations;
    },
};
