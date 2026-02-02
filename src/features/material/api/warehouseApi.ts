import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetWarehouseItemsResponse,
    GetWarehousesParams,
    IWarehouse,
    GetShrimpSeedsResponse,
    GetWarehouseItemsQueryParams,
} from '@/features/material/types/warehouse.types';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export type GetWarehousesResponse = IApiResponse<IPaginate<IWarehouse>>;

export const warehouseApi = {
    getAll: async (params?: GetWarehousesParams): Promise<GetWarehousesResponse> => {
        const { data } = await apiClient.get<GetWarehousesResponse>(API_ENDPOINTS.WAREHOUSE.LIST, {
            params,
        });
        return data;
    },

    getItems: async (
        warehouseId: string,
        params?: GetWarehouseItemsQueryParams
    ): Promise<GetWarehouseItemsResponse> => {
        const { data } = await apiClient.get<GetWarehouseItemsResponse>(
            API_ENDPOINTS.WAREHOUSE.ITEMS(warehouseId),
            {
                params,
            }
        );
        return data;
    },

    getShrimpSeeds: async (
        warehouseId: string,
        params?: GetWarehousesParams
    ): Promise<GetShrimpSeedsResponse> => {
        const { data } = await apiClient.get<GetShrimpSeedsResponse>(
            API_ENDPOINTS.WAREHOUSE.SHRIMP_SEEDS(warehouseId),
            {
                params,
            }
        );
        return data;
    },
};
