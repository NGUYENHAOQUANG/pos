import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { HeadingFarm } from '@/features/farm/components/HeadingFarm';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { FarmData, POND_TYPES, PondData } from '@/features/farm/types/farm.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { PondListSkeleton } from '@/features/farm/components/pond/PondListSkeleton';
import { useZones, usePondsByZone } from '@/features/farm/hooks';

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

    // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
    const activeCycles = useFarmStore(state => state.activeCycles);
    const getCyclesByPondId = useFarmStore(state => state.getCyclesByPondId);
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);

    // React Query Hooks for Data Fetching
    const { data: zonesData = [], isLoading: isLoadingZones } = useZones();
    // Safely fallback to empty array
    const zones = useMemo(() => zonesData || [], [zonesData]);

    const {
        data: pondsData,
        isLoading: isLoadingPonds,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = usePondsByZone(selectedZoneId);

    // Flatten pagination data using reduce instead of flatMap for better compatibility
    const ponds = useMemo(() => {
        if (!pondsData?.pages) return [];
        return pondsData.pages.reduce((acc, page) => [...acc, ...page.items], [] as any[]);
    }, [pondsData]);

    const totalCount = pondsData?.pages[0]?.total || 0;

    const [selectedTab, setSelectedTab] = useState('all');

    // Ref for FlatList scrolling
    const flatListRef = useRef<FlatList>(null);
    useScrollToTop(flatListRef as any);

    // Effect to select the first zone by default if none selected
    useEffect(() => {
        if (zones.length > 0) {
            // Check if current selectedZoneId is valid
            const isValidZone = selectedZoneId && zones.some(z => z.id === selectedZoneId);

            if (!isValidZone) {
                // Priority: Zone ID 71 (Trại Kiên Giang) -> First Zone
                const targetZone = zones.find(z => z.id === 71) || zones[0];
                if (targetZone) {
                    setSelectedZoneId(targetZone.id);
                }
            }
        }
    }, [zones, selectedZoneId, setSelectedZoneId]);

    const farmOptions: DropDownItem[] = zones.map(zone => ({
        id: zone.id.toString(),
        label: zone.name,
        value: zone.code || zone.id.toString(),
    }));

    const selectedFarm: DropDownItem | undefined =
        farmOptions.find(f => f.id === selectedZoneId?.toString()) || farmOptions[0];

    // Helper to handle selection
    const handleSelectFarm = (item: DropDownItem) => {
        setSelectedZoneId(Number(item.id));
    };

    const handlePondPress = (pond: PondData) => {
        navigation.navigate('PondDetail', { pond });
    };

    const handlePondInfoPress = (pond: PondData) => {
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

    const getComputedStatus = useCallback(
        (pond: PondData) => {
            const hasCycle = checkHasCycle(pond.id);
            if (hasCycle) {
                return 'active';
            }
            return 'preparing';
        },
        [checkHasCycle]
    );

    // Calculate counts
    const counts = useMemo(() => {
        const all = totalCount > 0 ? totalCount : ponds.length;
        const active = ponds.filter(
            (pond: PondData) => getComputedStatus(pond) === 'active'
        ).length;
        const preparing = ponds.filter(
            (pond: PondData) => getComputedStatus(pond) === 'preparing'
        ).length;
        return { all, active, preparing };
    }, [ponds, getComputedStatus, totalCount]);

    const filteredData = useMemo(() => {
        let data = ponds;
        if (selectedTab === 'active') {
            data = ponds.filter((pond: PondData) => getComputedStatus(pond) === 'active');
        } else if (selectedTab === 'preparing') {
            data = ponds.filter((pond: PondData) => getComputedStatus(pond) === 'preparing');
        }

        return [...data].sort((a: PondData, b: PondData) => {
            const typeA = typeof a.type === 'string' ? a.type : a.type?.name;
            const typeB = typeof b.type === 'string' ? b.type : b.type?.name;

            const orderA = POND_TYPE_ORDER[typeA] || 99;
            const orderB = POND_TYPE_ORDER[typeB] || 99;
            return orderA - orderB;
        });
    }, [selectedTab, ponds, getComputedStatus]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const { isConnected } = useNetInfo();

    const showSkeleton =
        isLoadingZones ||
        !selectedZoneId ||
        isLoadingPonds ||
        (!!isConnected && isRefetching && !isFetchingNextPage);

    const renderFooter = useCallback(() => {
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
            {showSkeleton ? (
                <PondListSkeleton />
            ) : (
                <ShrimpPondList
                    ref={flatListRef}
                    data={filteredData}
                    onPondPress={handlePondPress}
                    onInfoPress={handlePondInfoPress}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshing={isRefetching}
                    onRefresh={handleRefresh}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
});
