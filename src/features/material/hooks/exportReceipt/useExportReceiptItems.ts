import { useQuery } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { ExportReceiptItem } from '@/features/material/types/exportReceipt.types';

export const useExportReceiptItems = (receiptId?: string) => {
    return useQuery({
        queryKey: materialKeys.exportReceiptItems(receiptId || ''),
        queryFn: async () => {
            if (!receiptId) return [];
            const response = await exportReceiptApi.getItems(receiptId);
            if (response.success && response.data) {
                // Handle potential different response structures
                const items = Array.isArray(response.data)
                    ? response.data
                    : response.data.items || [];

                return items as ExportReceiptItem[];
            }
            return [];
        },
        enabled: !!receiptId,
        staleTime: 5 * 60 * 1000,
    });
};
