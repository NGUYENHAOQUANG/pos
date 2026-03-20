import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supplierApi } from '@/features/material/api/supplierApi';
import { GetSuppliersParams, ISupplier } from '@/features/material/types/supplier.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { APP_CONFIG } from '@/shared/constants';

const STALE_TIME_SHORT = 2 * 60 * 1000;

export const useSuppliers = (params?: GetSuppliersParams) => {
    return useQuery({
        queryKey: [...materialKeys.all, 'suppliers', params],
        queryFn: async () => {
            const response = await supplierApi.getAll(params);
            return response?.data?.items || [];
        },
    });
};

/**
 * Hook to fetch suppliers with infinite scroll pagination.
 */
export const useInfiniteSuppliers = (
    params?: Omit<GetSuppliersParams, 'Page' | 'PageSize'>,
    options?: { enabled?: boolean }
) => {
    const query = useInfiniteQuery({
        queryKey: [...materialKeys.all, 'suppliers', params, 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams: GetSuppliersParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };

            const response = await supplierApi.getAll(currentParams);
            if (response?.data) {
                return response.data;
            }
            throw new Error('Không thể tải danh sách nhà cung cấp');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        staleTime: STALE_TIME_SHORT,
        enabled: options?.enabled,
    });

    // Flatten & deduplicate
    const suppliers = React.useMemo(() => {
        if (!query.data) return [] as ISupplier[];
        const seen = new Map<string, ISupplier>();
        for (const page of query.data.pages) {
            const items = (page.items || []) as ISupplier[];
            for (const item of items) {
                seen.set(item.id, item);
            }
        }
        return Array.from(seen.values());
    }, [query.data]);

    return {
        ...query,
        data: suppliers,
        total: query.data?.pages[0]?.totalCount || 0,
    };
};
