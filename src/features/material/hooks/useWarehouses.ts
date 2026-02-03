import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import {
    GetWarehousesParams,
    GetWarehouseItemsQueryParams,
} from '@/features/material/types/warehouse.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';

export const useWarehouses = (params?: GetWarehousesParams) => {
    return useQuery({
        queryKey: materialKeys.warehouses(params),
        queryFn: async () => {
            const response = await warehouseApi.getAll(params);
            return response?.data?.items || [];
        },
    });
};

export const useWarehouseItems = (
    warehouseId: string | undefined,
    params?: GetWarehouseItemsQueryParams,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['warehouse-items', warehouseId, params],
        queryFn: async () => {
            if (!warehouseId) {
                return { items: [], total: 0, page: 1, size: 10, totalPages: 0 };
            }
            const response = await warehouseApi.getItems(warehouseId, params);
            return response.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!warehouseId,
    });
};
