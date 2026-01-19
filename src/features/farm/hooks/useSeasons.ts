import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { seasonApi } from '@/features/farm/api/seasonApi';
import { SeasonData } from '@/features/farm/types/farm.types';
import { farmKeys } from './farmKeys';
import { useZones } from './useZones';

export const useSeasons = () => {
    // 1. Fetch Zones first
    const {
        data: zones = [],
        isLoading: isLoadingZones,
        isRefetching: isRefetchingZones,
        isError: isErrorZones,
    } = useZones();

    // 2. Parallel fetch seasons for all zones
    const seasonQueries = useQueries({
        queries: zones.map(zone => ({
            queryKey: farmKeys.seasons(zone.id),
            queryFn: async () => {
                const results = await seasonApi.getSeasons(zone.id);
                // Map API raw data to Domain SeasonData
                return results.map((item: any) => ({
                    ...item,
                    name: item.seasonName || item.name,
                    // Inject farmCode from zone if missing, or use seasonCode as fallback
                    farmCode: zone.code || item.seasonCode || '',
                    // Store zoneId for filtering
                    zoneId: zone.id,
                    // Map status number to string if needed.
                    status: (item.status === 0 ? 'Đang hoạt động' : 'Đã kết thúc') as
                        | 'Đang hoạt động'
                        | 'Đã kết thúc',
                    id: item.id.toString(), // Ensure string ID
                }));
            },
            enabled: !!zone.id,
        })),
    });

    // 3. Combine data
    const seasons = useMemo(() => {
        return seasonQueries.reduce((acc, query) => {
            if (query.data) {
                return [...acc, ...query.data];
            }
            return acc;
        }, [] as SeasonData[]);
    }, [seasonQueries]);

    // Check loading states
    // We are loading if zones are loading, OR if any season query is fetching AND we have no data yet
    const areSeasonsLoading =
        seasonQueries.some(q => q.isLoading) && seasonQueries.every(q => !q.data);

    // We are refetching if zones are refetching OR any season query is refetching
    const areSeasonsRefetching = seasonQueries.some(q => q.isRefetching);

    const isLoading = isLoadingZones || (areSeasonsLoading && seasons.length === 0);
    const isRefetching = isRefetchingZones || areSeasonsRefetching;
    const isError = isErrorZones || seasonQueries.some(q => q.isError);

    const queryClient = useQueryClient();

    const refresh = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: farmKeys.zones(), refetchType: 'all' });
        await queryClient.invalidateQueries({ queryKey: farmKeys.seasons(), refetchType: 'all' });
    }, [queryClient]);

    return {
        seasons,
        zones,
        isLoading,
        isRefetching,
        isError,
        refresh,
    };
};
