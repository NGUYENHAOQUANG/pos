import { useQuery } from '@tanstack/react-query';
import { supplierApi } from '@/features/material/api/supplierApi';
import { GetSuppliersParams } from '@/features/material/types/supplier.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';

export const useSuppliers = (params?: GetSuppliersParams) => {
    return useQuery({
        queryKey: [...materialKeys.all, 'suppliers', params],
        queryFn: async () => {
            const response = await supplierApi.getAll(params);
            return response?.data?.items || [];
        },
    });
};
