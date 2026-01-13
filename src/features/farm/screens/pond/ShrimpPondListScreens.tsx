import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { FarmData, POND_TYPES } from '@/features/farm/types/farm.types';
import { Loading } from '@/shared/components/ui/Loading';
import { useFarm } from '@/features/farm/store/farmStore';

interface ShrimpPondListScreensProps {}

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

// Sort order map
const POND_TYPE_ORDER: Record<string, number> = {
    [POND_TYPES.NURSERY]: 1,
    [POND_TYPES.CULTIVATION]: 2,
    [POND_TYPES.READY]: 3,
    [POND_TYPES.WATER_STORAGE]: 4,
    [POND_TYPES.TREATMENT]: 5,
    [POND_TYPES.WASTE]: 6,
    [POND_TYPES.SETTLING]: 7,
};

export const ShrimpPondListScreens: React.FC<ShrimpPondListScreensProps> = () => {
    const navigation = useNavigation<NavigationProp>();
    const {
        ponds,
        activeCycles,
        getCyclesByPondId,
        zones,
        fetchZones,
        selectedZoneId,
        setSelectedZoneId,
        fetchPondsByZone,
        isLoadingPonds,
        hasMore,
        totalCount,
    } = useFarm();
    const [selectedTab, setSelectedTab] = useState('all');
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    // Fetch ponds when selectedZoneId changes
    useEffect(() => {
        if (selectedZoneId) {
            fetchPondsByZone(selectedZoneId);
        }
    }, [selectedZoneId, fetchPondsByZone]);

    // Effect to select the first zone by default if none selected
    useEffect(() => {
        if (!selectedZoneId && zones.length > 0) {
            // Priority: Zone ID 71 (Trại Kiên Giang) -> First Zone
            const targetZone = zones.find(z => z.id === 71) || zones[0];
            if (targetZone) {
                setSelectedZoneId(targetZone.id);
            }
        }
    }, [zones, selectedZoneId, setSelectedZoneId]);

    const farmOptions: DropDownItem[] = zones.map(zone => ({
        id: zone.id.toString(),
        label: zone.name,
        value: zone.code || zone.id.toString(), // Use code if available, else ID
    }));

    const selectedFarm: DropDownItem | undefined =
        farmOptions.find(f => f.id === selectedZoneId?.toString()) || farmOptions[0];

    // Helper to handle selection
    const handleSelectFarm = (item: DropDownItem) => {
        setSelectedZoneId(Number(item.id));
    };

    const handlePondPress = (pond: any) => {
        navigation.navigate('PondDetail', { pond });
    };

    const handlePondInfoPress = (pond: any) => {
        navigation.navigate('PondInfo', { pond });
    };

    const handleFarmInfoPress = () => {
        if (!selectedFarm) return;
        const farmData: FarmData = {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: '',
            address: '',
        };
        navigation.navigate('FarmInfo', { farm: farmData });
    };

    const checkHasCycle = useCallback(
        (pondId: string) => {
            const currentCycle = activeCycles[pondId];
            if (currentCycle) return true;
            // Relaxed check: ANY cycle implies Active
            const cycles = getCyclesByPondId(pondId);
            return cycles.length > 0;
        },
        [activeCycles, getCyclesByPondId]
    );

    // Generic status checker for consistency with ShrimpPondList's getStatus
    const getComputedStatus = useCallback(
        (pond: any) => {
            const hasCycle = checkHasCycle(pond.id);

            // User request: "Any pond with a cycle is Active, otherwise Preparing"
            if (hasCycle) {
                return 'active';
            }
            return 'preparing';
        },
        [checkHasCycle]
    );

    // Calculate counts based on COMPUTED status (requires activity + generic rules)
    const counts = useMemo(() => {
        const all = totalCount > 0 ? totalCount : ponds.length; // Use server total if available
        const active = ponds.filter(pond => getComputedStatus(pond) === 'active').length;
        const preparing = ponds.filter(pond => getComputedStatus(pond) === 'preparing').length;
        return { all, active, preparing };
    }, [ponds, getComputedStatus, totalCount]);

    const filteredData = useMemo(() => {
        let data = ponds;
        if (selectedTab === 'active') {
            data = ponds.filter(pond => getComputedStatus(pond) === 'active');
        } else if (selectedTab === 'preparing') {
            data = ponds.filter(pond => getComputedStatus(pond) === 'preparing');
        }

        // We rely on the store 'ponds' being correct for the selected zone.
        // Pagination: The store accumulates ponds, so we just render them.

        return [...data].sort((a, b) => {
            // pond.type is now an object, access name for mapping
            // Safely handle if it's still a string during migration or API mismatch
            const typeA = typeof a.type === 'string' ? a.type : a.type?.name;
            const typeB = typeof b.type === 'string' ? b.type : b.type?.name;

            const orderA = POND_TYPE_ORDER[typeA] || 99;
            const orderB = POND_TYPE_ORDER[typeB] || 99;
            return orderA - orderB;
        });
    }, [selectedTab, ponds, getComputedStatus]);

    const handleLoadMore = useCallback(async () => {
        if (!hasMore || isLoadMore || isLoadingPonds) return;

        setIsLoadMore(true);
        if (selectedZoneId) {
            try {
                await fetchPondsByZone(selectedZoneId, { isLoadMore: true });
            } finally {
                setIsLoadMore(false);
            }
        }
    }, [hasMore, isLoadMore, isLoadingPonds, selectedZoneId, fetchPondsByZone]);

    const handleRefresh = useCallback(async () => {
        if (!selectedZoneId || isRefreshing || isLoadingPonds) return;

        setIsRefreshing(true);
        try {
            // Use isBackground to update silently (without full screen loader)
            await fetchPondsByZone(selectedZoneId, { isBackground: true });
        } finally {
            setIsRefreshing(false);
        }
    }, [selectedZoneId, isRefreshing, isLoadingPonds, fetchPondsByZone]);

    const renderFooter = useCallback(() => {
        // Loading footer disabled per user request
        return null;
    }, []);

    return (
        <View style={styles.container}>
            <HeaderFarm
                type="list"
                data={farmOptions}
                value={selectedFarm}
                onSelect={handleSelectFarm}
                onMenuPress={handleFarmInfoPress}
            />
            <HeadingFarm
                selectedTab={selectedTab}
                onTabSelect={setSelectedTab}
                tabType="dashboard"
                counts={counts}
            />
            <Loading isLoading={isLoadingPonds}>
                <ShrimpPondList
                    data={filteredData}
                    onPondPress={handlePondPress}
                    onInfoPress={handlePondInfoPress}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                />
            </Loading>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
});
