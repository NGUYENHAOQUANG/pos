import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { GetExportReceiptItemsParams } from '@/features/material/types/exportReceipt.types';
import { handleError } from '@/shared/utils/errorHandler';

const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

export const useExportReceiptItems = (receiptId?: string, params?: GetExportReceiptItemsParams) => {
    return useQuery({
        queryKey: materialKeys.exportReceiptItems(receiptId || '', params),
        queryFn: async () => {
            if (!receiptId) return [];
            const { data: responseData } = await exportReceiptApi.getItems(receiptId);
            const items = responseData.items || [];

            return items.sort((a, b) => {
                if (typeof a.no === 'number' && typeof b.no === 'number') {
                    return a.no - b.no;
                }

                if (a.createdAt && b.createdAt) {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                return (a.id || '').localeCompare(b.id || '');
            });
        },
        enabled: !!receiptId,
        staleTime: STALE_TIME_LONG,
    });
};

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
            await queryClient.invalidateQueries({
                queryKey: materialKeys.exportReceiptItems(variables.receiptId),
            });
            await queryClient.invalidateQueries({
                queryKey: materialKeys.detail(variables.receiptId),
            });
        },
        onError: handleError,
    });
};
