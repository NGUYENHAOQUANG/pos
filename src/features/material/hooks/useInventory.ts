import React from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { handleError } from '@/shared/utils/errorHandler';
import { inventoryApi } from '@/features/material/api/inventoryApi';
import {
    GetInventoryChecksParams,
    GetInventoryCheckItemsParams,
    UpdateInventoryCheckRequest,
    CreateInventoryCheckRequest,
    IInventoryCheck,
} from '@/features/material/types/inventoryCheck.types';
import { APP_CONFIG } from '@/shared/constants';

export const useInventoryTickets = (params?: GetInventoryChecksParams) => {
    return useQuery({
        queryKey: materialKeys.inventory(params),
        queryFn: async () => {
            const response = await inventoryApi.getList(params);

            if (response.success && response.data?.items) {
                return response.data.items;
            }

            return [];
        },
    });
};

/**
 * Hook to fetch inventory tickets with infinite scroll
 */
export const useInfiniteInventoryTickets = (
    params?: Omit<GetInventoryChecksParams, 'Page' | 'PageSize'>,
    options?: { enabled?: boolean }
) => {
    const query = useInfiniteQuery({
        queryKey: [...materialKeys.inventory(params), 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };
            const response = await inventoryApi.getList(currentParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách phiếu kiểm kho');
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
        return query.data.pages.reduce((acc: IInventoryCheck[], page) => {
            return [...acc, ...(page.items || [])];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data: items,
        total: query.data?.pages[0]?.totalCount || 0,
    };
};

export const useDeleteInventoryTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await inventoryApi.delete(id);
            if (!response.success) {
                throw new Error(response.message || 'Xóa phiếu thất bại');
            }
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Xóa phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
            });
        },
        onError: error => handleError(error),
    });
};

export const useCreateInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateInventoryCheckRequest) => {
            const response = await inventoryApi.create(payload);
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Tạo phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
            });
        },
        onError: error => handleError(error),
    });
};

export const useUpdateInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }: { id: string } & UpdateInventoryCheckRequest) => {
            const response = await inventoryApi.update(id, payload);
            if (!response.success) {
                throw new Error(response.message || 'Cập nhật phiếu thất bại');
            }
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Cập nhật phiếu thành công');
            queryClient.invalidateQueries({
                queryKey: ['materials', 'inventory'],
                exact: false,
            });
        },
        onError: error => {
            handleError(error);
        },
    });
};

export const useInventoryDetail = (inventoryId?: string) => {
    return useQuery({
        queryKey: materialKeys.inventoryDetail(inventoryId || ''),
        queryFn: async () => {
            if (!inventoryId) return null;
            const res = await inventoryApi.getDetail(inventoryId);
            if (res.success) {
                return res.data;
            }
            throw new Error(res.message || 'Failed to fetch inventory detail');
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};

export const useInventoryItems = (inventoryId?: string, params?: GetInventoryCheckItemsParams) => {
    return useQuery({
        queryKey: materialKeys.inventoryItems(inventoryId || '', params),
        queryFn: async () => {
            if (!inventoryId) return [];

            const response = await inventoryApi.getItems(inventoryId, params);

            if (response.success && response.data?.items) {
                return response.data.items;
            }
            return [];
        },
        enabled: !!inventoryId,
        refetchOnWindowFocus: false,
    });
};

export const useApproveInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; code: string }) => inventoryApi.approve(id),
        onSuccess: (_, variables) => {
            showSuccessToast(`Đã duyệt phiếu ${variables.code} thành công`);
            queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'inventory'] });
        },
        onError: error => handleError(error),
    });
};

export const useRejectInventoryCheck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; code: string }) => inventoryApi.reject(id, {}),
        onSuccess: (_, variables) => {
            showSuccessToast(`Đã từ chối phiếu ${variables.code}`);
            queryClient.invalidateQueries({ queryKey: [...materialKeys.all, 'inventory'] });
        },
        onError: error => handleError(error),
    });
};
