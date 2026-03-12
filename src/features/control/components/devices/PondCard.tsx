import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DevicesItem } from './DevicesItem';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { SvgProps } from 'react-native-svg';

import { DeviceStat, PondDeviceStats } from '../../types/control.types';

import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';
import PumpIcon from '@/assets/Icon/IconDevices/Pump.svg';
import { colors } from '@/styles';

// Config for all device types
interface DeviceTypeConfig {
    key: keyof PondDeviceStats;
    label: string;
    icon: React.FC<SvgProps>;
}

const DEVICE_TYPES: DeviceTypeConfig[] = [
    { key: 'feeder', label: 'Máy cho ăn', icon: FeederIcon },
    { key: 'fan', label: 'Quạt nước', icon: FanIcon },
    { key: 'oxy', label: 'Máy Oxy', icon: OxyIcon },
    { key: 'syphon', label: 'Syphon', icon: SyphonIcon },
    { key: 'pump', label: 'Máy bơm', icon: PumpIcon },
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

export const PondCard: React.FC<PondCardProps> = ({
    pondName,
    onPressDetail,
    isEmpty = false,
    deviceStats,
    compact = false,
}) => {
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
};

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
