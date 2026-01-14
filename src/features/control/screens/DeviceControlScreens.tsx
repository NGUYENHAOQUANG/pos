import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { HeaderDevices } from '../components/HeaderDevices';
import { HeaderCamLocation, FarmLocation } from '../components/HeaderCamLocation';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';
import { colors } from '@/styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useControl } from '../store/controlStore';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Zone } from '@/features/farm/types/farm.types';
import { Loading } from '@/shared/components/ui/Loading';

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

    // Fetch ponds when selected farm changes
    React.useEffect(() => {
        const loadPonds = async () => {
            if (selectedFarm?.id) {
                try {
                    await fetchPondsByZone(Number(selectedFarm.id));
                } finally {
                    setIsFirstLoad(false);
                }
            }
        };
        loadPonds();
    }, [selectedFarm, fetchPondsByZone]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (selectedFarm?.id) {
            await fetchPondsByZone(Number(selectedFarm.id));
        }
        // Artificial delay if needed, or rely on fetch
        setTimeout(() => setIsRefreshing(false), 1000);
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
            <Loading isLoading={isLoadingPonds || isFirstLoad} transparent={!isFirstLoad}>
                <FlatList
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
            </Loading>
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
