import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceCard } from '@/features/control/components/devices/Devices';
import { DeviceData } from '@/features/control/types/control.types';
import { ButtonControlSwitch } from '@/features/control/components/devices/ButtonControlSwitch';
import { spacing, colors } from '@/styles';

// Mock Data Removed

interface DevicesCardProps {
    title: string;
    devices?: DeviceData[]; // Optional now
    layout?: 'list' | 'grid';
    style?: import('react-native').ViewStyle;
    onToggle?: (id: string, val: boolean) => void;
    onSettingsPress?: (id: string) => void;
    onModePress?: (id: string) => void;
    // onMenuPress?: () => void; // Replaced by specific actions
    onSwitchToSchedule?: () => void;
    onSwitchToManual?: () => void;
    loadingIds?: Record<string, boolean>;
}

export const DevicesCard: React.FC<DevicesCardProps> = ({
    title,
    devices,
    layout = 'list',
    style,
    onToggle,
    onSettingsPress,
    onModePress,
    onSwitchToSchedule,
    onSwitchToManual,
    loadingIds = {},
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <ButtonControlSwitch
                    onSwitchToSchedule={onSwitchToSchedule}
                    onSwitchToManual={onSwitchToManual}
                />
            </View>

            <View style={layout === 'grid' ? styles.gridContainer : styles.listContainer}>
                {(devices || []).map(device => (
                    <DeviceCard
                        key={device.id}
                        data={device}
                        onToggle={(id, val) => onToggle?.(id, val)}
                        onSettingsPress={onSettingsPress}
                        onModePress={onModePress}
                        style={layout === 'grid' ? styles.gridItem : undefined}
                        isLoading={loadingIds[device.id]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 12,
        marginHorizontal: -16, // Pull the border to edges
        paddingHorizontal: 16, // Keep text and icon properly padded
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    menuButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    listContainer: {
        gap: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 12,
    },
});
