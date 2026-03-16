import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceCard } from '@/features/control/components/devices/Devices';
import { DeviceData } from '@/features/control/types/control.types';
import { colors } from '@/styles';

interface DevicesCardProps {
    title: string;
    devices?: DeviceData[];
    style?: import('react-native').ViewStyle;
    onToggle?: (id: string, val: boolean) => void;
    onSettingsPress?: (id: string) => void;
    loadingIds?: Record<string, boolean>;
}

export const DevicesCard: React.FC<DevicesCardProps> = ({
    title,
    devices,
    style,
    onToggle,
    onSettingsPress,
    loadingIds = {},
}) => {
    return (
        <View style={[styles.container, style]}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Device List */}
            <View style={styles.listContainer}>
                {(devices || []).map(device => (
                    <DeviceCard
                        key={device.id}
                        data={device}
                        onToggle={(id, val) => onToggle?.(id, val)}
                        onSettingsPress={onSettingsPress}
                        isLoading={loadingIds[device.id]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
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
        color: colors.text,
    },
    listContainer: {
        gap: 10,
    },
});
