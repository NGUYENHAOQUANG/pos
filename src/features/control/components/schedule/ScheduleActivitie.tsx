import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    ImageSourcePropType,
    ActivityIndicator,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import { ScheduleDescriptionTab } from '@/features/control/components/schedule/ScheduleDescriptionTab';
import { ScheduleActivityPill } from '@/features/control/components/schedule/ScheduleActivityPill';
import { useDevices } from '@/features/control/hooks/useDevices';
import { deviceApi } from '@/features/control/api/deviceApi';
import { DeviceData } from '@/features/control/types/control.types';

const FanIcon = require('@/assets/Icon/IconDevices/Fan.png');
const FeederIcon = require('@/assets/Icon/IconDevices/Feeder.png');
const OxyIcon = require('@/assets/Icon/IconDevices/Oxy.png');
const SyphonIcon = require('@/assets/Icon/IconDevices/Syphon.png');
const PumpIcon = require('@/assets/Icon/IconDevices/Pump.png');

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon' | 'pump';

interface DeviceColumnData {
    deviceId: string;
    type: DeviceType;
    name: string;
    index: number;
}

interface ScheduleItem {
    id: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    runDate: string;
}

interface DeviceScheduleData {
    deviceId: string;
    schedules: ScheduleItem[];
}

interface ScheduleActivitieProps {
    pondName?: string;
}

// Device icon mapping
const DEVICE_ICONS: Record<DeviceType, ImageSourcePropType> = {
    fan: FanIcon as ImageSourcePropType,
    feeder: FeederIcon as ImageSourcePropType,
    oxy: OxyIcon as ImageSourcePropType,
    syphon: SyphonIcon as ImageSourcePropType,
    pump: PumpIcon as ImageSourcePropType,
};

// Generate time slots from 00:00 to 23:45 with 15 min intervals
const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
};

const DEFAULT_TIME_SLOTS = generateTimeSlots();
const TIME_COLUMN_WIDTH = 38;
const DEVICE_COLUMN_MIN_WIDTH = 48;
const ROW_HEIGHT = 20;
const SCREEN_WIDTH = Dimensions.get('window').width;
const AVAILABLE_WIDTH = SCREEN_WIDTH - 64; // margins + padding

// Parse "HH:mm:ss" to minutes
const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    return hours * 60 + minutes;
};

// Check if a time slot has activity
const hasActivityForDevice = (time: string, schedules: ScheduleItem[]): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    return schedules.some(schedule => {
        if (!schedule.isActive) return false;
        const startInMinutes = parseTimeToMinutes(schedule.startTime);
        const endInMinutes = parseTimeToMinutes(schedule.endTime);
        return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    });
};

// Sort devices by type order
const DEVICE_TYPE_ORDER: DeviceType[] = ['feeder', 'fan', 'oxy', 'syphon', 'pump'];

const buildDeviceColumns = (devices: DeviceData[]): DeviceColumnData[] => {
    const sorted = [...devices].sort((a, b) => {
        return DEVICE_TYPE_ORDER.indexOf(a.type) - DEVICE_TYPE_ORDER.indexOf(b.type);
    });
    const typeCounters: Record<string, number> = {};
    return sorted.map(device => {
        typeCounters[device.type] = (typeCounters[device.type] || 0) + 1;
        return {
            deviceId: device.id,
            type: device.type,
            name: device.name,
            index: typeCounters[device.type],
        };
    });
};

const getDeviceColor = (type: DeviceType, index: number): string => {
    const colorMap: Record<DeviceType, string[]> = {
        feeder: [colors.primary],
        oxy: [colors.primary],
        fan: [colors.primary],
        syphon: [colors.primary],
        pump: [colors.primary],
    };
    const typeColors = colorMap[type] || [colors.primary];
    return typeColors[(index - 1) % typeColors.length];
};

