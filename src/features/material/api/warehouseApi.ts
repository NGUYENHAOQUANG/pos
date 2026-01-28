import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    GetWarehouseItemsResponse,
    GetWarehousesParams,
    IWarehouse,
} from '@/features/material/types/material.types';
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
        params?: GetWarehousesParams
    ): Promise<GetWarehouseItemsResponse> => {
        const { data } = await apiClient.get<GetWarehouseItemsResponse>(
            API_ENDPOINTS.WAREHOUSE.ITEMS(warehouseId),
            {
                params,
            }
        );
        return data;
    },
};
