import { useQueries, useQueryClient, useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { seasonApi } from '@/features/menu/api/seasonApi';
import { SeasonData, SeasonStatus, getSeasonStatusName } from '@/features/farm/types/farm.types';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { useZones } from '@/features/farm/hooks/useZones';
import { NormalizedError } from '@/core/api/errorHandler';

// Extracted fetch function for reuse
const fetchSeasonsByZone = async (zoneId: number | string, zoneCode?: string) => {
    // Ensure zoneId is string for API call
    const zoneIdStr = String(zoneId);
    const results = await seasonApi.getSeasons(zoneIdStr);
    // Map API raw data to Domain SeasonData
    return results.map((item: any) => ({
        ...item,
        name: item.seasonName || item.name,
        // Inject farmCode from zone if missing, or use seasonCode as fallback
        farmCode: zoneCode || item.seasonCode || '',
        // Store zoneId for filtering
        zoneId: zoneIdStr,
        status: item.status as SeasonStatus,
        statusName: getSeasonStatusName(item.status),
        id: item.id.toString(), // Ensure string ID
    }));
};

export const useSeasonsByZone = (zoneId: number | string | null | undefined, zoneCode?: string) => {
    const zoneIdStr = zoneId ? String(zoneId) : '';
    return useQuery({
        queryKey: farmKeys.seasons(zoneIdStr),
        queryFn: () => fetchSeasonsByZone(zoneIdStr, zoneCode),
        enabled: !!zoneIdStr,
    });
};

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
            queryFn: () => fetchSeasonsByZone(zone.id, zone.code),
            enabled: !!zone.id,
            staleTime: 1000 * 60 * 5,
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
