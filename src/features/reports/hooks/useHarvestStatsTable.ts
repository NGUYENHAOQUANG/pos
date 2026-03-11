/**
 * @file useHarvestStatsTable.ts
 * @description Hooks for harvest stats table (normal query + infinite scroll)
 */
import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { HarvestStatsTableParams, HarvestRecord } from '../types/harvest-stats-table';
import { APP_CONFIG } from '@/shared/constants/config';
import { PondData } from '@/features/farm/types/pond.types';
import { CycleData } from '@/features/farm/types/cycle.types';

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
    ponds?: PondData[];
    cycles?: CycleData[];
    enabled?: boolean;
}

/** Extended HarvestRecord with resolved pond/cycle names */
export interface HarvestRecordWithNames extends HarvestRecord {
    pondName: string;
    cycleName?: string;
}

export const useInfiniteHarvestStatsTable = ({
    ZoneId,
    Id,
    CycleId,
    ponds,
    cycles,
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
                PageNumber: pageParam,
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

    // Create Maps for O(1) lookup
    const pondMap = React.useMemo(() => new Map(ponds?.map(p => [p.code, p.name]) || []), [ponds]);

    const pondIdMap = React.useMemo(() => new Map(ponds?.map(p => [p.id, p.name]) || []), [ponds]);

    const cycleCodeMap = React.useMemo(
        () => new Map(cycles?.map(c => [c.code, c.name]) || []),
        [cycles]
    );

    const cycleIdMap = React.useMemo(
        () => new Map(cycles?.map(c => [c.id, c.name]) || []),
        [cycles]
    );

    // Flatten pages into a single array with resolved names
    const dataList: HarvestRecordWithNames[] = React.useMemo(() => {
        if (!query.data) return [];

        const getPondName = (code: string | null): string => {
            if (!code) return 'N/A';
            return pondMap.get(code) || pondIdMap.get(code) || code;
        };

        const getCycleName = (code: string | null): string | undefined => {
            if (!code) return undefined;
            return cycleCodeMap.get(code) || cycleIdMap.get(code) || undefined;
        };

        return query.data.pages.reduce<HarvestRecordWithNames[]>((acc, page) => {
            const items = page.data?.items || [];
            const mapped = items.map((record: HarvestRecord) => ({
                ...record,
                pondName: getPondName(record.pondCode),
                cycleName: getCycleName(record.cycleCode),
            }));
            acc.push(...mapped);
            return acc;
        }, []);
    }, [query.data, pondMap, pondIdMap, cycleCodeMap, cycleIdMap]);

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
