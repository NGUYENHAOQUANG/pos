import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DevicesItem } from './DevicesItem';
import { EmptyDeviceState } from '../EmptyStateCard';

import { PondDeviceStats } from '../../types/control.types';

import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';

interface PondCardProps {
    pondName: string;
    onPressDetail?: () => void;
    isEmpty?: boolean;
    onAddDevice?: () => void;
    deviceStats?: PondDeviceStats;
}

export const PondCard: React.FC<PondCardProps> = ({
    pondName,
    onPressDetail,
    isEmpty = false,
    onAddDevice,
    deviceStats,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{pondName}</Text>
                {!isEmpty && (
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={onPressDetail}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isEmpty ? (
                <EmptyDeviceState onAddDevice={onAddDevice} />
            ) : (
                <View style={styles.devicesContainer}>
                    <DevicesItem
                        icon={FanIcon}
                        activeCount={deviceStats?.fan.active}
                        warningCount={deviceStats?.fan.warning}
                        inactiveCount={deviceStats?.fan.inactive}
                        style={styles.deviceItem}
                    />
                    <DevicesItem
                        icon={FeederIcon}
                        activeCount={deviceStats?.feeder.active}
                        warningCount={deviceStats?.feeder.warning}
                        inactiveCount={deviceStats?.feeder.inactive}
                        style={styles.deviceItem}
                    />
                    <DevicesItem
                        icon={OxyIcon}
                        activeCount={deviceStats?.oxy.active}
                        warningCount={deviceStats?.oxy.warning}
                        inactiveCount={deviceStats?.oxy.inactive}
                        style={styles.deviceItem}
                    />
                    <DevicesItem
                        icon={SyphonIcon}
                        activeCount={deviceStats?.syphon.active}
                        warningCount={deviceStats?.syphon.warning}
                        inactiveCount={deviceStats?.syphon.inactive}
                        style={styles.deviceItem}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16, // Add margin to space out from content below
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Darker separator line
        paddingBottom: 12,
        paddingHorizontal: 16,
        marginHorizontal: -16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    detailButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    devicesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8, // Using gap to space items
    },
    deviceItem: {
        flex: 1,
    },
});
