import { useQuery } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { GetExportReceiptItemsParams } from '@/features/material/types/exportReceipt.types';

const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

export const useExportReceiptItems = (receiptId?: string, params?: GetExportReceiptItemsParams) => {
    return useQuery({
        queryKey: materialKeys.exportReceiptItems(receiptId || '', params),
        queryFn: async () => {
            if (!receiptId) return [];
            const { data } = await exportReceiptApi.getItems(receiptId, params);
            return data.items || [];
        },
        enabled: !!receiptId,
        staleTime: STALE_TIME_LONG,
    });
};
