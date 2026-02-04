import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { normalizeApiError } from '@/core/api/errorHandler';
import { handleError } from '@/shared/utils/errorHandler';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import {
    GetInventoryChecksParams,
    GetInventoryCheckItemsParams,
    UpdateInventoryCheckRequest,
    CreateInventoryCheckRequest,
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
            showSuccessToast('Xóa phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
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
            console.log('Payload:', JSON.stringify(payload, null, 2));
            const response = await inventoryApi.create(payload);
            console.log('Response:', JSON.stringify(response, null, 2));
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Tạo phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
            });
        },
        onError: (error: unknown) => {
            console.log('Error:', JSON.stringify(error, null, 2));
            handleError(normalizeApiError(error));
        },
    });
};

export const useUpdateInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: { id: string } & UpdateInventoryCheckRequest) => {
            const response = await inventoryApi.update(id, payload);
            console.log('Edit Response:', JSON.stringify(response, null, 2));
            if (!response.success) {
                throw new Error(response.message || 'Cập nhật phiếu thất bại');
            }
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Cập nhật phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
            });
        },
        onError: (error: unknown) => {
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
