import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportReceiptKeys } from '@/features/material/hooks/exportReceipt/useExportReceipt';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { GetExportReceiptItemsParams } from '@/features/material/types/exportReceipt.types';

const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

export const useExportReceiptItems = (
    receiptId?: string,
    _params?: GetExportReceiptItemsParams
) => {
    return useQuery({
        // Use exportReceiptKeys.items for consistency with invalidation in useUpdateExportReceipt
        queryKey: exportReceiptKeys.items(receiptId || ''),
        queryFn: async () => {
            if (!receiptId) return [];
            const { data } = await exportReceiptApi.getItems(receiptId);
            const items = data.items || [];

            // Sort items by 'no' (order number) first, then createdAt, then ID
            return items.sort((a, b) => {
                // Priority 1: Sort by manual order number 'no' if available
                if (typeof a.no === 'number' && typeof b.no === 'number') {
                    return a.no - b.no;
                }

                // Priority 2: Sort by CreatedAt (FIFO)
                if (a.createdAt && b.createdAt) {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }

                // Priority 3: Fallback to ID
                return (a.id || '').localeCompare(b.id || '');
            });
        },
        enabled: !!receiptId,
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to delete an export receipt item
 */
export const useDeleteExportReceiptItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ receiptId, itemId }: { receiptId: string; itemId: string }) => {
            const response = await exportReceiptApi.deleteItem(receiptId, itemId);
            if (response && response.success === false) {
                throw new Error(response.message || 'Xóa vật tư thất bại');
            }
            return response;
        },
        onSuccess: async (_data, variables) => {
            // Invalidate the specific receipt items
            await queryClient.invalidateQueries({
                queryKey: exportReceiptKeys.items(variables.receiptId),
            });
            // Also invalidate detail to update total amount/count if needed
            await queryClient.invalidateQueries({
                queryKey: exportReceiptKeys.detail(variables.receiptId),
            });
        },
        onError: (_error: unknown) => {
            // Error handling is done in the component for optimistic updates
        },
    });
};
