import React, { useState, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useCyclesByPond } from '@/features/farm/hooks/useCycle';
import { usePondBreedInfo } from '@/features/farm/hooks/usePondBreedInfo';
import { usePondDetail } from '@/features/farm/hooks/usePonds';
import { PondCycleDetailContent } from './PondCycleList';

type NavigationProp = NativeStackNavigationProp<AppStackParamList, 'PondCycleListScreen'>;
type RouteProps = RouteProp<AppStackParamList, 'PondCycleListScreen'>;

export const PondCycleListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { pondId, zoneId } = route.params;

    const { data: _pond } = usePondDetail(zoneId, pondId);
    const { getBreedLabel } = usePondBreedInfo(zoneId);

    const { data: cyclesResponse, isLoading } = useCyclesByPond(pondId);
    const cycles = useMemo(() => cyclesResponse?.data?.items || [], [cyclesResponse]);

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
                navigation.navigate('CycleDetailScreen', { pondId, zoneId, cycleId })
            }
        />
    );
};
