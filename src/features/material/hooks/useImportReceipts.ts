import React from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { importReceiptApi } from '@/features/material/api/importReceiptApi';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { APP_CONFIG } from '@/shared/constants';

import {
    GetImportReceiptsParams,
    GetImportReceiptItemsParams,
    CreateImportReceiptRequest,
    CreateImportReceiptItemCommand,
    UpdateImportReceiptItemCommand,
    ImportReceipt,
} from '@/features/material/types/importReceipt.types';
import { handleError } from '@/shared/utils';

export const importReceiptKeys = {
    all: ['importReceipts'] as const,
    lists: () => [...importReceiptKeys.all, 'list'] as const,
    list: (params: GetImportReceiptsParams) => [...importReceiptKeys.lists(), params] as const,
    detail: (id: string) => [...importReceiptKeys.all, 'detail', id] as const,
    items: (id: string, params?: GetImportReceiptItemsParams) =>
        [...importReceiptKeys.all, 'items', id, params] as const,
};

// ============ Query Hooks ============
export const useImportReceipts = (params?: GetImportReceiptsParams) => {
    const queryParams: GetImportReceiptsParams = {
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
    });
};

export const useInfiniteImportReceipts = (
    params?: Omit<GetImportReceiptsParams, 'Page' | 'PageSize'>
) => {
    const key = importReceiptKeys.list({ ...params });

    const query = useInfiniteQuery({
        queryKey: [...key, 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };

            const response = await importReceiptApi.getAll(currentParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách phiếu nhập');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
    });

    const receipts = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc: ImportReceipt[], page) => {
            return [...acc, ...(page.items || [])];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data: receipts,
        total: query.data?.pages[0]?.totalCount || 0,
    };
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
        onError: error => {
            handleError(error);
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
        onError: error => {
            handleError(error);
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
        onError: error => handleError(error),
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
        onError: error => handleError(error),
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
        onError: error => handleError(error),
    });
};

export const useApproveImportReceipt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; code: string }) => importReceiptApi.approve(id),
        onSuccess: (_, variables) => {
            showSuccessToast(`Đã duyệt phiếu ${variables.code} thành công`);
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
        },
        onError: error => handleError(error),
    });
};

export const useRejectImportReceipt = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; code: string }) => importReceiptApi.reject(id, {}),
        onSuccess: (_, variables) => {
            showSuccessToast(`Đã từ chối phiếu ${variables.code}`);
            queryClient.invalidateQueries({ queryKey: importReceiptKeys.lists() });
        },
        onError: error => handleError(error),
    });
};
