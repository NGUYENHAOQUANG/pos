import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DevicesItem } from './DevicesItem';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

import { PondDeviceStats } from '../../types/control.types';

import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';
import { borderRadius, colors } from '@/styles';

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
        <View style={styles.wrapper}>
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
                <EmptyStateCard
                    message="Chưa có thiết bị nào được thêm."
                    buttonTitle="Thêm thiết bị"
                    onPress={onAddDevice}
                    style={styles.emptyDeviceContainer}
                />
            ) : (
                <View style={styles.cardContainer}>
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
        fontWeight: '700',
        color: '#1F2937',
    },
    detailButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: 'white',
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    devicesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    deviceItem: {
        flex: 1,
    },
    emptyDeviceContainer: {
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 0,
    },
});
