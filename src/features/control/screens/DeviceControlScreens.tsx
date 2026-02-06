import React, { useMemo, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { DevicesStatus } from '@/features/control/components/DevicesStatus';
import { PondCard } from '@/features/control/components/devices/PondCard';
import { HelpOptionsModal } from '../components/HelpOptionsModal';
import { colors } from '@/styles';
import { useNavigation, useScrollToTop, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useControl } from '@/features/control/store/controlStore';
import { Zone } from '@/features/farm/types/farm.types';
import { DeviceControlSkeleton } from '@/features/control/components/skeleton/DeviceControlSkeleton';
import { useZones, usePondsByZone } from '@/features/farm/hooks';

import { useFarmStore } from '@/features/farm/store/farmStore';

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();

    // React Query Hooks (replacing farmStore fetchers)
    const { data: zonesData = [], isLoading: isLoadingZones } = useZones();
    // Fallback to empty array if undefined
    const zones = useMemo(() => zonesData || [], [zonesData]);

    // Global Farm State
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);
    const setSelectedZoneId = useFarmStore(state => state.setSelectedZoneId);

    // Derived selectedFarm from global ID
    const selectedFarm = useMemo(() => {
        if (!zones || zones.length === 0) return undefined;
        // Find by ID, default handled in effect
        const found = zones.find(z => z.id === selectedZoneId);
        return found ? { id: found.id.toString(), name: found.name } : undefined;
    }, [zones, selectedZoneId]);

    // Help Modal State
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [helpButtonPosition, setHelpButtonPosition] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    // Track previous zone to detect switches
    const prevFarmIdRef = useRef<string | undefined>(selectedFarm?.id);

    // Get Ponds via React Query based on selected Farm
    const {
        data: pondsData,
        isLoading: isLoadingPonds,
        refetch,
        isRefetching,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = usePondsByZone(selectedZoneId);

    // Flatten pagination data and ensure valid array
    const farmPonds = useMemo(() => {
        if (!pondsData?.pages) {
            // Even if no API data, show Mock Demo Ponds
            return [
                { id: 'IOT_POND', name: 'Ao IOT', status: 'Framing' },
                { id: 'N001', name: 'Ao N001', status: 'Framing' },
                { id: 'N002', name: 'Ao N002', status: 'Framing' },
                { id: 'N003', name: 'Ao N003', status: 'Framing' },
            ];
        }

        const apiPonds = pondsData.pages.reduce(
            (acc, page) => [...acc, ...page.items],
            [] as any[]
        );

        // Demo: Inject N001, N002, N003 if they don't exist
        const demoPonds = [
            { id: 'IOT_POND', name: 'Ao IOT', status: 'Framing' },
            { id: 'N001', name: 'Ao N001', status: 'Framing' },
            { id: 'N002', name: 'Ao N002', status: 'Framing' },
            { id: 'N003', name: 'Ao N003', status: 'Framing' },
        ];

        const missingDemoPonds = demoPonds.filter(dp => !apiPonds.some(ap => ap.name === dp.name));

        return [...missingDemoPonds, ...apiPonds];
    }, [pondsData]);

    // Device Data from Control Store (Local State)
    const { ponds: devicePonds } = useControl();

    // Map zones to FarmLocation format
    const farmLocations: FarmLocation[] = useMemo(() => {
        if (!zones || zones.length === 0) return [];
        return zones.map((z: Zone) => ({
            id: z.id.toString(),
            name: z.name,
        }));
    }, [zones]);

    // Default select Farm logic (Global Sync)
    React.useEffect(() => {
        if (zones.length > 0) {
            // Check if current selectedZoneId is valid
            const isValidZone = selectedZoneId && zones.some(z => z.id === selectedZoneId);

            if (!isValidZone) {
                // Priority: Zone ID 71 (Trại Kiên Giang) -> First Zone
                const targetZone = zones.find(z => z.id === '71') || zones[0];
                if (targetZone) {
                    setSelectedZoneId(targetZone.id.toString());
                }
            }
        }
    }, [zones, selectedZoneId, setSelectedZoneId]);

    // Ref for scroll to top
    const flatListRef = useRef<FlatList>(null);
    useScrollToTop(flatListRef as any);

    // Close help modal automatically when leaving this tab/screen
    useFocusEffect(
        useCallback(() => {
            return () => {
                setShowHelpModal(false);
            };
        }, [])
    );

    // Update ref when farm changes
    React.useEffect(() => {
        if (selectedFarm?.id) {
            prevFarmIdRef.current = selectedFarm.id;
        }
    }, [selectedFarm]);

    // Combined Loading State
    // Show skeleton if:
    // 1. Loading Zones (App startup/First navigaton)
    // 2. Zones loaded but Farm not yet selected (Init logic in useEffect)
    // 3. Loading Ponds (React Query active)
    // 4. Manual Refetch or Network Reconnect (but not Load More)
    const { isConnected } = useNetInfo();

    // Combined Loading State
    // Show skeleton if:
    // 1. Loading Zones (App startup/First navigaton)
    // 2. Zones loaded but Farm not yet selected (Init logic in useEffect)
    // 3. Loading Ponds (React Query active)
    // 4. Manual Refetch or Network Reconnect (but not Load More)
    const showSkeleton =
        isLoadingZones ||
        !selectedFarm ||
        isLoadingPonds ||
        (!!isConnected && isRefetching && !isFetchingNextPage);

    const handleRefresh = async () => {
        await refetch();
    };

    const handleConnectDevice = (pondName: string) => {
        navigation.navigate('ConnectDevice', { pondName });
    };

    const handleHelpPress = (position: { x: number; y: number; width: number; height: number }) => {
        setHelpButtonPosition(position);
        setShowHelpModal(true);
    };

    const filteredPonds = useMemo(() => {
        if (!selectedFarm || !farmPonds) return [];

        const mappedPonds = farmPonds.map((realPond: any) => {
            // Find corresponding device data in controlStore
            const devicePond = devicePonds.find(p => p.name === realPond.name);

            return {
                id: realPond.id,
                name: realPond.name,
                hasDevices: devicePond?.hasDevices ?? false,
                devices: devicePond?.devices ?? [],
                deviceStats: devicePond?.deviceStats,
            };
        });

        // Sort: Ponds with devices first
        return mappedPonds.sort((a: any, b: any) => {
            if (a.hasDevices === b.hasDevices) return 0;
            return a.hasDevices ? -1 : 1;
        });
    }, [farmPonds, devicePonds, selectedFarm]);

    const showStats = filteredPonds.length > 0;

    // Calculate total active devices and warnings for summary based on FILTERED ponds
    const totalStats = useMemo(() => {
        const sumWarnings = filteredPonds.reduce((acc: number, pond: any) => {
            if (!pond.deviceStats) return acc;
            const stats = pond.deviceStats;
            return (
                acc +
                (stats.fan.warning || 0) +
                (stats.feeder.warning || 0) +
                (stats.oxy.warning || 0) +
                (stats.syphon.warning || 0)
            );
        }, 0);

        const countPondsWithDevices = filteredPonds.filter((p: any) => p.hasDevices).length;

        return {
            warning: sumWarnings,
            active: countPondsWithDevices,
            other: filteredPonds.length - countPondsWithDevices,
        };
    }, [filteredPonds]);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <View style={styles.container}>
            {true && (
                <HeaderCamLocation
                    locations={farmLocations.length > 0 ? farmLocations : undefined}
                    selectedLocation={selectedFarm}
                    onLocationSelect={loc => setSelectedZoneId(loc.id)}
                    onHelpPress={handleHelpPress}
                />
            )}
            <HeaderDevices
                title="Điều Khiển Thiết Bị"
                showBackButton={false}
                includeSafeArea={false}
            />
            {showSkeleton ? (
                <DeviceControlSkeleton />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={filteredPonds}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }) => (
                        <PondCard
                            pondName={item.name}
                            isEmpty={!item.hasDevices}
                            deviceStats={item.deviceStats}
                            onPressDetail={() =>
                                navigation.navigate('ControlDetail', { pondName: item.name })
                            }
                            onAddDevice={() => handleConnectDevice(item.name)}
                        />
                    )}
                    style={styles.content}
                    contentContainerStyle={[styles.scrollContent, styles.scrollContentPadding]}
                    ListHeaderComponent={
                        showStats ? (
                            <>
                                <DevicesStatus
                                    totalPonds={filteredPonds.length}
                                    activePonds={totalStats.active}
                                    warningPonds={totalStats.warning}
                                    otherPonds={totalStats.other}
                                />
                                <View style={styles.spacer} />
                            </>
                        ) : null
                    }
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                />
            )}

            <HelpOptionsModal
                isOpen={showHelpModal}
                buttonPosition={helpButtonPosition}
                onClose={() => setShowHelpModal(false)}
                onPressUserManual={() => {
                    setShowHelpModal(false);
                    navigation.navigate('GeneralUserManual');
                }}
                onPressDeviceExplanation={() => {
                    setShowHelpModal(false);
                    navigation.navigate('UserManual');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
        flexGrow: 1,
    },
    scrollContentPadding: {
        paddingTop: 16,
    },
    spacer: {
        height: 16,
    },
});
