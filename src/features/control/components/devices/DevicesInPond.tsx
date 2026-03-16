import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { DeviceCard } from './Devices';
import { ButtonControlSwitch } from './ButtonControlSwitch'; // Assuming it's in the same folder or adjusted path
import { EControlMode, DeviceData } from '../../types/control.types';

export const DevicesInPond = () => {
    // Mock Data for Feeder Section
    const [feeders, setFeeders] = useState<DeviceData[]>([
        {
            id: 'f1',
            name: 'Máy cho ăn',

            mode: EControlMode.MANUAL,
            isOn: true,
            type: 'feeder',
        },
    ]);

    // Mock Data for Other Devices Section
    const [otherDevices, setOtherDevices] = useState<DeviceData[]>([
        {
            id: 'o1',
            name: 'Quạt nước 1',
            mode: EControlMode.SCHEDULE,
            isOn: true,
            type: 'fan',
        },
        {
            id: 'o2',
            name: 'Quạt nước 2 (Tại chỗ)',
            mode: EControlMode.LOCAL,
            isOn: true,
            type: 'fan',
        },
        {
            id: 'o3',
            name: 'Máy thổi khí',
            mode: EControlMode.SCHEDULE,
            isOn: true,
            errorMessage: 'Bị mất khí!',
            type: 'oxy',
        },
        {
            id: 'o4',
            name: 'Syphon',
            mode: EControlMode.SCHEDULE,
            isOn: false,
            type: 'syphon',
        },
    ]);

    const handleFeederToggle = (id: string, val: boolean) => {
        setFeeders(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
    };

    const handleOtherToggle = (id: string, val: boolean) => {
        setOtherDevices(prev => prev.map(d => (d.id === id ? { ...d, isOn: val } : d)));
    };

    return (
        <View style={styles.container}>
            {/* Feeder Section */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Máy cho ăn</Text>
                    <ButtonControlSwitch
                        onSwitchToManual={() =>
                            setFeeders(prev =>
                                prev.map(d =>
                                    d.mode === EControlMode.LOCAL
                                        ? d
                                        : { ...d, mode: EControlMode.MANUAL }
                                )
                            )
                        }
                        onSwitchToSchedule={() =>
                            setFeeders(prev =>
                                prev.map(d =>
                                    d.mode === EControlMode.LOCAL
                                        ? d
                                        : { ...d, mode: EControlMode.SCHEDULE }
                                )
                            )
                        }
                    />
                </View>
                <View style={styles.cardWrapper}>
                    {feeders.map(device => (
                        <DeviceCard key={device.id} data={device} onToggle={handleFeederToggle} />
                    ))}
                </View>
            </View>

            {/* Other Devices Section */}
            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Thiết bị khác</Text>
                    <ButtonControlSwitch
                        onSwitchToManual={() =>
                            setOtherDevices(prev =>
                                prev.map(d =>
                                    d.mode === EControlMode.LOCAL
                                        ? d
                                        : { ...d, mode: EControlMode.MANUAL }
                                )
                            )
                        }
                        onSwitchToSchedule={() =>
                            setOtherDevices(prev =>
                                prev.map(d =>
                                    d.mode === EControlMode.LOCAL
                                        ? d
                                        : { ...d, mode: EControlMode.SCHEDULE }
                                )
                            )
                        }
                    />
                </View>
                <View style={styles.gridContainer}>
                    {otherDevices.map(device => (
                        <View key={device.id} style={styles.gridItem}>
                            <DeviceCard data={device} onToggle={handleOtherToggle} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 24,
        paddingBottom: 24,
    },
    section: {
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4, // Align visually
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    cardWrapper: {
        // Just single item full width usually
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6, // Negative margin for grid gap compensation
    },
    gridItem: {
        width: '50%',
        padding: 6,
    },
});
