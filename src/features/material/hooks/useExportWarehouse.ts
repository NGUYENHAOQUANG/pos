import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetExportWarehouseParams,
    ExportReceipt,
} from '@/features/material/types/exportReceipt.types';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for staleTime
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes
/**
 * Hook to fetch export warehouse receipts (Mock Data)
 */
export const useExportWarehouse = (params?: GetExportWarehouseParams) => {
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
 * Hook to create a new export warehouse receipt (Mock Data)
 */
export const useAddExportWarehouseReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receipt: Omit<ExportReceipt, 'id'>) => {
            // Simulate API delay
            await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
            // In a real app, the server returns the new created object
            const newReceipt: ExportReceipt = {
                ...receipt,
                id: Date.now().toString(),
            };
            return newReceipt;
        },
        onSuccess: newReceipt => {
            showSuccessToast('Tạo phiếu xuất kho thành công');
            // Optimistically update the list in mock data scenario
            // In real app, we would invalidate queries, but since we use mock data,
            // subsequent fetches might return the original mock list unless we modify it in memory or API.
            // For now, we update the cache manually to simulate persistence in SPA session.
            queryClient.setQueryData(
                materialKeys.exportWarehouse(),
                (oldData: ExportReceipt[] | undefined) => {
                    return oldData ? [newReceipt, ...oldData] : [newReceipt];
                }
            );
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu xuất kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
