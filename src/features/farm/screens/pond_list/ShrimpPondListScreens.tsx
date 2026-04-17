import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { FarmData } from '@/features/farm/types/farm.types';
import { PondData, PondStatus } from '@/features/farm/types/pond.types';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useZones, usePondsByZone } from '@/features/farm/hooks';
import { usePondCategories } from '@/features/farm/hooks/usePondCategories';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { pondListService } from '@/features/farm/services/pond-list.service';
import { useWarehouses } from '@/features/material/hooks/useWarehouses';
import { APP_CONFIG } from '@/shared/constants/config';
import { ShrimpPondListContent } from '@/features/farm/screens/pond_list/ShrimpPondListContent';
import { useWeatherForecast } from '@/features/weather/hooks/useWeatherForecast';
import { useSettingsStore } from '@/features/menu/store/settingsStore';
import { useWeatherStore } from '@/features/weather/store/weatherStore';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const ShrimpPondListScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);
    const weatherEnabled = useSettingsStore(state => state.weatherEnabled);
    const selectedLocation = useWeatherStore(state => state.selectedLocation);
    const { data: weatherData } = useWeatherForecast(selectedLocation, { enableNotify: true });

    const { data: zonesData = [], isLoading: isLoadingZones } = useZones();
    const zones = useMemo(() => zonesData || [], [zonesData]);

    const [selectedTab, setSelectedTab] = useState('all');

    const {
        data: allPondsData,
        isLoading: isLoadingAll,
        total: allCount,
        fetchNextPage: fetchNextAll,
        hasNextPage: hasNextAll,
        isFetchingNextPage: isFetchingNextAll,
        refetch: refetchAll,
        isRefetching: isRefetchingAll,
    } = usePondsByZone(selectedZoneId, null);

    const {
        data: activePondsData,
        total: activeCount,
        fetchNextPage: fetchNextActive,
        hasNextPage: hasNextActive,
        isFetchingNextPage: isFetchingNextActive,
        refetch: refetchActive,
        isRefetching: isRefetchingActive,
    } = usePondsByZone(selectedZoneId, PondStatus.Framing);

    const {
        data: preparingPondsData,
        total: preparingCount,
        fetchNextPage: fetchNextPreparing,
        hasNextPage: hasNextPreparing,
        isFetchingNextPage: isFetchingNextPreparing,
        refetch: refetchPreparing,
        isRefetching: isRefetchingPreparing,
    } = usePondsByZone(selectedZoneId, PondStatus.Available);

    const counts = useMemo(
        () => ({
            all: allCount || 0,
            active: activeCount || 0,
            preparing: preparingCount || 0,
        }),
        [allCount, activeCount, preparingCount]
    );

    const { data: categoriesResponse } = usePondCategories();
    const categories = useMemo(() => categoriesResponse?.items || [], [categoriesResponse]);

    const { data: warehouses } = useWarehouses({
        PageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
        ZoneId: selectedZoneId ? String(selectedZoneId) : undefined,
    });
    const warehouseId = warehouses?.[0]?.id;

    const currentDataSlice = useMemo(() => {
        if (selectedTab === 'active') return activePondsData;
        if (selectedTab === 'preparing') return preparingPondsData;
        return allPondsData;
    }, [selectedTab, activePondsData, preparingPondsData, allPondsData]);

    const ponds = useMemo(() => {
        if (!currentDataSlice) return [];
        const mappedPonds = pondListService.mapPondsWithCategories(currentDataSlice, categories);
        return pondListService.sortPonds(mappedPonds);
    }, [currentDataSlice, categories]);

    useEffect(() => {
        if (zones.length > 0 && !selectedZoneId) {
            const targetZone = zones.find(z => z.name === 'Trại Kiên Giang') || zones[0];
            if (targetZone) {
                setSelectedZoneId(String(targetZone.id));
            }
        }
    }, [zones, selectedZoneId, setSelectedZoneId]);

    const { hasCompletedFarm, startOnboarding, _hasHydrated } = useOnboardingStore();
    useEffect(() => {
        const isReadyToStart = _hasHydrated && !isLoadingZones && !!selectedZoneId && !isLoadingAll;
        if (isReadyToStart && !hasCompletedFarm) {
            const timer = setTimeout(() => {
                startOnboarding('farm');
            }, 500); // Add a small delay for better UX
            return () => clearTimeout(timer);
        }
    }, [
        _hasHydrated,
        hasCompletedFarm,
        isLoadingZones,
        selectedZoneId,
        isLoadingAll,
        startOnboarding,
    ]);

    const farmOptions: DropDownItem[] = useMemo(
        () => pondListService.mapZonesToOptions(zones),
        [zones]
    );

    const selectedFarm: DropDownItem | undefined = useMemo(
        () => farmOptions.find(f => f.id === selectedZoneId?.toString()) || farmOptions[0],
        [farmOptions, selectedZoneId]
    );

    const handleSelectFarm = useCallback(
        (item: DropDownItem) => {
            setSelectedZoneId(String(item.id));
        },
        [setSelectedZoneId]
    );

    const handlePondPress = useCallback(
        (pond: PondData) => {
            navigation.navigate('PondDetail', { pondId: pond.id, zoneId: pond.zoneId! });
        },
        [navigation]
    );

    const handleWeatherPress = useCallback(() => {
        navigation.navigate('WeatherScreen' as never);
    }, [navigation]);

    const handlePondInfoPress = useCallback(
        (pond: PondData) => {
            navigation.navigate('PondInfo', { pond });
        },
        [navigation]
    );

    const handleFarmInfoPress = useCallback(() => {
        if (!selectedFarm) return;

        const fullZoneData = zones.find(z => z.id.toString() === selectedFarm.id.toString());
        const farmData: FarmData = pondListService.mapFarmData(selectedFarm, fullZoneData);

        navigation.navigate('FarmInfo', { farm: farmData });
    }, [selectedFarm, zones, navigation]);

    const handleLoadMore = useCallback(() => {
        if (selectedTab === 'active' && hasNextActive && !isFetchingNextActive) fetchNextActive();
        else if (selectedTab === 'preparing' && hasNextPreparing && !isFetchingNextPreparing)
            fetchNextPreparing();
        else if (selectedTab === 'all' && hasNextAll && !isFetchingNextAll) fetchNextAll();
    }, [
        selectedTab,
        hasNextActive,
        isFetchingNextActive,
        fetchNextActive,
        hasNextPreparing,
        isFetchingNextPreparing,
        fetchNextPreparing,
        hasNextAll,
        isFetchingNextAll,
        fetchNextAll,
    ]);

    const handleRefresh = useCallback(async () => {
        if (selectedTab === 'active') await refetchActive();
        else if (selectedTab === 'preparing') await refetchPreparing();
        else await refetchAll();
    }, [selectedTab, refetchActive, refetchPreparing, refetchAll]);

    const currentIsRefetching =
        selectedTab === 'active'
            ? isRefetchingActive
            : selectedTab === 'preparing'
            ? isRefetchingPreparing
            : isRefetchingAll;
    const currentIsFetchingNext =
        selectedTab === 'active'
            ? isFetchingNextActive
            : selectedTab === 'preparing'
            ? isFetchingNextPreparing
            : isFetchingNextAll;

    const { isConnected } = useNetInfo();

    const showSkeleton =
        isLoadingZones ||
        !selectedZoneId ||
        isLoadingAll ||
        (!!isConnected && currentIsRefetching && !currentIsFetchingNext);

    return (
        <ShrimpPondListContent
            farmOptions={farmOptions}
            selectedFarm={selectedFarm}
            selectedZoneId={selectedZoneId ? String(selectedZoneId) : undefined}
            selectedTab={selectedTab}
            onTabSelect={setSelectedTab}
            counts={counts}
            filteredData={ponds}
            showSkeleton={showSkeleton}
            isRefetching={currentIsRefetching}
            isFetchingNextPage={currentIsFetchingNext}
            onSelectFarm={handleSelectFarm}
            onFarmInfoPress={handleFarmInfoPress}
            onPondPress={handlePondPress}
            onPondInfoPress={handlePondInfoPress}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            warehouseId={warehouseId}
            weatherEnabled={weatherEnabled}
            currentWeather={weatherData?.current}
            locationName={selectedLocation?.name}
            onWeatherPress={handleWeatherPress}
        />
    );
};

export default ShrimpPondListScreens;
