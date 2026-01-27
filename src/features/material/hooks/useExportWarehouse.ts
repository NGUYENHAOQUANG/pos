import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetExportWarehouseParams,
    CreateExportReceiptRequest,
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
        mutationFn: async (payload: CreateExportReceiptRequest) => {
            const response = await exportReceiptApi.create(payload);
            return response;
        },
        onSuccess: () => {
            showSuccessToast('Tạo phiếu xuất kho thành công');
            // Invalidate the list query to refetch data
            queryClient.invalidateQueries({
                queryKey: materialKeys.exportWarehouse(),
            });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu xuất kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
