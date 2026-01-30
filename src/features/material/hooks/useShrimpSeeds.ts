import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { GetWarehousesParams } from '@/features/material/types/material.types';

export const useShrimpSeeds = (warehouseId?: string, params?: GetWarehousesParams) => {
    return useQuery({
        queryKey: ['shrimp-seeds', warehouseId, params],
        queryFn: async () => {
            if (!warehouseId) return [];
            const response = await warehouseApi.getShrimpSeeds(warehouseId, params);
            return response?.data?.items || [];
        },
        enabled: !!warehouseId,
    });
};
