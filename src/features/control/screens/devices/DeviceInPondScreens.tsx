import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    LayoutChangeEvent,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Image,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';
import { ButtonHistory } from '@/features/control/components/devices/ButtonHistory';
import { DevicesCard } from '@/features/control/components/devices/DevicesCard';
import { colors, spacing } from '@/styles';
import { EControlMode } from '@/features/control/types/control.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { useBottomTabBarHeight } from '@/app/navigation/BottomBarContext';
import { useDevices, useUpdateDeviceMode } from '@/features/control/hooks/useDevices';
import { useDeviceToggle } from '@/features/control/hooks/useDeviceToggle';
import { getDeviceIcon } from '@/features/control/utils/deviceUtils';
import { DeviceInPondSkeleton } from '@/features/control/components/skeleton/DeviceInPondSkeleton';
import InfoPrimaryIcon from '@/assets/Icon/IconDevices/InfoPrimary.svg';
import Toast from 'react-native-toast-message';

interface DevicesInPondScreensProps {}

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const route = useRoute<RouteProp<ControlStackParamList, 'ControlDetail'>>();
    const { pondName = 'Ao 1', isMock = false } = route.params || {};

    const { data: ponds = [], refetch: refetchDevices, isLoading: isLoadingDevices } = useDevices();
    const { updateMode: updateDeviceMode } = useUpdateDeviceMode();

    const { toggleDevice, loadingIds } = useDeviceToggle(ponds);
    const currentPond = React.useMemo(
        () => ponds.find(p => p.name === pondName),
        [ponds, pondName]
    );
    const allDevices = React.useMemo(() => currentPond?.devices || [], [currentPond]);

    // Group devices by type
    const feeders = React.useMemo(() => allDevices.filter(d => d.type === 'feeder'), [allDevices]);
    const fans = React.useMemo(() => allDevices.filter(d => d.type === 'fan'), [allDevices]);
    const oxyDevices = React.useMemo(() => allDevices.filter(d => d.type === 'oxy'), [allDevices]);
    const syphonDevices = React.useMemo(
        () => allDevices.filter(d => d.type === 'syphon'),
        [allDevices]
    );
    const pumpDevices = React.useMemo(
        () => allDevices.filter(d => d.type === 'pump'),
        [allDevices]
    );

    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('feeder');
    const [isReady, setIsReady] = useState(false);

    // Delay heavy render until navigation animation completes
    // Use minimum delay to ensure skeleton is always visible when navigating
    useEffect(() => {
        const rafId = requestAnimationFrame(() => {
            // Add minimum delay so skeleton is visible even when data is cached
            setTimeout(() => {
                setIsReady(true);
            }, 300);
        });
        return () => cancelAnimationFrame(rafId);
    }, []);

    // Scroll sync refs
    const scrollViewRef = useRef<ScrollView>(null);
    const sectionYPositions = useRef<Record<string, number>>({});
    const isTabPress = useRef(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchDevices();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refetchDevices]);

    const bottomBarHeight = useBottomTabBarHeight();

    // Device type sections config (only sections with devices)
    const deviceSections = React.useMemo(() => {
        const allSections = [
            { key: 'feeder', title: 'Máy cho ăn', devices: feeders },
            { key: 'fan', title: 'Quạt nước', devices: fans },
            { key: 'oxy', title: 'Máy Oxy', devices: oxyDevices },
            { key: 'syphon', title: 'Syphon', devices: syphonDevices },
            { key: 'pump', title: 'Máy bơm', devices: pumpDevices },
        ];
        return allSections.filter(s => s.devices.length > 0);
    }, [feeders, fans, oxyDevices, syphonDevices, pumpDevices]);

    // HeadingBar tabs from available sections
    const headingTabs = React.useMemo(
        () => deviceSections.map(s => ({ key: s.key, label: s.title })),
        [deviceSections]
    );

    // Auto-select first available tab
    React.useEffect(() => {
        if (deviceSections.length > 0 && !deviceSections.find(s => s.key === selectedTab)) {
            setSelectedTab(deviceSections[0].key);
        }
    }, [deviceSections, selectedTab]);

    // Track section Y positions via onLayout
    const handleSectionLayout = useCallback((key: string, event: LayoutChangeEvent) => {
        sectionYPositions.current[key] = event.nativeEvent.layout.y;
    }, []);

    // On tab press, scroll to section
    const handleTabSelect = useCallback((tabKey: string) => {
        setSelectedTab(tabKey);
        const y = sectionYPositions.current[tabKey];
        if (y !== undefined && scrollViewRef.current) {
            isTabPress.current = true;
            scrollViewRef.current.scrollTo({ y, animated: true });
            // Reset flag after animation
            setTimeout(() => {
                isTabPress.current = false;
            }, 500);
        }
    }, []);

    // On scroll, detect visible section and update tab
    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (isTabPress.current) return; // Skip during programmatic scroll

            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            const scrollY = contentOffset.y;

            // Check if scrolled to bottom (within 20px threshold)
            const isAtBottom = scrollY + layoutMeasurement.height >= contentSize.height - 20;

            if (isAtBottom && deviceSections.length > 0) {
                // At bottom, select last section
                const lastKey = deviceSections[deviceSections.length - 1].key;
                setSelectedTab(prev => (prev !== lastKey ? lastKey : prev));
                return;
            }

            const offset = 100; // Threshold offset for detecting active section
            let activeKey = deviceSections[0]?.key || 'feeder';

            for (let i = deviceSections.length - 1; i >= 0; i--) {
                const sectionY = sectionYPositions.current[deviceSections[i].key];
                if (sectionY !== undefined && scrollY + offset >= sectionY) {
                    activeKey = deviceSections[i].key;
                    break;
                }
            }

            setSelectedTab(prev => (prev !== activeKey ? activeKey : prev));
        },
        [deviceSections]
    );

    // Show Custom Feeding Machine Screen
    const handleSettingsPress = React.useCallback(
        (id: string) => {
            const selectedDevice = allDevices.find(d => d.id === id);

            if (selectedDevice?.mode === EControlMode.LOCAL) {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể cấu hình thiết bị này',
                });
                return;
            }

            const initialMode =
                selectedDevice?.mode === EControlMode.SCHEDULE ? 'schedule' : 'manual';

            navigation.navigate('CustomFeedingMachine', {
                initialMode,
                deviceId: id,
                pondName,
                pondId: currentPond?.id || '',
            });
        },
        [allDevices, currentPond, navigation, pondName]
    );

    const handleToggleDevice = React.useCallback(
        (id: string, isOn: boolean) => {
            if (currentPond) {
                toggleDevice(currentPond.id, id, isOn);
            }
        },
        [currentPond, toggleDevice]
    );

    const _handleModeToggle = React.useCallback(
        (id: string) => {
            if (!currentPond) return;
            const device = allDevices.find(d => d.id === id);
            if (device) {
                if (device.mode === EControlMode.LOCAL) return;
                const newMode =
                    device.mode === EControlMode.SCHEDULE
                        ? EControlMode.MANUAL
                        : EControlMode.SCHEDULE;
                updateDeviceMode(currentPond.id, id, newMode);
            }
        },
        [currentPond, allDevices, updateDeviceMode]
    );

    // Loading state - show skeleton
    if (isLoadingDevices || !isReady || refreshing) {
        return (
            <View style={styles.container}>
                <HeaderSection
                    title={`Thiết Bị - ${pondName}`}
                    onBack={() => navigation.goBack()}
                />
                <DeviceInPondSkeleton />
            </View>
        );
    }

    // Read-only view for mock ponds
    if (isMock) {
        return (
            <View style={styles.container}>
                <HeaderSection
                    title={`Thiết Bị - ${pondName}`}
                    onBack={() => navigation.goBack()}
                />

                {headingTabs.length > 1 && (
                    <HeadingBar
                        tabs={headingTabs}
                        selectedTab={selectedTab}
                        onTabSelect={handleTabSelect}
                        containerStyle={styles.headingBar}
                        flexTabs={false}
                    />
                )}

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={[
                        styles.content,
                        { paddingBottom: bottomBarHeight + 40 },
                    ]}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {/* Info notice for mock devices */}
                    <View style={styles.mockInfoBox}>
                        <InfoPrimaryIcon width={20} height={20} />
                        <Text style={styles.mockInfoText}>
                            {
                                'Thiết bị không điều khiển qua App\nVui lòng thao tác trực tiếp trên thiết bị khi sử dụng'
                            }
                        </Text>
                    </View>

                    {deviceSections.map(section => (
                        <View
                            key={section.key}
                            onLayout={e => handleSectionLayout(section.key, e)}
                            style={styles.mockSection}
                        >
                            <Text style={styles.mockSectionTitle}>{section.title}</Text>
                            {section.devices.map(device => {
                                const iconSource = getDeviceIcon(device.type);
                                return (
                                    <View key={device.id} style={styles.mockDeviceCard}>
                                        <View style={styles.mockIconContainer}>
                                            <Image
                                                source={iconSource}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <View style={styles.mockDeviceInfo}>
                                            <Text style={styles.mockDeviceName}>{device.name}</Text>
                                            <Text style={styles.mockDeviceType}>
                                                {section.title}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <HeaderSection title={`Thiết Bị - ${pondName}`} onBack={() => navigation.goBack()} />

            {/* Fixed top sections */}
            <View style={styles.historySection}>
                <ButtonHistory
                    onSchedulePress={() => navigation.navigate('Schedule', { pondName })}
                    onStatisticPress={() => navigation.navigate('History', { pondName })}
                    style={styles.historyButton}
                />
            </View>

            {/* HeadingBar for device type tabs - fixed */}
            {headingTabs.length > 1 && (
                <HeadingBar
                    tabs={headingTabs}
                    selectedTab={selectedTab}
                    onTabSelect={handleTabSelect}
                    containerStyle={styles.headingBar}
                    flexTabs={false}
                />
            )}

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[styles.content, { paddingBottom: bottomBarHeight + 40 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Device Sections grouped by type */}
                {deviceSections.map(section => (
                    <View key={section.key} onLayout={e => handleSectionLayout(section.key, e)}>
                        <DevicesCard
                            title={section.title}
                            devices={section.devices}
                            onSettingsPress={handleSettingsPress}
                            onToggle={handleToggleDevice}
                            style={styles.sectionCard}
                            loadingIds={loadingIds}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        padding: spacing.md,
    },
    historySection: {
        marginBottom: spacing.md,
        paddingTop: 16,
    },
    historyButton: {
        borderRadius: 0,
        borderBottomWidth: 0,
    },
    headingBar: {
        marginBottom: 16,
    },
    sectionCard: {
        marginBottom: 20,
    },
    mockSection: {
        marginBottom: 24,
    },
    mockSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    mockDeviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
    },
    mockIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mockDeviceInfo: {
        flex: 1,
    },
    mockDeviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    mockDeviceType: {
        fontSize: 13,
        color: colors.gray[500],
        marginTop: 2,
    },
    mockInfoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    mockInfoText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        fontWeight: 400,
    },
});
