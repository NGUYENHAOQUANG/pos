import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceCard } from './Devices';
import { EControlMode, DeviceData } from '../../types/control.types';
import { ButtonControlSwitch } from './ButtonControlSwitch';
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
}) => {
    // Determine initial data
    const initialData = devices || [];
    const [localDevices, setLocalDevices] = useState<DeviceData[]>(initialData);

    // Update local state if props change (optional, but good for robustness)
    useEffect(() => {
        if (devices) {
            setLocalDevices(devices);
        }
    }, [devices]);

    const handleToggle = (id: string, val: boolean) => {
        // Update local state
        setLocalDevices(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
        // Call parent handler if provided
        onToggle?.(id, val);
    };

    // Switch all devices to Schedule mode
    const handleSwitchAllToSchedule = () => {
        setLocalDevices(prev =>
            prev.map(d =>
                d.mode === EControlMode.LOCAL ? d : { ...d, mode: EControlMode.SCHEDULE }
            )
        );
        onSwitchToSchedule?.();
    };

    // Switch all devices to Manual mode
    const handleSwitchAllToManual = () => {
        setLocalDevices(prev =>
            prev.map(d => (d.mode === EControlMode.LOCAL ? d : { ...d, mode: EControlMode.MANUAL }))
        );
        onSwitchToManual?.();
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <ButtonControlSwitch
                    onSwitchToSchedule={handleSwitchAllToSchedule}
                    onSwitchToManual={handleSwitchAllToManual}
                />
            </View>

            <View style={layout === 'grid' ? styles.gridContainer : styles.listContainer}>
                {localDevices.map(device => (
                    <DeviceCard
                        key={device.id}
                        data={device}
                        onToggle={handleToggle}
                        onSettingsPress={onSettingsPress}
                        onModePress={onModePress}
                        style={layout === 'grid' ? styles.gridItem : undefined}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: spacing.md, // Spacing between cards
        // Shadow for the whole card
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 12,
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    menuButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
