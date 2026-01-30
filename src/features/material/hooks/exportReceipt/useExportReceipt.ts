import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetExportWarehouseParams,
    CreateExportReceiptRequest,
    UpdateExportReceiptRequest,
} from '@/features/material/types/exportReceipt.types';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

/**
 * Hook to fetch export warehouse receipts
 */
export const useExportReceipts = (params?: GetExportWarehouseParams) => {
    return useQuery({
        queryKey: materialKeys.exportWarehouse(params),
        queryFn: async () => {
            const response = await exportReceiptApi.getAll(params);
            if (response.success && response.data?.items) {
                return response.data;
            }
            return response.data || { items: [], totalCount: 0 };
        },
        staleTime: STALE_TIME_SHORT,
    });
};

/**
 * Hook to get detail of export receipt
 */
export const useExportReceipt = (id: string) => {
    return useQuery({
        queryKey: materialKeys.detail(id), // Using general detail key or should I use export specific? exportWarehouse doesn't have detail key structure in materialKeys.
        // materialKeys.detail is generic. I should probably use a specific key if I want to avoid collisions, but detail(id) is usually global if IDs are unique.
        // Actually materialKeys.detail(id) -> ['materials', 'detail', id].
        // This seems fine if IDs are UUIDs.
        queryFn: async () => {
            const response = await exportReceiptApi.getDetail(id);
            if (response.success) {
                return response.data;
            }
            return null;
        },
        enabled: !!id,
        staleTime: STALE_TIME_SHORT,
    });
};

/**
 * Hook to create a new export warehouse receipt
 */
export const useCreateExportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateExportReceiptRequest) => {
            const response = await exportReceiptApi.create(payload);
            return response;
        },
        onSuccess: async () => {
            showSuccessToast('Tạo phiếu xuất kho thành công');

            // Optimize: Invalidate specific keys instead of 'all'
            // Use prefix matching to hit all paginated lists
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [...materialKeys.all, 'export-warehouse'],
                }),
                queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'warehouse'] }), // Update stock
            ]);
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu xuất kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

/**
 * Hook to update an export receipt
 */
export const useUpdateExportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateExportReceiptRequest) => {
            // Using UpdateRequest
            const { receiptId, ...updateData } = payload;
            const response = await exportReceiptApi.update(receiptId, updateData);
            return response;
        },
        onSuccess: async (_data, variables) => {
            showSuccessToast('Cập nhật phiếu xuất kho thành công');

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [...materialKeys.all, 'export-warehouse'],
                }),
                queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'warehouse'] }), // Update stock
                queryClient.invalidateQueries({
                    queryKey: materialKeys.detail(variables.receiptId),
                }),
            ]);
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Cập nhật phiếu xuất kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

/**
 * Hook to delete an export receipt
 */
export const useDeleteExportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await exportReceiptApi.delete(id);
            if (response && response.success === false) {
                throw new Error(response.message || 'Xóa phiếu thất bại');
            }
            return response;
        },
        onSuccess: async () => {
            showSuccessToast('Xóa phiếu xuất kho thành công');

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [...materialKeys.all, 'export-warehouse'],
                }),
                queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'warehouse'] }),
            ]);
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Xóa phiếu xuất kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
