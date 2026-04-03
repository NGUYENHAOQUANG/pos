import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCyclesByPond, useCycleDetails } from '@/features/farm/hooks/useCycle';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import { useSeasonList } from '@/features/menu/hooks/useSeason';
import { PondCycleDetailContent } from './PondCycleList';
import { CycleData } from '@/features/farm/types/cycle.types';
import { APP_CONFIG } from '@/shared/constants/config';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'PondCycleListScreen'>;
type RouteProps = RouteProp<AppStackParamList, 'PondCycleListScreen'>;

export const PondCycleListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { pondId, zoneId, warehouseId } = route.params;

    const [selectedSeason, setSelectedSeason] = useState('');

    const { data: _pond } = usePondDetail(zoneId, pondId);

    const { data: warehouses } = useWarehouses({
        PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
        ZoneId: zoneId,
    });
    const effectiveWarehouseId = warehouseId || warehouses?.[0]?.id;
    const { data: shrimpSeeds } = useShrimpSeeds(effectiveWarehouseId);

    const { data: cyclesResponse, isLoading } = useCyclesByPond(pondId, {
        SeasonId: selectedSeason || undefined,
    });
    const cycles = useMemo(() => cyclesResponse?.data?.items || [], [cyclesResponse]);

    const cycleIds = useMemo(() => cycles.map(c => c.id), [cycles]);
    const { warehouseItemMap } = useCycleDetails(pondId, cycleIds);

    const { data: seasons } = useSeasonList(zoneId, {
        PageSize: APP_CONFIG.MAX_PAGE_SIZE,
    });

    const seasonOptions = useMemo(() => {
        const seasonsList = seasons?.data?.items || [];
        const options = seasonsList.map(s => ({
            id: s.id as string,
            label: s.name || 'Unknown',
            value: s.id as string,
        }));
        return [{ id: '', label: 'Tất cả vụ nuôi', value: '' }, ...options];
    }, [seasons]);

    const displayedCycles = cycles;

    const getBreedLabel = useCallback(
        (cycle: CycleData) => {
            const cycleItem = cycle.shrimpData?.warehouseItemId || cycle.warehouseItemId;
            const itemId = warehouseItemMap.get(cycle.id) || cycleItem;
            if (!itemId || !shrimpSeeds?.length) return 'N/A';
            return shrimpSeeds.find((s: any) => s.id === itemId)?.materialName || 'N/A';
        },
        [shrimpSeeds, warehouseItemMap]
    );

    return (
        <PondCycleDetailContent
            isLoading={isLoading}
            displayedCycles={displayedCycles}
            getBreedLabel={getBreedLabel}
            seasonOptions={seasonOptions}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            onBack={() => navigation.goBack()}
            onPressCycle={cycleId =>
                navigation.navigate('CycleDetailScreen', { pondId, zoneId, cycleId, warehouseId })
            }
        />
    );
};
