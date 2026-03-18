/**
 * @file useHarvestStatsTable.ts
 * @description Hooks for harvest stats table (normal query + infinite scroll)
 */
import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { HarvestStatsTableParams, HarvestRecord } from '../types/harvest-stats-table';
import { APP_CONFIG } from '@/shared/constants/config';

// Standard query hook (kept for backward compatibility)
export const useHarvestStatsTable = (params: HarvestStatsTableParams & { enabled?: boolean }) => {
    const { enabled = true, ...apiParams } = params;

    return useQuery({
        queryKey: ['report', 'harvest-stats-table', apiParams],
        queryFn: () => {
            if (!apiParams.ZoneId) throw new Error('ZoneId is required');
            return reportApi.getHarvestStatsTable(apiParams);
        },
        enabled: enabled && !!apiParams.ZoneId,
    });
};

// Infinite scroll hook
interface UseInfiniteHarvestStatsParams {
    ZoneId: string;
    Id?: string;
    CycleId?: string;
    enabled?: boolean;
}

/** Extended HarvestRecord with formatted date for display */
export interface HarvestRecordWithNames extends HarvestRecord {
    /** Formatted harvest date as dd/MM/yyyy */
    formattedDate: string;
}

const formatHarvestDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const useInfiniteHarvestStatsTable = ({
    ZoneId,
    Id,
    CycleId,
    enabled = true,
}: UseInfiniteHarvestStatsParams) => {
    const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;

    const query = useInfiniteQuery({
        queryKey: ['report', 'harvest-stats-table', 'infinite', ZoneId, Id, CycleId],
        queryFn: async ({ pageParam = 1 }) => {
            if (!ZoneId) throw new Error('ZoneId is required');
            return reportApi.getHarvestStatsTable({
                ZoneId,
                Id,
                CycleId,
                Page: pageParam,
                PageSize: pageSize,
            });
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.data?.hasNextPage) return undefined;
            return lastPage.data.pageNumber + 1;
        },
        enabled: enabled && !!ZoneId,
    });

    // Flatten pages into a single array with formatted date
    const dataList: HarvestRecordWithNames[] = React.useMemo(() => {
        if (!query.data) return [];

        return query.data.pages.reduce<HarvestRecordWithNames[]>((acc, page) => {
            const items = page.data?.items || [];
            const mapped = items.map((record: HarvestRecord) => ({
                ...record,
                formattedDate: formatHarvestDate(record.harvestDate),
            }));
            acc.push(...mapped);
            return acc;
        }, []);
    }, [query.data]);

    return {
        dataList,
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
        fetchNextPage: query.fetchNextPage,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
    };
};
