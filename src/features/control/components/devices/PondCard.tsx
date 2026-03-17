import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { DevicesItem } from './DevicesItem';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

import { DeviceStat, PondDeviceStats } from '../../types/control.types';

import { colors } from '@/styles';

// Use PNG images for performance (300x smaller than SVG with embedded raster)
const FanIcon = require('@/assets/Icon/IconDevices/Fan.png');
const FeederIcon = require('@/assets/Icon/IconDevices/Feeder.png');
const OxyIcon = require('@/assets/Icon/IconDevices/Oxy.png');
const SyphonIcon = require('@/assets/Icon/IconDevices/Syphon.png');
const PumpIcon = require('@/assets/Icon/IconDevices/Pump.png');

// Config for all device types
interface DeviceTypeConfig {
    key: keyof PondDeviceStats;
    label: string;
    icon: ImageSourcePropType;
}

const DEVICE_TYPES: DeviceTypeConfig[] = [
    { key: 'feeder', label: 'Máy cho ăn', icon: FeederIcon as ImageSourcePropType },
    { key: 'fan', label: 'Quạt nước', icon: FanIcon as ImageSourcePropType },
    { key: 'oxy', label: 'Máy Oxy', icon: OxyIcon as ImageSourcePropType },
    { key: 'syphon', label: 'Syphon', icon: SyphonIcon as ImageSourcePropType },
    { key: 'pump', label: 'Máy bơm', icon: PumpIcon as ImageSourcePropType },
];

/** Check if a DeviceStat has any devices */
const hasDevices = (stat?: DeviceStat): boolean => {
    if (!stat) return false;
    return stat.active + stat.warning + stat.inactive > 0;
};

interface PondCardProps {
    pondName: string;
    onPressDetail?: () => void;
    isEmpty?: boolean;
    deviceStats?: PondDeviceStats;
    compact?: boolean;
}

export const PondCard: React.FC<PondCardProps> = React.memo(
    ({ pondName, onPressDetail, isEmpty = false, deviceStats, compact = false }) => {
        // Filter to only device types that this pond actually has
        const visibleTypes = React.useMemo(() => {
            if (!deviceStats) return [];
            return DEVICE_TYPES.filter(dt => hasDevices(deviceStats[dt.key]));
        }, [deviceStats]);

        // Split into rows of 2
        const rows = React.useMemo(() => {
            const result: DeviceTypeConfig[][] = [];
            for (let i = 0; i < visibleTypes.length; i += 2) {
                result.push(visibleTypes.slice(i, i + 2));
            }
            return result;
        }, [visibleTypes]);

        return (
            <View style={styles.wrapper}>
                <View style={styles.header}>
                    <Text style={styles.title}>{pondName}</Text>
                    {!isEmpty && (
                        <TouchableOpacity onPress={onPressDetail} activeOpacity={0.7}>
                            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isEmpty ? (
                    <EmptyStateCard
                        message="Chưa có thiết bị nào được thêm."
                        style={styles.emptyDeviceContainer}
                    />
                ) : (
                    <View style={styles.gridContainer}>
                        {rows.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.gridRow}>
                                {row.map(dt => {
                                    const stat = deviceStats?.[dt.key];
                                    const isAlone = row.length === 1;
                                    return (
                                        <DevicesItem
                                            key={dt.key}
                                            icon={dt.icon}
                                            label={dt.label}
                                            activeCount={stat?.active}
                                            warningCount={stat?.warning}
                                            inactiveCount={stat?.inactive}
                                            style={isAlone ? styles.gridItemHalf : styles.gridItem}
                                            compact={compact}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray[900],
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    gridContainer: {
        gap: 10,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 10,
    },
    gridItem: {
        flex: 1,
    },
    gridItemHalf: {
        width: '48%',
    },
    emptyDeviceContainer: {
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 0,
    },
});
