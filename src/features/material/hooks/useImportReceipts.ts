import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importReceiptApi } from '@/features/material/api/importReceiptApi';
import { useImportReceiptStore } from '@/features/material/store/importReceiptStore';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

import { GetImportReceiptsParams } from '@/features/material/types/importReceipt.types';

export const importReceiptKeys = {
    all: ['importReceipts'] as const,
    lists: () => [...importReceiptKeys.all, 'list'] as const,
    list: (params: GetImportReceiptsParams) => [...importReceiptKeys.lists(), params] as const,
    items: (id: string, params?: any) => [...importReceiptKeys.all, 'items', id, params] as const,
};

const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

export const useImportReceipts = (params?: GetImportReceiptsParams) => {
    const storeParams = useImportReceiptStore(state => state.getQueryParams());

    const queryParams: GetImportReceiptsParams = {
        ...storeParams,
        ...params,
    };

    return useQuery({
        queryKey: importReceiptKeys.list(queryParams),
        queryFn: async () => {
            const response = await importReceiptApi.getAll(queryParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            return response.data;
        },
        staleTime: STALE_TIME_SHORT,
    });
};

export const useImportReceiptItems = (id: string, params?: any) => {
    return useQuery({
        queryKey: importReceiptKeys.items(id, params),
        queryFn: async () => {
            const response = await importReceiptApi.getItems(id, params);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateImportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: importReceiptApi.create,
        onSuccess: () => {
            showSuccessToast('Tạo phiếu nhập kho thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
        },
        onError: (error: any) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu nhập kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};
