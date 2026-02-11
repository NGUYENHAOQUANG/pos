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
import { PondListSkeleton } from '@/features/farm/components/skeleton/PondListSkeleton';
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

    const getComputedStatus = useCallback((pond: PondData) => {
        // Strict mapping based on Backend PondStatusEnum
        // Available = 0 (Chuẩn bị)
        // Framing = 1 (Đang nuôi/Active)
        // Null = 2 (Không có trạng thái)

        if (pond.status === 'Framing') return 'active';
        if (pond.status === 'Available') return 'preparing';

        // "Cái ao nào Null là không hiện cái tag đó" -> return undefined
        return undefined;
    }, []);

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

    const fetchAndSyncCycles = useCallback(
        async (pondsToFetch: PondData[]) => {
            if (pondsToFetch.length === 0) return;

            try {
                // 1. Fetch summary list for all ponds
                const cyclePromises = pondsToFetch.map(p => cycleApi.getCyclesByPond(p.id));
                const cyclesResults = await Promise.all(cyclePromises);
                const allCyclesFlat = cyclesResults.reduce(
                    (acc: any[], val: any[]) => acc.concat(val),
                    []
                );

                // 2. Fetch DETAILS only for ACTIVE cycles to avoid N+1 for history
                const detailPromises = allCyclesFlat.map(async (c: any) => {
                    // OPTIMIZATION: Only fetch detail for InProgress cycles
                    if (c.id && c.pondId && c.status === 'InProgress') {
                        try {
                            const detail = await cycleApi.getCycleDetail(c.pondId, c.id);
                            return { ...c, ...detail };
                        } catch (_) {
                            return c;
                        }
                    }
                    return c;
                });

                const allCyclesDetailed = await Promise.all(detailPromises);

                // 3. Map API response to internal CycleData structure
                const mappedCycles = allCyclesDetailed.map((c: any) => ({
                    ...c,
                    cycleName: c.name || c.cycleName,
                    sourcePonds: c.sourcePonds || (c.pondId ? [c.pondId] : []),
                    receivingPonds: c.receivingPonds || [],
                    stockingQuantity: c.stockingQuantity || c.totalStocking || 0,
                    stockingDate: formatDate(new Date(c.createdAt || c.stockingDate || new Date())),
                    status:
                        c.status === 'InProgress'
                            ? 'Chưa hoàn thành'
                            : c.status === 'Completed'
                            ? 'Hoàn thành'
                            : c.status,
                }));

                // 4. Sync to store
                setCycles(mappedCycles);

                // 5. Update activeCycles
                const deleteActiveCycle = useFarmStore.getState().deleteActiveCycle;

                pondsToFetch.forEach(pond => {
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
                        deleteActiveCycle(pond.id);
                    }
                });
            } catch (err) {
                console.error('Failed to sync cycles', err);
            }
        },
        [setCycles, saveActiveCycle]
    );

    const handleRefresh = useCallback(async () => {
        const { data: newPondsData } = await refetch();
        const allItems = newPondsData?.pages
            ? newPondsData.pages.reduce((acc: PondData[], page: any) => [...acc, ...page.items], [])
            : [];
        await fetchAndSyncCycles(allItems);
    }, [refetch, fetchAndSyncCycles]);

    // Track if we've done the initial fetch
    const hasFetchedCycles = useRef(false);

    // Refetch cycle details when screen gains focus (optional, but good for data freshness)
    // Refetch cycle details when screen gains focus is removed to prevent N+1 loop causing lag
    // Data is already synced via mutation onSuccess or initial load

    useEffect(() => {
        // Only run once when ponds are loaded for the first time
        if (ponds.length > 0 && !hasFetchedCycles.current && !isLoadingPonds) {
            hasFetchedCycles.current = true;
            fetchAndSyncCycles(ponds);
        }
    }, [ponds, isLoadingPonds, fetchAndSyncCycles]);

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
                    zoneId={selectedZoneId ? String(selectedZoneId) : undefined}
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
