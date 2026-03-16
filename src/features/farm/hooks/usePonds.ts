import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { pondApi } from '@/features/farm/api/pondApi';
import { pondOperationApi } from '@/features/farm/api/pondOperationApi';
import { farmKeys } from './farmKeys';
import { APP_CONFIG } from '@/shared/constants';
import { PondData, PondStatus } from '@/features/farm/types/pond.types';
import { PondTypeOperation } from '@/features/farm/types/farm.types';

export const usePondMasterData = () => {
    const query = useQuery({
        queryKey: farmKeys.masterData.types(),
        queryFn: async () => {
            const types = await pondApi.getPondTypes();
            let operations: PondTypeOperation[] = [];
            try {
                const res = await pondOperationApi.getPondOperations();
                operations = res?.data || [];
            } catch {}

            return { types, operations };
        },
        staleTime: 60 * 60 * 1000,
    });

    return query;
};

export const usePondsByZone = (zoneId: string | null, status?: PondStatus | null) => {
    const key = farmKeys.ponds.byZone(zoneId || 'all');
    const statusKey = status || 'all';

    const query = useInfiniteQuery({
        queryKey: [...key, statusKey, 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            if (!zoneId) {
                return {
                    items: [],
                    pageNumber: 1,
                    totalPages: 1,
                    totalCount: 0,
                    pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
                    hasPreviousPage: false,
                    hasNextPage: false,
                };
            }

            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                PageSize: pageSize,
                Page: pageParam,
                ...(status ? { Status: status } : {}),
            };

            const response = await pondApi.getPondsByZone(zoneId, currentParams);

            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách ao');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        enabled: !!zoneId,
        staleTime: 5 * 60 * 1000, // 5 mins
    });

    const ponds = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc: PondData[], page) => {
            return [...acc, ...(page.items || [])];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data: ponds,
        rawQueryData: query.data,
        total: query.data?.pages[0]?.totalCount || 0,
        isLoading: query.isLoading,
    };
};

export const usePondDetail = (zoneId: string, pondId: string) => {
    const enabled = !!zoneId && !!pondId;

    const query = useQuery({
        queryKey: farmKeys.ponds.detail(zoneId, pondId),
        queryFn: async () => {
            const response = await pondApi.getPondById(zoneId, pondId);
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Không thể tải thông tin ao');
            }
            return response.data as PondData;
        },
        enabled,
    });

    return query;
};

export const useAllPondsByZone = (zoneId: string) => {
    return useQuery({
        queryKey: [...farmKeys.ponds.byZone(zoneId || 'all'), 'all-pages'],
        queryFn: async () => {
            if (!zoneId) return [];

            const pageSize = APP_CONFIG.MAX_PAGE_SIZE;

            const firstResponse = await pondApi.getPondsByZone(zoneId, {
                PageSize: pageSize,
                Page: 1,
            });
            const firstPage = firstResponse.data;
            if (!firstPage?.items) return [];

            const allItems: PondData[] = [...firstPage.items];
            const totalPages = firstPage.totalPages || 1;

            if (totalPages > 1) {
                const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
                const responses = await Promise.all(
                    remainingPages.map(page =>
                        pondApi.getPondsByZone(zoneId, {
                            PageSize: pageSize,
                            Page: page,
                        })
                    )
                );
                responses.forEach(res => {
                    if (res.data?.items) {
                        allItems.push(...res.data.items);
                    }
                });
            }

            return allItems;
        },
        enabled: !!zoneId,
        staleTime: 10 * 60 * 1000,
    });
};
