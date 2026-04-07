import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { DeviceCard } from '@/features/control/components/devices/Devices';
import { DeviceData } from '@/features/control/types/control.types';
import { useAppTheme } from '@/styles/themeContext';

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
    const theme = useAppTheme();

    return (
        <View style={[styles.container, style]}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
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
    },
    listContainer: {
        gap: 10,
    },
});
