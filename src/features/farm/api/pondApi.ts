import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { OperationType, PondType, PondTypeOperation } from '@/features/farm/types/farm.types';

import { GetPondsParams, GetPondsResponse } from '@/features/farm/types/pond.types';

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
    getPondsByZone: async (zoneId: string, params?: GetPondsParams): Promise<GetPondsResponse> => {
        const { data } = await apiClient.get<GetPondsResponse>(API_ENDPOINTS.ZONE.PONDS(zoneId), {
            params: {
                PageSize: 100,
                Page: 1,
                ...params,
            },
        });
        return data;
    },

    // Get all pond types (Ao nuôi, Ao vèo, Ao xử lý, etc.)
    getPondTypes: async (): Promise<PondType[]> => {
        const response = await apiClient.get(API_ENDPOINTS.POND_TYPES.LIST);
        return parseApiResponse<PondType>(response.data);
    },

    // Get all operation types (Cho ăn, Đo môi trường, Xi phông, etc.)
    getOperationTypes: async (): Promise<OperationType[]> => {
        const response = await apiClient.get(API_ENDPOINTS.POND_OPERATION.LIST);
        const operations = parseApiResponse<OperationType>(response.data);

        return operations;
    },

    // Get all pond type operations (mapping of operations for all pond types)
    getPondTypeOperations: async (): Promise<PondTypeOperation[]> => {
        // Use POND_OPERATION.LIST (/pondoperation) instead of POND_TYPE_OPERATIONS.LIST (/pond-type-operations)
        const response = await apiClient.get(API_ENDPOINTS.POND_OPERATION.LIST);
        return parseApiResponse<PondTypeOperation>(response.data);
    },
};