export const ScheduleActivitie: React.FC<ScheduleActivitieProps> = ({ pondName = 'Ao 1' }) => {
    const [now, setNow] = React.useState(new Date());
    const [deviceSchedules, setDeviceSchedules] = React.useState<DeviceScheduleData[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = React.useState(true);

    // Refs for syncing vertical scroll
    const timeScrollRef = React.useRef<ScrollView>(null);
    const deviceScrollRef = React.useRef<ScrollView>(null);
    const scrollSource = React.useRef<'time' | 'device' | null>(null);

    const { data: ponds = [] } = useDevices();

    const currentPond = React.useMemo(
        () => ponds.find(p => p.name === pondName),
        [ponds, pondName]
    );

    const devices = React.useMemo(() => currentPond?.devices || [], [currentPond]);

    const deviceColumns = React.useMemo(() => buildDeviceColumns(devices), [devices]);

    // Calculate column width
    const deviceColumnWidth = React.useMemo(() => {
        if (deviceColumns.length === 0) return DEVICE_COLUMN_MIN_WIDTH;
        const availableForDevices = AVAILABLE_WIDTH - TIME_COLUMN_WIDTH;
        const calculated = Math.floor(availableForDevices / deviceColumns.length);
        return Math.max(calculated, DEVICE_COLUMN_MIN_WIDTH);
    }, [deviceColumns.length]);

    // Fetch schedules for all devices
    React.useEffect(() => {
        const fetchAllSchedules = async () => {
            if (devices.length === 0) {
                setIsLoadingSchedules(false);
                return;
            }
            setIsLoadingSchedules(true);
            try {
                const results = await Promise.all(
                    devices.map(async device => {
                        try {
                            const response = await deviceApi.getSchedules(device.id);
                            const items = response.data?.data?.items || [];
                            return { deviceId: device.id, schedules: items };
                        } catch {
                            return { deviceId: device.id, schedules: [] };
                        }
                    })
                );
                setDeviceSchedules(results);
            } catch {
                // silently fail
            } finally {
                setIsLoadingSchedules(false);
            }
        };
        fetchAllSchedules();
    }, [devices]);

    // Update current time every minute
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const getDeviceScheduleItems = React.useCallback(
        (deviceId: string): ScheduleItem[] => {
            return deviceSchedules.find(ds => ds.deviceId === deviceId)?.schedules || [];
        },
        [deviceSchedules]
    );

    // Sync vertical scroll between time column and device grid
    const handleTimeVScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrollSource.current === 'device') return;
        scrollSource.current = 'time';
        deviceScrollRef.current?.scrollTo({ y: e.nativeEvent.contentOffset.y, animated: false });
        requestAnimationFrame(() => {
            scrollSource.current = null;
        });
    }, []);

    const handleDeviceVScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrollSource.current === 'time') return;
        scrollSource.current = 'device';
        timeScrollRef.current?.scrollTo({ y: e.nativeEvent.contentOffset.y, animated: false });
        requestAnimationFrame(() => {
            scrollSource.current = null;
        });
    }, []);

    if (isLoadingSchedules && devices.length > 0) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Đang tải lịch trình...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScheduleDescriptionTab type="schedule" />

            {/* Table: 2 columns side by side */}
            <View style={styles.tableContainer}>
                {/* LEFT: Fixed time column */}
                <View style={styles.timeColumnContainer}>
                    {/* Time header placeholder - matches device header height */}
                    <View style={styles.timeColumnHeader} />

                    {/* Time labels */}
                    <ScrollView
                        ref={timeScrollRef}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleTimeVScroll}
                        scrollEventThrottle={16}
                    >
                        {DEFAULT_TIME_SLOTS.map((time, i) => {
                            const isFullHour = time.endsWith(':00');
                            return (
                                <View key={i} style={styles.timeRow}>
                                    <Text
                                        style={[styles.timeText, isFullHour && styles.timeTextBold]}
                                    >
                                        {time}
                                    </Text>
                                    <View style={styles.timeTick} />
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* RIGHT: Horizontally scrollable device area */}
                <View style={styles.deviceAreaContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            {/* Device icons header */}
                            <View style={styles.deviceHeader}>
                                {deviceColumns.map((device, colIndex) => {
                                    const iconColor = getDeviceColor(device.type, device.index);
                                    const iconSource = DEVICE_ICONS[device.type];
                                    return (
                                        <View
                                            key={`h-${colIndex}`}
                                            style={[
                                                styles.deviceColumn,
                                                { width: deviceColumnWidth },
                                            ]}
                                        >
                                            <Image
                                                source={iconSource}
                                                style={styles.deviceIcon}
                                                resizeMode="contain"
                                            />
                                            <Text
                                                style={[styles.deviceCount, { color: iconColor }]}
                                            >
                                                {device.index}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Device grid body */}
                            <ScrollView
                                ref={deviceScrollRef}
                                showsVerticalScrollIndicator={false}
                                onScroll={handleDeviceVScroll}
                                scrollEventThrottle={16}
                            >
                                {DEFAULT_TIME_SLOTS.map((time, rowIndex) => {
                                    const [slotH, slotM] = time.split(':').map(Number);
                                    const slotMin = slotH * 60 + slotM;
                                    const isCurrentSlot =
                                        currentTotalMinutes >= slotMin &&
                                        currentTotalMinutes < slotMin + 15;
                                    const topOffset =
                                        ((currentTotalMinutes - slotMin) / 15) * ROW_HEIGHT;

                                    return (
                                        <View key={rowIndex} style={styles.deviceRow}>
                                            {deviceColumns.map((device, colIndex) => {
                                                const scheduleItems = getDeviceScheduleItems(
                                                    device.deviceId
                                                );
                                                const isActive = hasActivityForDevice(
                                                    time,
                                                    scheduleItems
                                                );
                                                const deviceColor = getDeviceColor(
                                                    device.type,
                                                    device.index
                                                );

                                                const prevTime =
                                                    rowIndex > 0
                                                        ? DEFAULT_TIME_SLOTS[rowIndex - 1]
                                                        : null;
                                                const nextTime =
                                                    rowIndex < DEFAULT_TIME_SLOTS.length - 1
                                                        ? DEFAULT_TIME_SLOTS[rowIndex + 1]
                                                        : null;
                                                const isPrevActive = prevTime
                                                    ? hasActivityForDevice(prevTime, scheduleItems)
                                                    : false;
                                                const isNextActive = nextTime
                                                    ? hasActivityForDevice(nextTime, scheduleItems)
                                                    : false;

                                                return (
                                                    <View
                                                        key={`c-${colIndex}`}
                                                        style={[
                                                            styles.gridCell,
                                                            { width: deviceColumnWidth },
                                                        ]}
                                                    >
                                                        <View style={styles.gridHLine} />
                                                        <View style={styles.gridVLine} />
                                                        <ScheduleActivityPill
                                                            isActive={isActive}
                                                            isPrevActive={isPrevActive}
                                                            isNextActive={isNextActive}
                                                            color={deviceColor}
                                                        />
                                                    </View>
                                                );
                                            })}

                                            {/* Current time indicator */}
                                            {isCurrentSlot && (
                                                <View
                                                    style={[
                                                        styles.currentTimeLine,
                                                        { top: topOffset },
                                                    ]}
                                                />
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Table layout: 2 columns side by side
    tableContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    // Left: time column
    timeColumnContainer: {
        width: TIME_COLUMN_WIDTH,
    },
    timeColumnHeader: {
        height: 52,
    },
    timeRow: {
        height: ROW_HEIGHT,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 6,
        position: 'relative',
    },
    timeText: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    timeTextBold: {
        fontWeight: '600',
        color: colors.text,
    },
    timeTick: {
        position: 'absolute',
        right: 0,
        top: '50%',
        width: 6,
        height: 1,
        backgroundColor: colors.gray[400],
    },

    // Right: device area
    deviceAreaContainer: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: colors.gray[400],
    },
    deviceHeader: {
        flexDirection: 'row',
        height: 52,
    },
    deviceColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: spacing.xs,
        borderRightWidth: 1,
        borderRightColor: colors.gray[400],
    },
    deviceIcon: {
        width: 30,
        height: 30,
    },
    deviceCount: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Device grid rows
    deviceRow: {
        flexDirection: 'row',
        height: ROW_HEIGHT,
        position: 'relative',
    },
    gridCell: {
        height: '100%',
        position: 'relative',
        borderRightWidth: 1,
        borderRightColor: colors.gray[400],
    },
    gridHLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 1,
        backgroundColor: colors.gray[400],
    },
    gridVLine: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        borderLeftWidth: 1,
        borderLeftColor: colors.gray[300],
        borderStyle: 'dashed',
        zIndex: -1,
    },

    currentTimeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: colors.error,
        zIndex: 10,
    },
});
