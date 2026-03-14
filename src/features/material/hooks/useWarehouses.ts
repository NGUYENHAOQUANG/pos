import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/features/material/api/warehouseApi';
import {
    GetWarehousesParams,
    GetWarehouseItemsQueryParams,
    IWarehouseItem,
} from '@/features/material/types/warehouse.types';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { APP_CONFIG } from '@/shared/constants';

export const useWarehouses = (params?: GetWarehousesParams) => {
    return useQuery({
        queryKey: materialKeys.warehouses(params),
        queryFn: async () => {
            const response = await warehouseApi.getAll(params);
            return response?.data?.items || [];
        },
    });
};

export const useCurrentWarehouse = (zoneId?: string) => {
    const { data: warehouses, ...rest } = useWarehouses({
        PageSize: 1,
        ZoneId: zoneId || undefined,
    });
    const warehouse = warehouses?.[0];

    return {
        ...rest,
        warehouse,
        warehouseId: warehouse?.id,
    };
};

export const fetchCurrentWarehouseId = async (zoneId: string): Promise<string | null> => {
    try {
        const response = await warehouseApi.getAll({ PageSize: 1, ZoneId: zoneId });
        return response?.data?.items?.[0]?.id ?? null;
    } catch (error) {
        console.error('Failed to fetch warehouse for zone:', error);
        return null;
    }
};

export const useWarehouseItems = (
    warehouseId: string | undefined,
    params?: GetWarehouseItemsQueryParams,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['warehouse-items', warehouseId, params],
        queryFn: async () => {
            if (!warehouseId) {
                return { items: [], total: 0, page: 1, size: 10, totalPages: 0 };
            }
            const response = await warehouseApi.getItems(warehouseId, params);
            return response.data;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!warehouseId,
    });
};

export const useInfiniteWarehouseItems = (
    warehouseId: string | undefined,
    params?: Omit<GetWarehouseItemsQueryParams, 'Page' | 'PageSize'>,
    options?: { enabled?: boolean }
) => {
    const query = useInfiniteQuery({
        queryKey: ['warehouse-items', warehouseId, params, 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            if (!warehouseId) {
                throw new Error('Warehouse ID is required');
            }
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };
            const response = await warehouseApi.getItems(warehouseId, currentParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách vật tư kho');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        enabled: options?.enabled !== undefined ? options.enabled : !!warehouseId,
    });

    const items = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc: IWarehouseItem[], page) => {
            return [...acc, ...(page.items || [])];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data: items,
        total: query.data?.pages[0]?.totalCount || 0,
    };
};
