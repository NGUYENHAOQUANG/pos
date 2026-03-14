import React, { useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';
import { MoreButton } from '@/shared/components/buttons/MoreButton';

import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { DevicesStatus } from '@/features/control/components/DevicesStatus';
import { PondCard } from '@/features/control/components/devices/PondCard';
import { HelpOptionsModal } from '../components/HelpOptionsModal';
import { colors, spacing } from '@/styles';
import { useNavigation, useScrollToTop, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useDevices } from '@/features/control/hooks/useDevices';
import { Zone } from '@/features/farm/types/farm.types';
import { DeviceControlSkeleton } from '@/features/control/components/skeleton/DeviceControlSkeleton';
import { useZones, usePondsByZone } from '@/features/farm/hooks';

import { useFarmStore } from '@/features/farm/store/farmStore';
import { CameraList } from '@/features/control/components/camera/CameraList';
import { CameraData } from '@/features/control/data/camerasData';

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const insets = useSafeAreaInsets();

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

    const [selectedAppTab, setSelectedAppTab] = useState('thiet-bi');
    const moreButtonRef = useRef<View>(null);

    // Track previous zone to detect switches
    const prevFarmIdRef = useRef<string | undefined>(selectedFarm?.id);

    // Get Ponds via React Query based on selected Farm
    const {
        data: pondsData,
        isLoading: isLoadingPonds,
        refetch,
        isRefetching,
    } = usePondsByZone(selectedZoneId);

    // Flatten pagination data and ensure valid array
    const farmPonds = useMemo(() => {
        if (!pondsData || pondsData.length === 0) return [];
        return pondsData;
    }, [pondsData]);

    // Device Data from React Query (API)
    const { data: devicePonds = [], isRefetching: isRefetchingDevices } = useDevices();

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
        if (zones.length > 0 && !selectedZoneId) {
            const targetZone = zones.find(z => z.name === 'Trại Kiên Giang') || zones[0];
            if (targetZone) {
                setSelectedZoneId(String(targetZone.id));
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
        (!!isConnected && isRefetching && !isRefetchingDevices);

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
            // Find corresponding device data from React Query
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
        // No pagination logic needed for now
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>Điều Khiển Thiết Bị</Text>
            </View>
            <HeadingBar
                tabs={[
                    { key: 'thiet-bi', label: 'Thiết bị' },
                    { key: 'camera', label: 'Camera' },
                ]}
                selectedTab={selectedAppTab}
                onTabSelect={setSelectedAppTab}
                flexTabs={true}
                containerStyle={styles.headingBarContainer}
            />
            {selectedAppTab === 'thiet-bi' && (
                <View style={styles.filterRow}>
                    <View style={styles.dropdownStyle}>
                        <DropdownHeaderButton
                            data={farmLocations.map(loc => ({
                                id: loc.id,
                                label: loc.name,
                                value: loc,
                            }))}
                            value={
                                selectedFarm
                                    ? {
                                          id: selectedFarm.id,
                                          label: selectedFarm.name,
                                          value: selectedFarm,
                                      }
                                    : undefined
                            }
                            onSelect={(item: DropDownHeaderItem) => {
                                if (item.value) {
                                    setSelectedZoneId(item.value.id);
                                }
                            }}
                            showIcon={true}
                            height={40}
                            borderRadius={12}
                        />
                    </View>
                    <View ref={moreButtonRef} collapsable={false}>
                        <MoreButton
                            onPress={() => {
                                moreButtonRef.current?.measureInWindow((x, y, width, height) => {
                                    handleHelpPress({ x, y, width, height });
                                });
                            }}
                        />
                    </View>
                </View>
            )}
            {selectedAppTab === 'thiet-bi' ? (
                <>
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
                                        navigation.navigate('ControlDetail', {
                                            pondName: item.name,
                                        })
                                    }
                                    onAddDevice={() => handleConnectDevice(item.name)}
                                />
                            )}
                            style={styles.content}
                            contentContainerStyle={[
                                styles.scrollContent,
                                styles.scrollContentPadding,
                            ]}
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
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={handleRefresh}
                                />
                            }
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                        />
                    )}
                </>
            ) : (
                <CameraList
                    onCameraPress={(camera: CameraData) => {
                        navigation.navigate('CameraPlayer', {
                            videoUrl: camera.videoUrl,
                            cameraName: camera.cameraName,
                            pondName: camera.pondName,
                        });
                    }}
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
    headerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    headingBarContainer: {
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: 16,
        gap: 12, // React Native >= 0.71 supports gap
    },
    dropdownStyle: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
        flexGrow: 1,
    },
    scrollContentPadding: {
        paddingTop: 0,
    },
    spacer: {
        height: 16,
    },
});
