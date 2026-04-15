import React from 'react';
import { View, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ScheduleDescriptionTab } from './ScheduleDescriptionTab';
import { ScheduleActivityPill } from './ScheduleActivityPill';

const FanIcon = require('@/assets/Icon/IconDevices/Fan.png');
const FeederIcon = require('@/assets/Icon/IconDevices/Feeder.png');
const OxyIcon = require('@/assets/Icon/IconDevices/Oxy.png');
const SyphonIcon = require('@/assets/Icon/IconDevices/Syphon.png');
const PumpIcon = require('@/assets/Icon/IconDevices/Pump.png');
const WrapperIcon = require('@/assets/Icon/IconDevices/wrapper.png');

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon' | 'pump' | 'wrapper';

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
const DEVICE_ICONS: Record<DeviceType, ImageSourcePropType> = {
    fan: FanIcon as ImageSourcePropType,
    feeder: FeederIcon as ImageSourcePropType,
    oxy: OxyIcon as ImageSourcePropType,
    syphon: SyphonIcon as ImageSourcePropType,
    pump: PumpIcon as ImageSourcePropType,
    wrapper: WrapperIcon as ImageSourcePropType,
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

// Helper to get background color based on device mode history
const getBackgroundColor = (device: DeviceColumnData, time: string, theme: Colors): string => {
    if (!device.modeHistory || device.modeHistory.length === 0) {
        return theme.background;
    }

    const slotMinutes = timeToMinutes(time);

    const activeMode = device.modeHistory.find(slot => {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        return slotMinutes >= start && slotMinutes < end;
    });

    if (!activeMode) return theme.background;

    switch (activeMode.mode) {
        case 'remote':
            return theme.schedule.remote;
        case 'schedule':
            return theme.schedule.schedule;
        case 'local':
            return theme.schedule.local;
        default:
            return theme.background;
    }
};

export const HistoryActivitie: React.FC<HistoryActivitieProps> = ({
    devices = DEFAULT_DEVICES,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return (
        <View style={styles.container}>
            <ScheduleDescriptionTab type="history" />

            <View style={staticStyles.tableContainer}>
                <View style={styles.header}>
                    <View style={styles.timeColumnHeader} />
                    {devices.map((device, index) => {
                        const iconColor = device.color || theme.primary;
                        const iconSource = DEVICE_ICONS[device.type];
                        return (
                            <View key={index} style={styles.deviceColumn}>
                                <Image
                                    source={iconSource}
                                    style={{ width: 32, height: 32 }}
                                    resizeMode="contain"
                                />
                                <Text style={[staticStyles.deviceCount, { color: iconColor }]}>
                                    {device.count}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <ScrollView
                    style={staticStyles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {DEFAULT_TIME_SLOTS.map((time, index) => {
                        const isFullHour = time.endsWith(':00');
                        const [slotHour, slotMinute] = time.split(':').map(Number);
                        const slotTotalMinutes = slotHour * 60 + slotMinute;
                        const isCurrentSlot =
                            currentTotalMinutes >= slotTotalMinutes &&
                            currentTotalMinutes < slotTotalMinutes + 15;
                        const minutesIntoSlot = currentTotalMinutes - slotTotalMinutes;
                        const topOffset = (minutesIntoSlot / 15) * 20;

                        return (
                            <View key={index} style={staticStyles.timeRow}>
                                <View style={styles.timeColumn}>
                                    <Text
                                        style={[styles.timeText, isFullHour && styles.timeTextBold]}
                                    >
                                        {time}
                                    </Text>
                                    <View style={styles.timeTick} />
                                </View>

                                {devices.map((device, deviceIndex) => {
                                    const deviceActivities = device.activities || [];
                                    const showIndicator = hasActivity(time, deviceActivities);
                                    const backgroundColor = getBackgroundColor(device, time, theme);

                                    const prevTime =
                                        index > 0 ? DEFAULT_TIME_SLOTS[index - 1] : null;
                                    const nextTime =
                                        index < DEFAULT_TIME_SLOTS.length - 1
                                            ? DEFAULT_TIME_SLOTS[index + 1]
                                            : null;

                                    const prevBg = prevTime
                                        ? getBackgroundColor(device, prevTime, theme)
                                        : null;
                                    const nextBg = nextTime
                                        ? getBackgroundColor(device, nextTime, theme)
                                        : null;

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
                                            <View
                                                style={[
                                                    staticStyles.cellBackground,
                                                    { backgroundColor },
                                                ]}
                                            />
                                            <View style={styles.horizontalLine} />
                                            <View style={styles.dashedLine} />
                                            <ScheduleActivityPill
                                                isActive={showIndicator}
                                                isPrevActive={isPrevActive}
                                                isNextActive={isNextActive}
                                            />
                                        </View>
                                    );
                                })}

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

// Static styles
const staticStyles = StyleSheet.create({
    tableContainer: {
        flex: 1,
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
    cellBackground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -2,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
            borderRadius: 16,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
            paddingTop: spacing.md,
            gap: spacing.md,
            borderWidth: 1,
            borderColor: theme.border,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        timeColumnHeader: {
            width: 60,
            borderRightWidth: 1,
            borderRightColor: theme.gray[300],
        },
        deviceColumn: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRightWidth: 1,
            borderRightColor: theme.gray[300],
            paddingBottom: spacing.sm,
        },
        timeColumn: {
            width: 60,
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: theme.gray[300],
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        timeText: {
            fontSize: 11,
            color: theme.textSecondary,
            textAlign: 'center',
        },
        timeTick: {
            position: 'absolute',
            right: 0,
            top: '50%',
            width: 6,
            height: 1,
            backgroundColor: theme.gray[300],
        },
        timeTextBold: {
            fontWeight: '600',
            color: theme.text,
        },
        gridCell: {
            flex: 1,
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: theme.gray[400],
            position: 'relative',
        },
        horizontalLine: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 1,
            backgroundColor: theme.gray[400],
            zIndex: -1,
        },
        dashedLine: {
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            borderLeftWidth: 1,
            borderLeftColor: theme.gray[400],
            borderStyle: 'dashed',
            zIndex: -1,
        },
        currentTimeLine: {
            position: 'absolute',
            left: 60,
            right: 0,
            top: '50%',
            height: 1,
            backgroundColor: theme.error,
            zIndex: 10,
        },
    });
