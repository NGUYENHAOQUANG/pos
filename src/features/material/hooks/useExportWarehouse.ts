import React from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
    GetExportWarehouseParams,
    CreateExportReceiptRequest,
    ExportReceipt,
} from '@/features/material/types/exportReceipt.types';
import { exportReceiptApi } from '@/features/material/api/exportReceiptApi';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { APP_CONFIG } from '@/shared/constants';
import { handleError } from '@/shared/utils';

/**
 * Hook to fetch export warehouse receipts
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
    });
};

/**
 * Hook to fetch export warehouse receipts with infinite scroll
 */
export const useInfiniteExportWarehouse = (
    params?: Omit<GetExportWarehouseParams, 'Page' | 'PageSize'>,
    options?: { enabled?: boolean }
) => {
    const query = useInfiniteQuery({
        queryKey: [...materialKeys.exportWarehouse(params), 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };
            const response = await exportReceiptApi.getAll(currentParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách phiếu xuất kho');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        enabled: options?.enabled,
    });

    const items = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc: ExportReceipt[], page) => {
            return [...acc, ...(page.items || [])];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data: items,
        total: query.data?.pages[0]?.totalCount || 0,
    };
};

/**
 * Hook to create a new export warehouse receipt
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
        onError: error => {
            handleError(error);
        },
    });
};
