import { useQuery } from '@tanstack/react-query';
import { importReceiptApi } from '@/features/material/api/importReceiptApi';
import { useImportReceiptStore } from '@/features/material/store/importReceiptStore';

export const importReceiptKeys = {
    all: ['importReceipts'] as const,
    lists: () => [...importReceiptKeys.all, 'list'] as const,
    list: (params: any) => [...importReceiptKeys.lists(), params] as const,
};

const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

export const useImportReceipts = (warehouseParams?: {
    Search?: string | null;
    MaterialName?: string | null;
}) => {
    const storeParams = useImportReceiptStore(state => state.getQueryParams());

    const queryParams = {
        ...storeParams,
        ReceiptCode: warehouseParams?.Search || storeParams.ReceiptCode,
    };

    return useQuery({
        queryKey: importReceiptKeys.list(queryParams),
        queryFn: async () => {
            const response = await importReceiptApi.getAll(queryParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            return response.data || { items: [], totalCount: 0 };
        },
        staleTime: STALE_TIME_SHORT,
    });
};
