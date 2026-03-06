import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';
import { ScheduleDescriptionTab } from './ScheduleDescriptionTab';
import { ScheduleActivityPill } from './ScheduleActivityPill';
import { SvgProps } from 'react-native-svg';

import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon';

// Control mode types for background colors
type ControlMode = 'remote' | 'schedule' | 'local';

export interface ModeSlot {
    startTime: string;
    endTime: string;
    mode: ControlMode;
}

interface ActivitySlot {
    startTime: string; // HH:mm
    endTime: string;
}

interface DeviceColumnData {
    type: DeviceType;
    count: number;
    activities?: ActivitySlot[];
    modeHistory?: ModeSlot[];
    color?: string;
}

interface HistoryActivitieProps {
    devices?: DeviceColumnData[];
}

// Device icon mapping
const DEVICE_ICONS: Record<DeviceType, React.FC<SvgProps>> = {
    fan: FanIcon,
    feeder: FeederIcon,
    oxy: OxyIcon,
    syphon: SyphonIcon,
};

// Generate time slots from 00:00 to 24:00 with 15 min intervals
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

// Check if a time slot has activity
const hasActivity = (time: string, activities: ActivitySlot[] = []): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    return activities.some(activity => {
        const [startH, startM] = activity.startTime.split(':').map(Number);
        const [endH, endM] = activity.endTime.split(':').map(Number);
        const startInMinutes = startH * 60 + startM;
        const endInMinutes = endH * 60 + endM;
        return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    });
};

const DEFAULT_DEVICES: DeviceColumnData[] = [];

// Helper to convert time "HH:mm" to minutes
const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

// Start Helper to get background color based on device mode history
const getBackgroundColor = (device: DeviceColumnData, time: string): string => {
    if (!device.modeHistory || device.modeHistory.length === 0) {
        // Default fallback
        return colors.white; // Or some default
    }

    const slotMinutes = timeToMinutes(time);

    // Find the mode that covers this time slot
    const activeMode = device.modeHistory.find(slot => {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        return slotMinutes >= start && slotMinutes < end;
    });

    if (!activeMode) return colors.white;

    switch (activeMode.mode) {
        case 'remote':
            return colors.schedule.remote;
        case 'schedule':
            return colors.schedule.schedule;
        case 'local':
            return colors.schedule.local;
        default:
            return colors.white;
    }
};
// End Helper

