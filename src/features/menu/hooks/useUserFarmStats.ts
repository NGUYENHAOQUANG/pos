import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useZones } from '@/features/farm/hooks/useZones';
import { pondApi } from '@/features/farm/api/pondApi';
import { Zone } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/pond.types';

export const useUserFarmStats = () => {
    const { data: zones = [], isFetching: isFetchingZones, refetch: refetchZones } = useZones();

    const pondQueries = useQueries({
        queries: zones.map((zone: Zone) => ({
            queryKey: ['ponds', 'byZone', zone.id],
            queryFn: async () => {
                const res = await pondApi.getPondsByZone(zone.id);
                return (res.data?.items || []).map((p: PondData) => ({
                    ...p,
                    tempZoneId: zone.id,
                }));
            },
            staleTime: 1000 * 60 * 5,
        })),
    });

    const isFetchingPonds = pondQueries.some(q => q.isFetching);
    const isRefreshing = isFetchingZones || isFetchingPonds;

    const allPonds = useMemo(() => {
        return pondQueries.reduce((acc, query) => {
            if (query.data) {
                return acc.concat(query.data);
            }
            return acc;
        }, [] as PondData[]);
    }, [pondQueries]);

    const connectedFarms = useMemo(() => {
        if (zones.length > 0) {
            return zones.map((zone: Zone) => {
                const pondCount = allPonds.filter(
                    (p: PondData & { tempZoneId?: string }) => p.tempZoneId === zone.id
                ).length;
                return {
                    id: zone.id,
                    name: zone.name,
                    count: pondCount.toString(),
                };
            });
        }
        return [];
    }, [zones, allPonds]);

    const totalFarms = connectedFarms.length;
    const totalPonds = allPonds.length;

    const refetchAll = async () => {
        try {
            await Promise.all([refetchZones(), ...pondQueries.map(q => q.refetch())]);
        } catch (error) {
            console.error('Refresh error:', error);
        }
    };

    return {
        zones,
        allPonds,
        connectedFarms,
        totalFarms,
        totalPonds,
        isRefreshing,
        refetchAll,
    };
};
