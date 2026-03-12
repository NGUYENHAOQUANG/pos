import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCyclesByPond, useCycleDetails } from '@/features/farm/hooks/useCycle';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useShrimpSeeds } from '@/features/material/hooks/useShrimpSeeds';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import { PondCycleDetailContent } from './PondCycleList';
import { CycleData } from '@/features/farm/types/cycle.types';
import { APP_CONFIG } from '@/shared/constants/config';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'PondCycleListScreen'>;
type RouteProps = RouteProp<AppStackParamList, 'PondCycleListScreen'>;

export const PondCycleListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { pondId, zoneId, warehouseId } = route.params;

    const { data: _pond } = usePondDetail(zoneId, pondId);

    const { data: warehouses } = useWarehouses({
        PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
        ZoneId: zoneId,
    });
    const effectiveWarehouseId = warehouseId || warehouses?.[0]?.id;
    const { data: shrimpSeeds } = useShrimpSeeds(effectiveWarehouseId);

    const { data: cyclesResponse, isLoading } = useCyclesByPond(pondId);
    const cycles = useMemo(() => cyclesResponse?.data?.items || [], [cyclesResponse]);

    const cycleIds = useMemo(() => cycles.map(c => c.id), [cycles]);
    const { warehouseItemMap } = useCycleDetails(pondId, cycleIds);

    const [selectedSeason, setSelectedSeason] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const seasonOptions = useMemo(() => {
        const uniqueSeasons = new Map();
        cycles.forEach(c => {
            if (c.season && c.season.id) {
                if (!uniqueSeasons.has(c.season.id)) {
                    uniqueSeasons.set(c.season.id, {
                        label: c.season.name || 'Unknown',
                        value: c.season.id,
                    });
                }
            }
        });
        const options = Array.from(uniqueSeasons.values());
        return [{ label: 'Tất cả vụ nuôi', value: '' }, ...options];
    }, [cycles]);

    const displayedCycles = useMemo(() => {
        if (!selectedSeason) return cycles;
        return cycles.filter(c => c.season?.id === selectedSeason);
    }, [cycles, selectedSeason]);

    const getBreedLabel = useCallback(
        (cycle: CycleData) => {
            const itemId = warehouseItemMap.get(cycle.id) || cycle.warehouseItemId;
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
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            onBack={() => navigation.goBack()}
            onPressCycle={cycleId =>
                navigation.navigate('CycleDetailScreen', { pondId, zoneId, cycleId, warehouseId })
            }
        />
    );
};
