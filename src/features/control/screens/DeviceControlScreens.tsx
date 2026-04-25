import React, { useMemo, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { useNetInfo } from '@react-native-community/netinfo';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { DevicesStatus } from '@/features/control/components/DevicesStatus';
import { PondCard } from '@/features/control/components/devices/PondCard';
import {
    HelpOptionsModal,
    HelpOptionsModalRef,
} from '@/features/control/components/HelpOptionsModal';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import {
    useNavigation,
    useScrollToTop,
    useFocusEffect,
    useIsFocused,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useDevices } from '@/features/control/hooks/useDevices';
import { Zone } from '@/features/farm/types/farm.types';
import { DeviceControlSkeleton } from '@/features/control/components/skeleton/DeviceControlSkeleton';
import { useZones, useAllPondsByZone } from '@/features/farm/hooks';

import { useFarmStore } from '@/features/farm/store/farmStore';
import { CameraList } from '@/features/control/components/camera/CameraList';
import { CameraItem } from '@/features/control/api/cameraApi';

/** Stable key extractor - defined outside component to prevent re-creation */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keyExtractor = (item: any) => item.id.toString();

/** Camera layout mode */
type CameraViewMode = 'grid' | 'list';

/** Fade animation durations (ms) */
const FADE_OUT_DURATION = 120;
const FADE_IN_DURATION = 180;

export const DeviceControlScreens = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
    const helpModalRef = useRef<HelpOptionsModalRef>(null);

    const [selectedAppTab, setSelectedAppTab] = useState('thiet-bi');
    const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>('grid');
    const moreButtonRef = useRef<View>(null);

    // Reanimated opacity for smooth camera list fade transition
    const cameraListOpacity = useSharedValue(1);
    const cameraListAnimStyle = useAnimatedStyle(() => ({
        opacity: cameraListOpacity.value,
    }));

    /** Fade animation durations (ms) */
    const SETTLE_DELAY = 150; // Wait for RTCView to re-render at new size

    /** Toggle viewMode with fade out → switch → wait → fade in to avoid RTCView black flash */
    const handleToggleViewMode = useCallback(() => {
        const applyNewMode = () => {
            setCameraViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
            // Delay fade-in so RTCView has time to settle at new dimensions
            setTimeout(() => {
                cameraListOpacity.value = withTiming(1, { duration: FADE_IN_DURATION });
            }, SETTLE_DELAY);
        };

        cameraListOpacity.value = withTiming(0, { duration: FADE_OUT_DURATION }, finished => {
            if (finished) {
                runOnJS(applyNewMode)();
            }
        });
    }, [cameraListOpacity]);

    // Track previous zone to detect switches
    const prevFarmIdRef = useRef<string | undefined>(selectedFarm?.id);

    // Get ALL Ponds via React Query based on selected Farm
    const {
        data: pondsData,
        isLoading: isLoadingPonds,
        refetch,
        isRefetching,
    } = useAllPondsByZone(selectedZoneId!);

    // Ensure valid array
    const farmPonds = useMemo(() => {
        if (!pondsData || pondsData.length === 0) return [];
        return pondsData;
    }, [pondsData]);

    // Device Data from React Query (API)
    const isFocused = useIsFocused();
    const { data: devicePonds = [], isRefetching: isRefetchingDevices } = useDevices({
        refetchInterval: isFocused ? 10000 : false,
    });

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
    const flatListRef = useRef<FlatList>(null);
    useScrollToTop(flatListRef as any);
    useFocusEffect(
        useCallback(() => {
            return () => {
                helpModalRef.current?.close();
            };
        }, [])
    );
    React.useEffect(() => {
        if (selectedFarm?.id) {
            prevFarmIdRef.current = selectedFarm.id;
        }
    }, [selectedFarm]);
    const { isConnected } = useNetInfo();
    const showSkeleton =
        isLoadingZones ||
        !selectedFarm ||
        isLoadingPonds ||
        (!!isConnected && isRefetching && !isRefetchingDevices);

    const handleRefresh = async () => {
        await refetch();
    };

    const handleHelpPress = (position: { x: number; y: number; width: number; height: number }) => {
        helpModalRef.current?.open(position);
    };

    const filteredPonds = useMemo(() => {
        if (!selectedFarm || !farmPonds) return [];

        // Separate API device ponds from mock ponds
        const apiDevicePonds = devicePonds.filter(p => !p.id?.startsWith('mock-'));
        const mockDevicePonds = devicePonds.filter(p => p.id?.startsWith('mock-'));

        // Map farm ponds - match API first, then mock by name
        const farmPondNames = new Set<string>();
        const mappedPonds = farmPonds.map((realPond: any) => {
            farmPondNames.add(realPond.name);

            // Try API device data first, then mock
            const apiPond = apiDevicePonds.find(p => p.name === realPond.name);
            const mockPond = mockDevicePonds.find(p => p.name === realPond.name);
            const devicePond = apiPond || mockPond;
            const isMock = !apiPond && !!mockPond;

            return {
                id: isMock ? mockPond!.id : realPond.id,
                name: realPond.name,
                hasDevices: devicePond?.hasDevices ?? false,
                devices: devicePond?.devices ?? [],
                deviceStats: devicePond?.deviceStats,
            };
        });

        // Append mock ponds whose names don't exist in farm
        const extraMockPonds = mockDevicePonds.filter(p => !farmPondNames.has(p.name));
        const allPonds = [...mappedPonds, ...extraMockPonds];

        // Sort: devices-first, then by category, then alphabetically
        return allPonds.sort((a, b) => {
            // Primary: ponds with devices first
            if (a.hasDevices !== b.hasDevices) return a.hasDevices ? -1 : 1;

            // Secondary: by category
            const getPriority = (name: string): number => {
                const prefix = name.replace(/^Ao\s+/i, '');
                if (prefix.startsWith('V')) return 0;
                if (prefix.startsWith('N')) return 1;
                if (prefix.startsWith('SS')) return 2;
                if (prefix.startsWith('XL')) return 3;
                if (prefix.startsWith('L')) return 4;
                if (prefix.startsWith('T')) return 5;
                return 99;
            };
            const pA = getPriority(a.name);
            const pB = getPriority(b.name);
            if (pA !== pB) return pA - pB;
            return a.name.localeCompare(b.name);
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
                (stats.syphon.warning || 0) +
                (stats.pump?.warning || 0)
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

    const handlePondDetail = useCallback(
        (pondName: string, isMock: boolean) => {
            navigation.navigate('ControlDetail', {
                pondName,
                isMock,
            });
        },
        [navigation]
    );

    const renderPondCard = useCallback(
        ({ item }: { item: (typeof filteredPonds)[number] }) => {
            const isMock = item.id.startsWith('mock-');
            return (
                <PondCard
                    pondName={item.name}
                    isEmpty={!item.hasDevices}
                    deviceStats={item.deviceStats}
                    compact={isMock}
                    onPressDetail={() => handlePondDetail(item.name, isMock)}
                />
            );
        },
        [handlePondDetail]
    );

    const ListHeader = useMemo(() => {
        if (!showStats) return null;
        return (
            <>
                <DevicesStatus
                    totalPonds={filteredPonds.length}
                    activePonds={totalStats.active}
                    warningPonds={totalStats.warning}
                    otherPonds={totalStats.other}
                />
                <View style={styles.spacer} />
            </>
        );
    }, [
        showStats,
        filteredPonds.length,
        totalStats.active,
        totalStats.warning,
        totalStats.other,
        styles.spacer,
    ]);

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Điều Khiển Thiết Bị"
                titleAlign="left"
                showBackButton={false}
                hideLeftSpace={true}
                onRightPress={selectedAppTab === 'camera' ? handleToggleViewMode : undefined}
                rightIcon={
                    selectedAppTab === 'camera' ? (
                        <Ionicons
                            name={cameraViewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                            size={22}
                            color={theme.text}
                        />
                    ) : undefined
                }
            />
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
                            showIcon={false}
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
                            keyExtractor={keyExtractor}
                            renderItem={renderPondCard}
                            style={styles.content}
                            contentContainerStyle={[
                                styles.scrollContent,
                                styles.scrollContentPadding,
                            ]}
                            ListHeaderComponent={ListHeader}
                            initialNumToRender={4}
                            maxToRenderPerBatch={4}
                            windowSize={3}
                            removeClippedSubviews={true}
                            updateCellsBatchingPeriod={100}
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
                <Animated.View style={[{ flex: 1 }, cameraListAnimStyle]}>
                    <CameraList
                        viewMode={cameraViewMode}
                        onCameraPress={(camera: CameraItem) => {
                            navigation.navigate('CameraDetail', { camera });
                        }}
                    />
                </Animated.View>
            )}

            <HelpOptionsModal
                ref={helpModalRef}
                onPressUserManual={() => {
                    helpModalRef.current?.close();
                    navigation.navigate('GeneralUserManual');
                }}
                onPressDeviceExplanation={() => {
                    helpModalRef.current?.close();
                    navigation.navigate('UserManual');
                }}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        headerContainer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: 'transparent',
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
        },
        viewToggleButton: {
            width: 40,
            height: 40,
            borderRadius: 30,
            backgroundColor: theme.backgroundTertiary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headingBarContainer: {
            marginBottom: 16,
        },
        filterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            marginBottom: 16,
            gap: 12,
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
