import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { GetSuppliersParams, GetSuppliersResponse } from '@/features/material/types/supplier.types';

export const supplierApi = {
    getAll: async (params?: GetSuppliersParams): Promise<GetSuppliersResponse> => {
        const { data } = await apiClient.get<GetSuppliersResponse>(API_ENDPOINTS.SUPPLIER.LIST, {
            params,
        });
        return data;
    },
};
