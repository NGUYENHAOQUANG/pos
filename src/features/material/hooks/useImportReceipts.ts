import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importReceiptApi } from '@/features/material/api/importReceiptApi';
import { useImportReceiptStore } from '@/features/material/store/importReceiptStore';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

import {
    GetImportReceiptsParams,
    GetImportReceiptItemsParams,
    CreateImportReceiptRequest,
    CreateImportReceiptItemCommand,
    UpdateImportReceiptItemCommand,
} from '@/features/material/types/importReceipt.types';

export const importReceiptKeys = {
    all: ['importReceipts'] as const,
    lists: () => [...importReceiptKeys.all, 'list'] as const,
    list: (params: GetImportReceiptsParams) => [...importReceiptKeys.lists(), params] as const,
    detail: (id: string) => [...importReceiptKeys.all, 'detail', id] as const,
    items: (id: string, params?: GetImportReceiptItemsParams) =>
        [...importReceiptKeys.all, 'items', id, params] as const,
};

const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

// ============ Query Hooks ============
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

export const useImportReceiptDetail = (id: string) => {
    return useQuery({
        queryKey: importReceiptKeys.detail(id),
        queryFn: async () => {
            const response = await importReceiptApi.getDetail(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useImportReceiptItems = (id: string, params?: GetImportReceiptItemsParams) => {
    return useQuery({
        queryKey: importReceiptKeys.items(id, params),
        queryFn: async () => {
            const response = await importReceiptApi.getItems(id, params);
            return response.data;
        },
        enabled: !!id,
    });
};

// ============ Receipt Mutation Hooks ============
export const useCreateImportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: importReceiptApi.create,
        onSuccess: () => {
            showSuccessToast('Tạo phiếu nhập kho thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
        },
        onError: (error: Error) => {
            const errorMessage = getErrorMessage(error, 'Tạo phiếu nhập kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

export const useUpdateImportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateImportReceiptRequest> }) =>
            importReceiptApi.update(id, data),
        onSuccess: (_, { id }) => {
            showSuccessToast('Cập nhật phiếu nhập kho thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.items(id) });
        },
        onError: (error: Error) => {
            const errorMessage = getErrorMessage(error, 'Cập nhật phiếu nhập kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

export const useDeleteImportReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => importReceiptApi.delete(id),
        onSuccess: () => {
            showSuccessToast('Xóa phiếu nhập kho thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
        },
        onError: (error: Error) => {
            const errorMessage = getErrorMessage(error, 'Xóa phiếu nhập kho thất bại');
            showErrorToast(errorMessage);
        },
    });
};

// ============ Items Mutation Hooks ============
export const useAddImportReceiptItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, command }: { id: string; command: CreateImportReceiptItemCommand }) =>
            importReceiptApi.addItems(id, command),
        onSuccess: (_, { id }) => {
            showSuccessToast('Thêm vật tư thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.items(id) });
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.detail(id) });
        },
        onError: (error: Error) => {
            const errorMessage = getErrorMessage(error, 'Thêm vật tư thất bại');
            showErrorToast(errorMessage);
        },
    });
};

export const useUpdateImportReceiptItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, command }: { id: string; command: UpdateImportReceiptItemCommand }) =>
            importReceiptApi.updateItems(id, command),
        onSuccess: (_, { id }) => {
            showSuccessToast('Cập nhật vật tư thành công');
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.items(id) });
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.detail(id) });
        },
        onError: (error: Error) => {
            const errorMessage = getErrorMessage(error, 'Cập nhật vật tư thất bại');
            showErrorToast(errorMessage);
        },
    });
};
