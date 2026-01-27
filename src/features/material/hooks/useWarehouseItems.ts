import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { GetWarehousesParams } from '@/features/material/types/material.types';

export const useWarehouseItems = (
    warehouseId: string | undefined,
    params?: GetWarehousesParams,
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
