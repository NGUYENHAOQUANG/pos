import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { seasonApi } from '@/features/menu/api/seasonApi';
import { SeasonData, SeasonStatus, getSeasonStatusName } from '@/features/farm/types/farm.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { useZones } from '@/features/farm/hooks/useZones';
import { NormalizedError } from '@/core/api/errorHandler';
import { IPaginate } from '@/shared/types/common.types';
import { APP_CONFIG } from '@/shared/constants';

/** Map raw API item to domain SeasonData */
const mapSeasonItem = (item: SeasonData, zoneCode?: string): SeasonData => ({
    ...item,
    name: item.seasonName || item.name,
    farmCode: zoneCode || item.seasonCode || '',
    zoneId: String(item.zoneId || ''),
    status: item.status as SeasonStatus,
    statusName: getSeasonStatusName(item.status),
    id: item.id.toString(),
});

export const useSeasonsByZone = (zoneId: number | string | null | undefined, zoneCode?: string) => {
    const zoneIdStr = zoneId ? String(zoneId) : '';
    return useQuery({
        queryKey: farmKeys.seasons(zoneIdStr),
        queryFn: async () => {
            const response = await seasonApi.getSeasons(zoneIdStr);
            return response.items.map(item => mapSeasonItem(item, zoneCode));
        },
        enabled: !!zoneIdStr,
    });
};

/** Hook to fetch seasons for a single zone with infinite scroll pagination */
export const useSeasons = (zoneId?: string, zoneCode?: string) => {
    // 1. Fetch Zones
    const {
        data: zones = [],
        isLoading: isLoadingZones,
        isRefetching: isRefetchingZones,
        isError: isErrorZones,
    } = useZones();

    // Determine the active zone
    const activeZoneId = zoneId || (zones.length > 0 ? String(zones[0].id) : '');
    const activeZoneCode = zoneCode || zones.find(z => String(z.id) === activeZoneId)?.code;

    // 2. Use infinite query to fetch seasons for the selected zone
    const infiniteQuery = useInfiniteQuery<IPaginate<SeasonData>>({
        queryKey: [...farmKeys.seasons(activeZoneId), 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await seasonApi.getSeasons(activeZoneId, {
                Page: pageParam as number,
                PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
            });

            return {
                ...result,
                items: result.items.map((item: SeasonData) => mapSeasonItem(item, activeZoneCode)),
            };
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        enabled: !!activeZoneId,
        staleTime: 1000 * 60 * 5,
    });

    // 3. Flatten all pages into a single array
    const seasons = useMemo(() => {
        if (!infiniteQuery.data) return [];
        return infiniteQuery.data.pages.reduce<SeasonData[]>((acc, page) => {
            return [...acc, ...page.items];
        }, []);
    }, [infiniteQuery.data]);

    // 4. Auto-fetch all remaining pages so tab counts are always accurate
    const {
        hasNextPage: hasMore,
        isFetchingNextPage: isFetchingMore,
        isLoading: isQueryLoading,
        fetchNextPage: fetchMore,
        data: queryData,
    } = infiniteQuery;
    useEffect(() => {
        if (hasMore && !isFetchingMore && !isQueryLoading) {
            fetchMore();
        }
    }, [hasMore, isFetchingMore, isQueryLoading, fetchMore, queryData]);

    // 5. Total count from API (first page has totalCount for the zone)
    const totalCount = infiniteQuery.data?.pages[0]?.totalCount ?? seasons.length;

    // Loading states
    const isLoading = isLoadingZones || (infiniteQuery.isLoading && seasons.length === 0);
    const isRefetching = isRefetchingZones || infiniteQuery.isRefetching;
    const isFetchingNextPage = infiniteQuery.isFetchingNextPage;
    const hasNextPage = infiniteQuery.hasNextPage ?? false;
    const isError = isErrorZones || infiniteQuery.isError;

    const queryClient = useQueryClient();

    const refresh = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: farmKeys.zones(), refetchType: 'all' });
        await queryClient.invalidateQueries({ queryKey: farmKeys.seasons(), refetchType: 'all' });
    }, [queryClient]);

    const fetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            infiniteQuery.fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, infiniteQuery]);

    return {
        seasons,
        zones,
        totalCount,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        isError,
        refresh,
        fetchNextPage,
    };
};

export const useSeasonDetail = (
    zoneId: number | string | null | undefined,
    seasonId: number | string | null | undefined,
    initialData?: SeasonData
) => {
    const zoneIdStr = zoneId != null ? String(zoneId) : '';
    const seasonIdStr = seasonId != null ? String(seasonId) : '';

    return useQuery<SeasonData | undefined>({
        queryKey: farmKeys.detail(zoneIdStr, seasonIdStr),
        queryFn: () => seasonApi.getSeasonDetail(zoneIdStr, seasonIdStr),
        enabled: !!zoneIdStr && !!seasonIdStr,
        initialData,
    });
};

export const useSeasonErrorHandler = () => {
    const handleError = (err: unknown) => {
        const error = err as NormalizedError;

        if (error.type === 'VALIDATION_ERROR') {
            const firstFieldKey = Object.keys(error.fields)[0];
            if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: error.fields[firstFieldKey][0],
                    visibilityTime: 4000,
                });
                return;
            }
        }

        if (error.type === 'NOT_FOUND_ERROR') {
            Toast.show({
                type: 'error',
                text1: error.message,
                visibilityTime: 4000,
            });
            return;
        }

        Toast.show({ type: 'error', text1: error.message || 'Có lỗi xảy ra' });
    };

    return { handleError };
};
