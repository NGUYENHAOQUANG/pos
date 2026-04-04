import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetExportWarehouseParams,
    CreateExportReceiptRequest,
    UpdateExportReceiptRequest,
} from '@/features/material/types/exportReceipt.types';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { handleError } from '@/shared/utils';

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
    });
};

/**
 * Hook to get detail of export receipt
 */
export const useExportReceipt = (id: string) => {
    return useQuery({
        queryKey: materialKeys.detail(id),
        queryFn: async () => {
            const response = await exportReceiptApi.getDetail(id);
            if (response.success) {
                return response.data;
            }
            return null;
        },
        enabled: !!id,
    });
};

/**
 * Hook to create a new export warehouse receipt
 * Returns the created receipt ID in onSuccess data
 */
export const useCreateExportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateExportReceiptRequest) => {
            const response = await exportReceiptApi.create(payload);
            // Return the response data which contains the receipt ID
            return response;
        },
        onSuccess: async response => {
            showSuccessToast('Tạo phiếu xuất kho thành công');

            // Invalidate all related queries with refetchType 'active' for immediate refresh
            await Promise.all([
                // Invalidate all export receipt queries (lists, details, items)
                queryClient.invalidateQueries({
                    queryKey: [...materialKeys.all, 'export-warehouse'],
                    refetchType: 'active',
                }),
                // Update warehouse stock
                queryClient.invalidateQueries({
                    queryKey: ['warehouse-items'],
                    refetchType: 'active',
                }),
            ]);

            // If we got a new receipt ID, also invalidate its specific items query
            if (response?.data?.id) {
                await queryClient.invalidateQueries({
                    queryKey: materialKeys.exportReceiptItems(response.data.id),
                });
            }
        },
        onError: error => {
            handleError(error);
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
            const { receiptId, ...updateData } = payload;
            const response = await exportReceiptApi.update(receiptId, updateData);
            return response;
        },
        onSuccess: async (_data, variables) => {
            showSuccessToast('Cập nhật phiếu xuất kho thành công');

            await Promise.all([
                // Invalidate all export receipt queries
                queryClient.invalidateQueries({
                    queryKey: [...materialKeys.all, 'export-warehouse'],
                    refetchType: 'active',
                }),
                // Invalidate detail
                queryClient.invalidateQueries({
                    queryKey: materialKeys.detail(variables.receiptId),
                }),
                // Update warehouse stock
                queryClient.invalidateQueries({
                    queryKey: ['warehouse-items'],
                    refetchType: 'active',
                }),
            ]);
        },
        onError: error => {
            handleError(error);
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
                queryClient.invalidateQueries({ queryKey: ['warehouse-items'] }),
            ]);
        },
        onError: error => {
            handleError(error);
        },
    });
};
