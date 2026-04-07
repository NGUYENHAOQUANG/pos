import React from 'react';
import { View, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

const FanIcon = require('@/assets/Icon/IconDevices/Fan.png');
const FeederIcon = require('@/assets/Icon/IconDevices/Feeder.png');
const OxyIcon = require('@/assets/Icon/IconDevices/Oxy.png');
const SyphonIcon = require('@/assets/Icon/IconDevices/Syphon.png');

// Device types
type DeviceType = 'fan' | 'feeder' | 'oxy' | 'syphon';
type DeviceStatus = 'default' | 'active' | 'warning';

interface DeviceColumn {
    type: DeviceType;
    count: number;
    status?: DeviceStatus;
}

interface ColumnProps {
    devices?: DeviceColumn[];
    timeSlots?: string[];
}

// Device icon mapping
const DEVICE_ICONS: Record<DeviceType, ImageSourcePropType> = {
    fan: FanIcon as ImageSourcePropType,
    feeder: FeederIcon as ImageSourcePropType,
    oxy: OxyIcon as ImageSourcePropType,
    syphon: SyphonIcon as ImageSourcePropType,
};

// Generate default time slots from 00:00 to 24:00 with 15 min intervals
const generateDefaultTimeSlots = (): string[] => {
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

const DEFAULT_TIME_SLOTS = generateDefaultTimeSlots();

const DEFAULT_DEVICES: DeviceColumn[] = [
    { type: 'feeder', count: 1, status: 'default' },
    { type: 'feeder', count: 1, status: 'active' },
    { type: 'feeder', count: 1, status: 'warning' },
];

export const Column: React.FC<ColumnProps> = ({
    devices = DEFAULT_DEVICES,
    timeSlots = DEFAULT_TIME_SLOTS,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Status color mapping
    const STATUS_COLORS: Record<DeviceStatus, string> = {
        default: theme.text,
        active: theme.primary,
        warning: theme.error,
    };

    return (
        <View style={styles.container}>
            {/* Header with device icons */}
            <View style={styles.header}>
                <View style={staticStyles.timeColumnHeader} />
                {devices.map((device, index) => {
                    const status = device.status || 'default';
                    const iconColor = STATUS_COLORS[status];
                    const iconSource = DEVICE_ICONS[device.type];
                    return (
                        <View key={index} style={staticStyles.deviceColumn}>
                            <Image
                                source={iconSource}
                                style={{ width: 24, height: 24 }}
                                resizeMode="contain"
                            />
                            <Text style={[staticStyles.deviceCount, { color: iconColor }]}>
                                {device.count}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Time slots */}
            <ScrollView style={staticStyles.scrollContainer} showsVerticalScrollIndicator={false}>
                {timeSlots.map((time, index) => {
                    const isFullHour = time.endsWith(':00');
                    return (
                        <View key={index} style={styles.timeRow}>
                            <Text style={[styles.timeText, isFullHour && styles.timeTextBold]}>
                                {time}
                            </Text>
                            {devices.map((_, deviceIndex) => (
                                <View key={deviceIndex} style={styles.scheduleCell}>
                                    <View style={styles.dashedLine} />
                                </View>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// Static styles
const staticStyles = StyleSheet.create({
    timeColumnHeader: {
        width: 50,
        marginRight: 30,
    },
    deviceColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceCount: {
        fontSize: 12,
        fontWeight: '400',
    },
    scrollContainer: {
        flex: 1,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderColor: theme.border,
            padding: spacing.sm,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        timeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 24,
            borderBottomWidth: 1,
            borderBottomColor: theme.gray[100],
            borderStyle: 'solid',
        },
        timeText: {
            width: 50,
            marginRight: 30,
            fontSize: 12,
            color: theme.textSecondary,
            paddingLeft: 4,
        },
        timeTextBold: {
            fontWeight: '600',
            color: theme.text,
        },
        scheduleCell: {
            flex: 1,
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: theme.gray[200],
            borderStyle: 'solid',
            position: 'relative',
        },
        dashedLine: {
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            borderLeftWidth: 1,
            borderLeftColor: theme.gray[200],
            borderStyle: 'dashed',
        },
    });
