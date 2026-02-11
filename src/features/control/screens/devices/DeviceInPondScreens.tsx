import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    TouchableHighlight,
    Platform,
    Dimensions,
    RefreshControl,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import { HeaderDevices } from '../../components/HeaderDevices';
import { ButtonHistory } from '../../components/devices/ButtonHistory';
import { DevicesCard } from '../../components/devices/DevicesCard';
import { colors, spacing, borderRadius } from '@/styles';
import { EControlMode, DeviceData } from '../../types/control.types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ControlStackParamList } from '../../navigation/ControlNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useControl } from '../../store/controlStore';
import { useDeviceToggle } from '../../hooks/useDeviceToggle';
import Toast from 'react-native-toast-message';

// Removed Mocks

interface DevicesInPondScreensProps {
    // onBack?: () => void;
    // pondName?: string;
}

export const DevicesInPondScreens: React.FC<DevicesInPondScreensProps> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ControlStackParamList>>();
    const route = useRoute<RouteProp<ControlStackParamList, 'ControlDetail'>>();
    const { pondName = 'Ao 1' } = route.params || {};

    const { ponds, updateDeviceMode, fetchIoTDevices } = useControl();

    React.useEffect(() => {
        if (pondName === 'Ao IOT') {
            fetchIoTDevices(); // Fetch immediately
            const interval = setInterval(() => {
                fetchIoTDevices();
            }, 200000);

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [pondName, fetchIoTDevices]);
    const { toggleDevice, loadingIds } = useDeviceToggle();
    const currentPond = React.useMemo(
        () => ponds.find(p => p.name === pondName),
        [ponds, pondName]
    );
    const allDevices = React.useMemo(() => currentPond?.devices || [], [currentPond]);

    const feeders = React.useMemo(() => allDevices.filter(d => d.type === 'feeder'), [allDevices]);
    const otherDevices = React.useMemo(
        () => allDevices.filter(d => d.type !== 'feeder'),
        [allDevices]
    );

    const [showAddPopup, setShowAddPopup] = useState(false);
    const [buttonPosition, setButtonPosition] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>({ x: 0, y: 0, width: 0, height: 0 });
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const buttonRef = useRef<View>(null);
    const isMeasuring = useRef(false);
    const lastPosition = useRef<{ x: number; y: number; width: number; height: number } | null>(
        null
    );
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            if (pondName === 'Ao IOT') {
                await fetchIoTDevices();
            } else {
                // Mock delay for other ponds
                await new Promise(resolve => setTimeout(() => resolve(true), 1000));
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [pondName, fetchIoTDevices]);

    const rotation = useSharedValue(0);
    const overlayAnimation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withTiming(showAddPopup ? 1 : 0, { duration: 250 });
    }, [showAddPopup, rotation]);

    React.useEffect(() => {
        if (showAddPopup) {
            setIsOverlayVisible(true);
            overlayAnimation.value = withTiming(1, { duration: 250 });
        } else {
            overlayAnimation.value = withTiming(0, { duration: 200 }, finished => {
                if (finished) {
                    runOnJS(setIsOverlayVisible)(false);
                }
            });
        }
    }, [showAddPopup, overlayAnimation]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const rotate = interpolate(rotation.value, [0, 1], [0, 45]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    const animatedMenuStyle = useAnimatedStyle(() => {
        const opacity = interpolate(overlayAnimation.value, [0, 1], [0, 1], Extrapolation.CLAMP);
        const scale = interpolate(overlayAnimation.value, [0, 1], [0.95, 1], Extrapolation.CLAMP);
        const translateY = interpolate(
            overlayAnimation.value,
            [0, 1],
            [-10, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ scale }, { translateY }],
        };
    });

    const handleAddButtonPress = () => {
        if (isMeasuring.current) return;

        if (lastPosition.current && showAddPopup) {
            setButtonPosition(lastPosition.current);
            setShowAddPopup(!showAddPopup);
            return;
        }

        isMeasuring.current = true;
        buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
            isMeasuring.current = false;
            const position = {
                x: pageX || 0,
                y: pageY || 0,
                width: width || 0,
                height: height || 0,
            };
            lastPosition.current = position;
            setButtonPosition(position);
            setShowAddPopup(!showAddPopup);
        });
    };

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

    const handleSwitchAll = React.useCallback(
        (devicesList: DeviceData[], mode: EControlMode) => {
            if (!currentPond) return;
            devicesList.forEach(d => {
                if (d.mode === EControlMode.LOCAL) return;
                updateDeviceMode(currentPond.id, d.id, mode);
            });

            Toast.show({
                type: 'success',
                text1:
                    mode === EControlMode.SCHEDULE
                        ? 'Đã chuyển tất cả sang Lịch trình'
                        : 'Đã chuyển tất cả sang Thủ công',
            });
        },
        [currentPond, updateDeviceMode]
    );

    const handleModeToggle = React.useCallback(
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

    const renderRightHeader = () => (
        <View style={styles.headerRightContainer}>
            <TouchableOpacity
                ref={buttonRef}
                style={[styles.addButton, showAddPopup && styles.addButtonActive]}
                onPress={handleAddButtonPress}
                activeOpacity={0.7}
            >
                <Animated.View style={animatedIconStyle}>
                    <Ionicons name="add" size={24} color={colors.text} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );

    const renderPopupOverlay = () => {
        if (!isOverlayVisible && !showAddPopup) return null;

        // Calculate right position from screen width
        const { width: SCREEN_WIDTH } = Dimensions.get('window');
        const calculatedRight = buttonPosition?.x
            ? SCREEN_WIDTH - buttonPosition.x - buttonPosition.width
            : spacing.md;
        const menuTop = buttonPosition?.y ? buttonPosition.y + buttonPosition.height + 8 : 60;

        return (
            <View style={styles.absoluteOverlay} pointerEvents={showAddPopup ? 'auto' : 'none'}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={() => setShowAddPopup(false)}
                    activeOpacity={1}
                />

                <Animated.View
                    style={[
                        styles.popupContainer,
                        animatedMenuStyle,
                        {
                            top: menuTop,
                            right: calculatedRight,
                        },
                    ]}
                >
                    <TouchableHighlight
                        style={styles.popupItem}
                        underlayColor={colors.gray[100]}
                        onPress={() => {
                            setShowAddPopup(false);
                            setTimeout(() => {
                                navigation.navigate('ConnectDevice', { pondName });
                            }, 50);
                        }}
                    >
                        <Text style={styles.popupText}>Thêm thiết bị</Text>
                    </TouchableHighlight>
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderDevices
                title={`Thiết Bị - ${pondName}`}
                onBackPress={() => navigation.goBack()}
                rightComponent={renderRightHeader()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* History Buttons Section */}
                <View style={styles.historySection}>
                    <ButtonHistory
                        onSchedulePress={() => navigation.navigate('Schedule', { pondName })}
                        onStatisticPress={() => navigation.navigate('History', { pondName })}
                        style={styles.historyButton}
                    />
                </View>

                {/* Feeder Section */}
                <DevicesCard
                    title="Máy cho ăn"
                    devices={feeders}
                    layout="grid"
                    onSettingsPress={handleSettingsPress}
                    onSwitchToSchedule={() => handleSwitchAll(feeders, EControlMode.SCHEDULE)}
                    onSwitchToManual={() => handleSwitchAll(feeders, EControlMode.MANUAL)}
                    onModePress={handleModeToggle}
                    onToggle={handleToggleDevice}
                    style={styles.extendedCard}
                    loadingIds={loadingIds}
                />

                {/* Other Devices Section */}
                <DevicesCard
                    title="Thiết bị khác"
                    devices={otherDevices}
                    layout="grid"
                    onSettingsPress={handleSettingsPress}
                    onSwitchToSchedule={() => handleSwitchAll(otherDevices, EControlMode.SCHEDULE)}
                    onSwitchToManual={() => handleSwitchAll(otherDevices, EControlMode.MANUAL)}
                    onModePress={handleModeToggle}
                    onToggle={handleToggleDevice}
                    style={styles.extendedCard}
                    loadingIds={loadingIds}
                />
            </ScrollView>

            {renderPopupOverlay()}
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
        paddingBottom: 40,
    },
    historySection: {
        marginBottom: spacing.md,
        marginHorizontal: -spacing.md,
    },
    historyButton: {
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    extendedCard: {
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
    },
    headerRightContainer: {
        zIndex: 1001,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    addButtonActive: {
        borderColor: colors.primary,
    },
    absoluteOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2000,
        elevation: 2000,
    },
    popupContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.xs,
        minWidth: 140,
        zIndex: 1001,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    popupItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
    },
    popupText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '400',
    },
});
