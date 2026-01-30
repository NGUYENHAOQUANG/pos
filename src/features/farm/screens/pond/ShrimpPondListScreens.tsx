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
import { cycleApi } from '@/features/farm/api/cycleAPI';
import { formatDate } from '@/features/farm/utils/dateUtils';

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
        return pondsData.pages.reduce((acc, page) => [...acc, ...page.items], [] as PondData[]);
    }, [pondsData]);

    const totalCount = pondsData?.pages[0]?.total || 0;

    const [selectedTab, setSelectedTab] = useState('all');
    // Ref for FlatList scrolling
    const flatListRef = useRef<FlatList<PondData>>(null);
    useScrollToTop(flatListRef as any);

    // Effect to select the first zone by default if none selected
    useEffect(() => {
        if (zones.length > 0 && !selectedZoneId) {
            // Only set if there's NO selectedZoneId at all
            const targetZone = zones.find(z => z.name === 'Trại Kiên Giang') || zones[0];
            if (targetZone) {
                setSelectedZoneId(String(targetZone.id));
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
        setSelectedZoneId(String(item.id));
    };

    const handlePondPress = (pond: PondData) => {
        navigation.navigate('PondDetail', { pond });
    };

    const handlePondInfoPress = (pond: PondData) => {
        navigation.navigate('PondInfo', { pond });
    };

    const handleFarmInfoPress = () => {
        if (!selectedFarm) return;

        // Find the full zone object to get area and address
        const fullZoneData = zones.find(z => z.id.toString() === selectedFarm.id.toString());

        const farmData: FarmData = {
            id: selectedFarm.id.toString(),
            name: selectedFarm.label,
            code: selectedFarm.value,
            area: fullZoneData?.area?.toString() || '',
            address: fullZoneData?.address || '',
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

    const setCycles = useFarmStore(state => state.setCycles);
    const saveActiveCycle = useFarmStore(state => state.saveActiveCycle);

    const handleRefresh = useCallback(async () => {
        const { data: newPondsData } = await refetch();
        const allItems = newPondsData?.pages
            ? newPondsData.pages.reduce((acc: PondData[], page: any) => [...acc, ...page.items], [])
            : [];

        if (allItems.length > 0) {
            try {
                // 2. Fetch summary list for all ponds
                const cyclePromises = allItems.map((p: PondData) => cycleApi.getCyclesByPond(p.id));
                const cyclesResults = await Promise.all(cyclePromises);
                const allCyclesGenerics = cyclesResults.reduce(
                    (acc: any[], val: any[]) => acc.concat(val),
                    []
                );

                // 3. Fetch DETAILS for each cycle found (N+1 problem but necessary per API design)
                const detailPromises = allCyclesGenerics.map(async (c: any) => {
                    if (c.id && c.pondId) {
                        try {
                            const detail = await cycleApi.getCycleDetail(c.pondId, c.id);
                            // Merge detail with summary if needed, but detail should be source of truth
                            return { ...c, ...detail };
                        } catch (e) {
                            console.warn(`Failed to fetch detail for cycle ${c.id}`, e);
                            return c; // Fallback to summary
                        }
                    }
                    return c;
                });

                const allCyclesDetailed = await Promise.all(detailPromises);

                // Map API response to internal CycleData structure
                const mappedCycles = allCyclesDetailed.map((c: any) => ({
                    ...c,
                    // Map API 'name' to 'cycleName'
                    cycleName: c.name || c.cycleName,
                    // Map API 'pondId' to 'sourcePonds' for store lookup
                    sourcePonds: c.sourcePonds || (c.pondId ? [c.pondId] : []),
                    // Ensure receivingPonds exists
                    receivingPonds: c.receivingPonds || [],
                    // Map totalStocking
                    stockingQuantity: c.stockingQuantity || c.totalStocking || 0,
                    // Map stockingDate from createdAt or stockingDate
                    // User wants "dd/MM/yyyy", ignoring time part from UTC field "createdAt"
                    stockingDate: formatDate(new Date(c.createdAt || c.stockingDate || new Date())),
                    // Ensure status matches if needed, or keep as is
                    status:
                        c.status === 'InProgress'
                            ? 'Chưa hoàn thành'
                            : c.status === 'Completed'
                            ? 'Hoàn thành'
                            : c.status,
                }));

                // 4. Sync to store
                setCycles(mappedCycles);

                // 5. Update activeCycles to ensure UI reflects server data immediately
                // effectively overwriting any stale local optimistic state
                // 5. Sync ActiveCycles: Update existing, remove missing
                const deleteActiveCycle = useFarmStore.getState().deleteActiveCycle;

                allItems.forEach(pond => {
                    // Find active cycle for this pond in the new data
                    const activeForPond = mappedCycles.find(
                        c =>
                            (c.pondId === pond.id || c.sourcePonds?.includes(pond.id)) &&
                            c.status !== 'Completed' &&
                            c.status !== 'Canceled' &&
                            c.status !== 'Hoàn thành'
                    );

                    if (activeForPond) {
                        saveActiveCycle(pond.id, activeForPond);
                    } else {
                        // If no active cycle found in fresh data (e.g. was deleted), remove from store active list
                        deleteActiveCycle(pond.id);
                    }
                });
            } catch (err) {
                console.error('REFRESH: Failed to fetch cycles', err);
            }
        }
    }, [refetch, setCycles, saveActiveCycle]);

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
