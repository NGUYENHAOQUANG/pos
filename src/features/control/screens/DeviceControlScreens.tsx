import React, { useMemo, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { DevicesStatus } from '@/features/control/components/DevicesStatus';
import { PondCard } from '@/features/control/components/devices/PondCard';
import { colors } from '@/styles';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useControl } from '@/features/control/store/controlStore';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Zone } from '@/features/farm/types/farm.types';
import { DeviceControlSkeleton } from '@/features/control/components/DeviceControlSkeleton';

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const {
        zones,
        fetchZones,
        ponds: farmPonds,
        fetchPondsByZone,
        isLoadingPonds,
    } = useFarmStore();
    const { ponds: devicePonds } = useControl();

    const [selectedFarm, setSelectedFarm] = useState<FarmLocation | undefined>(undefined);

    // Local loading state for immediate feedback
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load zones on mount
    React.useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    // Map zones to FarmLocation format
    const farmLocations: FarmLocation[] = useMemo(() => {
        if (!zones || zones.length === 0) return [];
        return zones.map((z: Zone) => ({
            id: z.id.toString(),
            name: z.name,
        }));
    }, [zones]);

    // Default select Farm logic (Priority: ID 71 - Trại Kiên Giang)
    React.useEffect(() => {
        if (!selectedFarm && farmLocations.length > 0) {
            // Check for ID "71" (string) since we mapped it
            const target = farmLocations.find(f => f.id === '71') || farmLocations[0];

            // Defer selection slightly to allow UI/Loading animation to start smoothly
            const timer = setTimeout(() => {
                setSelectedFarm(target);
            }, 50);

            return () => clearTimeout(timer);
        } else if (farmLocations.length === 0 && !isLoadingPonds && zones.length > 0) {
            // If zones loaded but no locations mapped (unlikely) or empty
            setIsFirstLoad(false);
        }
    }, [farmLocations, selectedFarm, zones, isLoadingPonds]);

    // Track previous zone to detect switches
    const prevFarmIdRef = useRef<string | undefined>(selectedFarm?.id);

    // Ref for scroll to top
    const flatListRef = useRef<FlatList>(null);
    useScrollToTop(flatListRef as any);

    // Fetch ponds when selected farm changes
    React.useEffect(() => {
        const loadPonds = async () => {
            if (selectedFarm?.id) {
                // Logic to prevent "Content -> Skeleton" flash on App Load
                // But ensure Skeleton appears on Zone Switch.
                const isZoneSwitch = selectedFarm.id !== prevFarmIdRef.current;

                // If we have data and it's NOT a zone switch (e.g. App Load / Re-mount),
                // use background fetch to keep showing content.
                const isHydrated = farmPonds.length > 0;

                // NOTE: 'isLoadingPonds' from farmStore might be global, so we rely on local logic + store updates
                // But fetchPondsByZone in farmStore accepts isBackground.

                const shouldBackgroundLoad = !isZoneSwitch && isHydrated;

                // Update ref
                prevFarmIdRef.current = selectedFarm.id;

                try {
                    // Pass isBackground options if supported by store.
                    // Looking at farmStore, fetchPondsByZone DOES accept { isBackground: boolean }
                    await fetchPondsByZone(Number(selectedFarm.id), {
                        isBackground: shouldBackgroundLoad,
                    });
                } finally {
                    setIsFirstLoad(false);
                }
            }
        };
        loadPonds();
    }, [selectedFarm, fetchPondsByZone, farmPonds.length]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (selectedFarm?.id) {
            // Force skeleton on refresh per user request
            await fetchPondsByZone(Number(selectedFarm.id), { isBackground: false });
        }
        setIsRefreshing(false);
    };

    const handleConnectDevice = (pondName: string) => {
        navigation.navigate('ConnectDevice', { pondName });
    };

    const filteredPonds = useMemo(() => {
        if (!selectedFarm || !farmPonds) return [];

        const mappedPonds = farmPonds.map(realPond => {
            // Find corresponding device data in controlStore
            // Matching by name for now as controlStore uses names, but ideally should use ID
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
        return mappedPonds.sort((a, b) => {
            if (a.hasDevices === b.hasDevices) return 0;
            return a.hasDevices ? -1 : 1;
        });
    }, [farmPonds, devicePonds, selectedFarm]);

    const showStats = filteredPonds.length > 0;

    // Calculate total active devices and warnings for summary based on FILTERED ponds
    const totalStats = useMemo(() => {
        // Calculate total warnings across all ponds (sum of all devices with warning status)
        const sumWarnings = filteredPonds.reduce((acc, pond) => {
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

        // Calculate total active ponds (ponds that have at least one device connected)
        const countPondsWithDevices = filteredPonds.filter(p => p.hasDevices).length;

        return {
            warning: sumWarnings,
            active: countPondsWithDevices,
            other: filteredPonds.length - countPondsWithDevices,
        };
    }, [filteredPonds]);

    return (
        <View style={styles.container}>
            {true && (
                <HeaderCamLocation
                    locations={farmLocations.length > 0 ? farmLocations : undefined}
                    selectedLocation={selectedFarm}
                    onLocationSelect={setSelectedFarm}
                    onHelpPress={() => navigation.navigate('UserManual')}
                />
            )}
            <HeaderDevices
                title="Điều Khiển Thiết Bị"
                showBackButton={false}
                includeSafeArea={false}
            />
            {isLoadingPonds && isFirstLoad ? (
                <DeviceControlSkeleton />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={filteredPonds}
                    keyExtractor={item => item.id.toString()}
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
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                    }
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
