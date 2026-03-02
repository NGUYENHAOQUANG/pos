import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { pondApi } from '@/features/farm/api/pondApi';
import { farmKeys } from './farmKeys';
import { APP_CONFIG } from '@/shared/constants';
import { PondData, PondStatus } from '@/features/farm/types/pond.types';

export const usePondMasterData = () => {
    const query = useQuery({
        queryKey: farmKeys.masterData.types(),
        queryFn: async () => {
            const types = await pondApi.getPondTypes();
            let operations: any[] = [];
            try {
                operations = await pondApi.getPondTypeOperations();
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
