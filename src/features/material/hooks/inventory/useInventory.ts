import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { normalizeApiError } from '@/core/api/errorHandler';
import { handleError } from '@/shared/utils/errorHandler';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import {
    CreateInventoryCheckRequest,
    GetInventoryChecksParams,
    GetInventoryCheckItemsParams,
} from '@/features/material/types/inventoryCheck.types';

const STALE_TIME_SHORT = 2 * 60 * 1000;

export const useInventoryTickets = (params?: GetInventoryChecksParams) => {
    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            const response = await inventoryApi.getList(params);

            if (response.success && response.data?.items) {
                return response.data.items;
            }

            return [];
        },
        staleTime: STALE_TIME_SHORT,
    });
};

/**
 * Hook to delete an inventory ticket
 */
export const useDeleteInventoryTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await inventoryApi.delete(id);
            if (!response.success) {
                throw new Error(response.message || 'Xóa phiếu thất bại');
            }
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Xóa phiếu điều chỉnh tồn kho thành công');
            queryClient.invalidateQueries({
                queryKey: [...materialKeys.all, 'inventory'],
            });
        },
        onError: (error: unknown) => {
            handleError(normalizeApiError(error));
        },
    });
};

export const useCreateInventoryCheck = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateInventoryCheckRequest) => {
            const { data } = await inventoryApi.create(payload);
            return data;
        },
        onSuccess: () => {
            showSuccessToast('Cập nhật phiếu điều chỉnh tồn kho thành công');
            // Invalidate all inventory-related queries
            queryClient.invalidateQueries({
                queryKey: materialKeys.all,
                refetchType: 'all',
            });
        },
        onError: (error: any) => {
            handleError(normalizeApiError(error));
        },
    });
};

export const useInventoryDetail = (inventoryId?: string) => {
    return useQuery({
        queryKey: materialKeys.inventoryDetail(inventoryId || ''),
        queryFn: async () => {
            if (!inventoryId) return null;
            const res = await inventoryApi.getDetail(inventoryId);
            if (res.success) {
                return res.data;
            }
            throw new Error(res.message || 'Failed to fetch inventory detail');
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};

export const useInventoryItems = (inventoryId?: string, params?: GetInventoryCheckItemsParams) => {
    return useQuery({
        queryKey: materialKeys.inventoryItems(inventoryId || '', params),
        queryFn: async () => {
            if (!inventoryId) return [];

            const response = await inventoryApi.getItems(inventoryId, params);

            if (response.success && response.data?.items) {
                return response.data.items;
            }
            return [];
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};