export const HistoryActivitie: React.FC<HistoryActivitieProps> = ({
    devices = DEFAULT_DEVICES,
}) => {
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return (
        <View style={styles.container}>
            {/* Legend Component */}
            <ScheduleDescriptionTab type="history" />

            {/* Schedule table */}
            <View style={styles.tableContainer}>
                {/* Header with device icons */}
                <View style={styles.header}>
                    <View style={styles.timeColumnHeader} />
                    {devices.map((device, index) => {
                        const iconColor = device.color || colors.primary;
                        const Icon = DEVICE_ICONS[device.type];
                        return (
                            <View key={index} style={styles.deviceColumn}>
                                <Icon width={32} height={32} color={iconColor} />
                                <Text style={[styles.deviceCount, { color: iconColor }]}>
                                    {device.count}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Time slots with activities */}
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {DEFAULT_TIME_SLOTS.map((time, index) => {
                        const isFullHour = time.endsWith(':00');

                        // Check if this slot contains the current time
                        const [slotHour, slotMinute] = time.split(':').map(Number);
                        const slotTotalMinutes = slotHour * 60 + slotMinute;
                        const isCurrentSlot =
                            currentTotalMinutes >= slotTotalMinutes &&
                            currentTotalMinutes < slotTotalMinutes + 15;

                        // Calculate top offset: (minutes into slot / 15) * 20 (height)
                        const minutesIntoSlot = currentTotalMinutes - slotTotalMinutes;
                        const topOffset = (minutesIntoSlot / 15) * 20;

                        return (
                            <View key={index} style={styles.timeRow}>
                                {/* Time label column with tick */}
                                <View style={styles.timeColumn}>
                                    <Text
                                        style={[styles.timeText, isFullHour && styles.timeTextBold]}
                                    >
                                        {time}
                                    </Text>
                                    <View style={styles.timeTick} />
                                </View>

                                {/* Device columns (grid cells) */}
                                {devices.map((device, deviceIndex) => {
                                    // Per-device activity logic
                                    const deviceActivities = device.activities || [];
                                    const showIndicator = hasActivity(time, deviceActivities);

                                    // Dynamic background color
                                    const backgroundColor = getBackgroundColor(device, time);

                                    // Check neighbors for connectivity AND same background color
                                    const prevTime =
                                        index > 0 ? DEFAULT_TIME_SLOTS[index - 1] : null;
                                    const nextTime =
                                        index < DEFAULT_TIME_SLOTS.length - 1
                                            ? DEFAULT_TIME_SLOTS[index + 1]
                                            : null;

                                    const prevBg = prevTime
                                        ? getBackgroundColor(device, prevTime)
                                        : null;
                                    const nextBg = nextTime
                                        ? getBackgroundColor(device, nextTime)
                                        : null;

                                    // Active if neighbors have activity AND same background color
                                    const isPrevActive = prevTime
                                        ? hasActivity(prevTime, deviceActivities) &&
                                          prevBg === backgroundColor
                                        : false;
                                    const isNextActive = nextTime
                                        ? hasActivity(nextTime, deviceActivities) &&
                                          nextBg === backgroundColor
                                        : false;

                                    return (
                                        <View key={deviceIndex} style={styles.gridCell}>
                                            {/* Background Layer */}
                                            <View
                                                style={[styles.cellBackground, { backgroundColor }]}
                                            />

                                            {/* Grid Lines */}
                                            <View style={styles.horizontalLine} />
                                            <View style={styles.dashedLine} />

                                            {/* Render indicator for ALL devices now */}
                                            <ScheduleActivityPill
                                                isActive={showIndicator}
                                                isPrevActive={isPrevActive}
                                                isNextActive={isNextActive}
                                            />
                                        </View>
                                    );
                                })}

                                {/* Current time line - Absolute over the whole row if this is the current slot */}
                                {isCurrentSlot && (
                                    <View style={[styles.currentTimeLine, { top: topOffset }]} />
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tableContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'stretch', // Ensure vertical lines connect
    },
    timeColumnHeader: {
        width: 60,
        borderRightWidth: 1,
        borderRightColor: colors.gray[300],
    },
    deviceColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.gray[300],
        paddingBottom: spacing.sm,
    },
    deviceIcon: {
        width: 32,
        height: 32,
        marginBottom: 4,
    },
    deviceCount: {
        fontSize: 13,
        fontWeight: '500',
    },
    scrollContainer: {
        flex: 1,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
        position: 'relative',
    },
    timeColumn: {
        width: 60,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: colors.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    timeText: {
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    timeTick: {
        position: 'absolute',
        right: 0,
        top: '50%',
        width: 6,
        height: 1,
        backgroundColor: colors.gray[300],
    },
    timeTextBold: {
        fontWeight: '600',
        color: colors.text,
    },
    gridCell: {
        flex: 1,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: colors.gray[400],
        position: 'relative',
    },
    horizontalLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 1,
        backgroundColor: colors.gray[400],
        zIndex: -1,
    },
    dashedLine: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        borderLeftWidth: 1,
        borderLeftColor: colors.gray[400],
        borderStyle: 'dashed',
        zIndex: -1,
    },
    cellBackground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -2,
    },
    currentTimeLine: {
        position: 'absolute',
        left: 60,
        right: 0,
        top: '50%',
        height: 1,
        backgroundColor: colors.error,
        zIndex: 10,
    },
});
