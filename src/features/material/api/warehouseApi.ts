import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetWarehousesParams, IWarehouse } from '@/features/material/types/material.types';

export const warehouseApi = {
    getAll: async (params?: GetWarehousesParams): Promise<IWarehouse[]> => {
        const { data } = await apiClient.get(API_ENDPOINTS.WAREHOUSE.LIST, {
            params,
        });

        // Handle various response structures similar to zoneApi
        if (Array.isArray(data)) {
            return data;
        }
        if (data?.data && Array.isArray(data.data)) {
            return data.data;
        }
        if (data?.data?.items && Array.isArray(data.data.items)) {
            return data.data.items;
        }
        if (data?.items && Array.isArray(data.items)) {
            return data.items;
        }

        return [];
    },
};
