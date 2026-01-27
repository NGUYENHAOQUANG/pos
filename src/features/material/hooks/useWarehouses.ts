import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import { GetWarehousesParams } from '@/features/material/types/material.types';
import { materialKeys } from './materialKeys';

export const useWarehouses = (params?: GetWarehousesParams) => {
    return useQuery({
        queryKey: materialKeys.warehouses(params),
        queryFn: () => warehouseApi.getAll(params),
    });
};
